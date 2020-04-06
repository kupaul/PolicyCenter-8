package gw.plugin.diff.impl

uses gw.api.diff.DiffItem
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.IType
uses gw.api.diff.DiffRemove
uses gw.api.diff.DiffAdd
uses gw.api.diff.DiffUtils
uses gw.entity.IEntityType
uses java.util.ArrayList
uses gw.lob.common.schedule.AbstractScheduleHelper
uses java.util.HashMap

/**
 * Base helper class for adding and filtering diff items
 * 
 * @param <L extends entity.PolicyLine> a concrete type that extends {@link entity.PolicyLine}, e.g. {@link CommercialPropertyLine}
 */
@Export
class DiffHelper <L extends entity.PolicyLine> extends DiffHelperBase {
  
  private var _diffUtils : DiffUtils as readonly DiffUtils
  private var _line1 : L as Line1
  private var _line2 : L as Line2  
  private var _reason : DiffReason as readonly DifferenceReason
  
  construct(diffReason : DiffReason, polLine1 : L, polLine2 : L) {
    _line1 = polLine1
    _line2 = polLine2
    _diffUtils = new DiffUtils(new PCBeanMatcher())
    _reason = diffReason
  }

  /**
   * Adds generic diff items that applies to all lines of business, i.e., primary named
   * insured information.
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    PropertiesToAdd.each(\ prop -> diffItems.addAll(comparePolicyPeriodField(prop, 2)))
    diffItems.addAll(compareEffectiveDatedFields("PolicyAddress", 2))
    return diffItems.toSet().toList()
  }

  /**
   * Filters diff items that apply to all lines of business, i.e., primary named
   * insured information.
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem>{
    // Filter same removed then re-added entities
    RemoveReAddedTypesToFilter.each(\ type -> filterRemovedThenReAddedItems(type, diffItems))
    diffItems.removeWhere(\ d -> !shouldKeep(d))
    if (DifferenceReason != DiffReason.TC_APPLYCHANGES) {
      // Manually add secondary named insureds
      addSecondaryNamedInsuredDiffItems(diffItems)    
    }
    return diffItems.toSet().toList()
  }
  
 /**
   * Checks the type of bean contained within a diff item, and figures
   * out whether or not the diff item should be kept
   */
  private function shouldKeep(diffItem : DiffItem) : boolean {
    // Only do filtering if the reason is not for integration
    if (DifferenceReason!= typekey.DiffReason.TC_INTEGRATION) {
      if (DifferenceReason == typekey.DiffReason.TC_POLICYREVIEW or DifferenceReason == typekey.DiffReason.TC_COMPAREJOBS or DifferenceReason == typekey.DiffReason.TC_MULTIVERSIONJOB) {
        if (diffItem.Bean typeis PACost) { 
          // Keep PACost diffs if it is an add/remove, otherwise only keep it if the property name is ActualAmount for policy reivew, compare jobs, or multi-version
          return handlePACostDiffItems(diffItem)
        }
      }

      if (DifferenceReason == typekey.DiffReason.TC_POLICYREVIEW) {
        // Only filter out add/removes of PolicyAddlInsured for PolicyReview
        if (diffItem.Bean typeis PolicyAddlInsured and (diffItem.Add or diffItem.Remove)) {
          return false
        }
      } 

      // Filter out the below diffs if the reason is anything other than integration      
      if (TypesToFilterForDiffReasonsExceptIntegration.hasMatch(\ typeToFilter -> typeToFilter.isAssignableFrom(typeof diffItem.Bean))) {
        return false
      } else if (diffItem.Property) {
        var propInfo = diffItem.asProperty().PropertyInfo
        if (PropertiesToFilter.contains(propInfo.Name)) {
          return false
        } else if (propInfo.FeatureType == AutoNumberSequence) {
          return false
        } else if (diffItem.Bean typeis PolicyAddress and propInfo.Name == "Address") {
          return false
        } else if (diffItem.Bean typeis Reinsurable and propInfo.Name == "TotalInsuredValue") {
          return false
        } else if (diffItem.Bean typeis Modifier and propInfo.Name == "RateModifier") {
          if (diffItem.Bean.ScheduleRate) return false
        }
      } else if ((diffItem.Bean typeis RatingPeriodStartDate) and (diffItem.Bean.Type) == RPSDType.TC_AUDIT) {
        return false // Remove audit RPSDs, which are added manually when handling preemptions
      }
      
      // Filter out the below diffs if the reason is anything other than integration/OOS/Preemption
      if (DifferenceReason != typekey.DiffReason.TC_APPLYCHANGES) {
        if (TypesToFilterForDiffReasonsExceptApplyChanges.hasMatch(\ typeToFilter -> typeToFilter.isAssignableFrom(typeof diffItem.Bean))) {
          return false
        } else if (diffItem.Bean typeis TerritoryCode and (diffItem.Add or diffItem.Remove)) {
          return false
        } else if (diffItem.Property) {
          var propInfo = diffItem.asProperty().PropertyInfo
          if (propInfo.FeatureType == PolicyPeriod) return false
          // Remove auto generated secondary named insured diffs
          if (diffItem.Bean typeis EffectiveDatedFields and propInfo.Name == "SecondaryNamedInsured") return false
        }
      }
    }   
    return true
  }

  private function handlePACostDiffItems(diffItem : DiffItem) : boolean {
    if ((diffItem.Property and diffItem.asProperty().PropertyInfo.Name == "ActualAmount") or
        (diffItem.Add or diffItem.Remove)) {
      return true
    }
    return false
  }

  private function addSecondaryNamedInsuredDiffItems(diffItems : List<DiffItem>) {
    createDiffsForEntity(diffItems, Line1.Branch.EffectiveDatedFields.SecondaryNamedInsured, Line2.Branch.EffectiveDatedFields.SecondaryNamedInsured)
  }

  /**
   * @param diffItems - Current list of diff items to modify
   * @param getSplittables - The list of entities that can be split
   * @param getKey - The key that we're using to partition the list of entities
   * @return List<DiffItem>
   */
  final function addSplittableDiffs<S extends EffDated, K>(diffItems : List<DiffItem>,
          getSplittables(line : L) : List<S>, getKey(splittable : S) : K) : List<DiffItem> {
    // Combine the version lists in the compared lines
    var splittables1 = getSplittables(Line1).partition(\ e -> getKey(e))
    var splittables2 = getSplittables(Line2).partition(\ e -> getKey(e))
    splittables1.eachValue(\ l -> l.sortBy(\ splittable1 -> splittable1.EffectiveDate))
    splittables2.eachValue(\ l -> l.sortBy(\ splittable2 -> splittable2.EffectiveDate))
    var allKeys = splittables1.Keys.union(splittables2.Keys)

    for (key in allKeys) {
      // Get the entities using the key in the compared lines
      var splittableList1 = splittables1.get(key)
      var splittableList2 = splittables2.get(key)
      if (splittableList1.Count == 0) {
        // This is a completely new entity (not an existing entity that was split)
        splittableList2.each(\ splittable2 -> diffItems.add(new DiffAdd(splittable2)))
      } else if (splittableList2.Count == 0) {
        // This entity has been completely removed
        splittableList1.each(\ splittable1 -> diffItems.add(new DiffRemove(splittable1)))
      } else if (splittableList1.Count != 0 and splittableList2.Count != 0) {
        var highestListCount = splittableList2.Count
        var useList2Count = true
        if (splittableList1.Count > splittableList2.Count) {
          highestListCount = splittableList1.Count
          useList2Count = false
        }
        // Compare the splittables for both lists
        for (i in 0..|highestListCount) {
          if ((useList2Count and i < splittableList1.Count) or
              (!useList2Count and i < splittableList2.Count)) {
            diffItems.addAll(DiffUtils.compareBeans(splittableList1.get(i), splittableList2.get(i), 0))
          } else if (useList2Count and i >= splittableList1.Count){
            diffItems.addAll(DiffUtils.compareBeans(splittableList1.get(splittableList1.Count-1), splittableList2.get(i), 0))
          } else if (!useList2Count and i >= splittableList2.Count) {
            // Create a DiffRemove for all splittables in list1 since the length of list1 > list2
            diffItems.add(new DiffRemove(splittableList1.get(i)))
          }
        }
      }
    }
    return diffItems
  }

  /**
   * This function allows you to manually create diffs for a particular entity
   * @param diffItems - Current list of diff items to modify
   * @param entity1 - The first entity to compare
   * @param entity2 - The second entity to compare
   * @returns List<DiffItem>
   */
  final function createDiffsForEntity<S extends EffDated>(diffItems : List<DiffItem>, entity1 : S, entity2 : S) : List<DiffItem>{
    if (entity1 == null and entity2 != null) {
      diffItems.add(new DiffAdd(entity2))
    } else if (entity1 != null and entity2 == null) {
      diffItems.add(new DiffRemove(entity1))
    } else if (entity1 != null and entity2 != null) {
      diffItems.addAll(DiffUtils.compareBeans(entity1, entity2, 1))
    }
    return diffItems
  }

  final function getTypeProperty(type : IType, propName : String) : IPropertyInfo {
    return type.TypeInfo.getProperty(propName)
  }

  /**
   * Gets a list of diff items by comparing the specified property from the compared policy lines.
   */
  final function compareLineField(propName : String, depth : int) : List<DiffItem> {
    return DiffUtils.compareField(Line1, Line2, getTypeProperty(L, propName), depth)
  }

  /**
   * Gets a list of diff items by comparing the specified property from the compared policy periods.
   */
  final function comparePolicyPeriodField(propName : String, depth : int) : List<DiffItem> {
    return DiffUtils.compareField(Line1.Branch, Line2.Branch, getTypeProperty(PolicyPeriod, propName), depth)
  } 
  
  /**
   * Gets a list of diff items by comparing the specified property from the compared EffectiveDatedFields.
   */
  final function compareEffectiveDatedFields(propName : String, depth : int) : List<DiffItem> {
    return DiffUtils.compareField(Line1.Branch.EffectiveDatedFields, Line2.Branch.EffectiveDatedFields, getTypeProperty(EffectiveDatedFields, propName), depth)
  }

  /**
   * Filters diff items that are not really differences, ie., if the same coverage has been
   * removed and readded in the same transaction
   */
  final function filterRemovedThenReAddedItems(type : IEntityType, diffItems : List<DiffItem>) : List<DiffItem> {
    // Ignore contact changes
    DiffUtils.excludeField( AccountContact.Type.TypeInfo.getProperty( "Contact" ))
    DiffUtils.excludeField( AccountLocation.Type.TypeInfo.getProperty( "Location" ))

    var matchingDiffTypes = diffItems.where( \ d -> type.isAssignableFrom(typeof d.Bean))
    var addedItems = matchingDiffTypes.where( \ d -> d.Add)
    var removedItems = matchingDiffTypes.where( \ d -> d.Remove)

    var itemsToFilter = new ArrayList<DiffItem>()
    var changedProperties = new ArrayList<DiffItem>()
    for (addedItem in addedItems) {
      // Find removed items that match the added item (only get first)
      var removedItem = removedItems.firstWhere( \ d -> DiffUtils.doBeansMatch( addedItem.Bean, d.Bean))
      if (removedItem != null) {
        if (removedItem.EffDated) {
          if (addedItem.EffDatedBean.EffectiveDate != removedItem.EffDatedBean.ExpirationDate) {
            // If the added and removed items don't have the same effective date the don't cancel them out.
            continue
          }
        }
        itemsToFilter.add( removedItem )
        itemsToFilter.add( addedItem )

        // If fields are different between the added and removed items then include them as property diffs
        // If this is an eff dated bean then we want to compare against the original version of the removed
        // bean.
        var originalRemovedBean = removedItem.Bean
        if (removedItem.EffDated) {
          originalRemovedBean = removedItem.EffDatedBean.BasedOnUntyped
        }
        var fieldDiffs = DiffUtils.compareBeans( originalRemovedBean, addedItem.Bean, 10)
        changedProperties.addAll( fieldDiffs )
      }
    }

    // filter out the duplicate items (if any)
    diffItems.removeAll( itemsToFilter )

    // add the changed fields (if any)
    diffItems.addAll( changedProperties )
    return diffItems
  }


  /**
   * Add a list of differences from items that have changed in schedules
   */
 final function addScheduledItemClauses(helper : AbstractScheduleHelper, diffItems : List<DiffItem>) : List<DiffItem> {
    var scheduleItemsLine1 = helper.getScheduledItemsForPolicyLine(Line1).where(\ item -> item.ScheduleParent.ScheduledItemMultiPatterns != null)
    var scheduleItemsLine2 = helper.getScheduledItemsForPolicyLine(Line2).where(\ item -> item.ScheduleParent.ScheduledItemMultiPatterns != null)

    var items1FixedIds = new HashMap<Key, ScheduledItem>()
    scheduleItemsLine1.each(\ c -> {
        items1FixedIds.put((c as EffDated).FixedId, c)
      })

    var items2FixedIds = new HashMap<Key, ScheduledItem>()
    scheduleItemsLine2.each(\ item2Elt -> {
        var key = (item2Elt as EffDated).FixedId
        items2FixedIds.put(key, item2Elt)
        var item1Match = items1FixedIds.get(key)
        if (item1Match != null){
          //Match Found
          //  Potentially create diff properties
          var item1 = item1Match
          var item2 = item2Elt
          var clause1 = item1.Clause
          var clause2 = item2.Clause

          var compareDiffs = DiffUtils.compareBeans(clause1, clause2, 0)
          diffItems.addAll(compareDiffs)
        } else {
          //Add Case
          //  Item exists in line2, but not line1.
          var clause = item2Elt.Clause
          diffItems.add(new DiffAdd(clause))
        }
      })

    for (anId in items1FixedIds.Keys){
      if (not (items2FixedIds.containsKey(anId))) {
        //Remove Case
        //  Item exists in line1, but not line2.
        var item = items1FixedIds.get(anId)
        var clause =item.Clause
        diffItems.add(new DiffRemove(clause))
      }
    }
    return diffItems
  }
}