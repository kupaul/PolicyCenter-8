package gw.plugin.diff.impl

uses gw.api.diff.DiffAdd
uses gw.api.diff.DiffItem
uses gw.api.diff.DiffProperty
uses gw.api.diff.DiffUtils
uses gw.api.logicalmatch.EffDatedLogicalMatcher
uses gw.api.tree.RowTreeRootNode
uses gw.api.web.util.DateRangeUtil
uses gw.diff.tree.DiffTree
uses gw.plugin.diff.IPolicyPeriodDiffPlugin

uses java.util.ArrayList
uses java.util.List

/**
  * All these methods are invoked from Java.
  */

@Export
class PolicyPeriodDiffPlugin implements IPolicyPeriodDiffPlugin {
  
  construct() 
  {
  }
  
  /**
   * Compare two policy periods, returning a list of DiffItems representing the
   * differences between them. This method is called in 3 places: <ol>
   * <li>Multi-quote
   * <li>Comparing PolicyPeriods of a Policy
   * <li>Comparing Jobs of a Policy
   * </ol><p>
   * An implementation of this method would walk the
   * PolicyPeriods graphs comparing fields on related beans within the graphs.
   * Fields don't necessarily need to be different, you could highlight the fact
   * that two fields are the same across periods.
   * <p>
   * To add a new item create a new instance of DiffProperty, DiffAdd, or
   * DiffRemove. When creating a new DiffProperty use the bean from p1 as the
   * original bean, and the bean from p2 as the new bean. A DiffAdd
   * designated that the bean exists in p2 but not in p1. A DiffRemove
   * designates that the bean exists in p1 but not in p2. You can use utilities
   * found on DiffUtils to help you compare beans or bean graphs.
   *
   * @param reason Reason for calling Diff code
   * @param p1 "source" PolicyPeriod 
   * @param p2 PolicyPeriod to compare against
   * @return A list of DiffItems that represents the differences between the
   */
  public override function compareBranches(reason : DiffReason, p1 : PolicyPeriod, p2 : PolicyPeriod) : List<DiffItem> {
    var diffItems = new ArrayList<DiffItem>()
    var diffHelper : DiffHelper

    p1.AllAccountSyncables.each(\ a -> a.prepareForDiff())
    p2.AllAccountSyncables.each(\ a -> a.prepareForDiff())
    
    // Add diffs for PolicyPeriod attributes
    if (p2.Renewal == null and reason != null) {
      diffItems = addPolicyPeriodDiffItems(p2, p1, reason, diffItems) as ArrayList<DiffItem>
    }
    
    // Add diffs by line of business
    for (line1 in p1.Lines){
      var line2 = p2.Lines.firstWhere( \ l -> l.Subtype.Code == line1.Subtype.Code )
      if (line2 != null) {
        diffHelper = line1.createPolicyLineDiffHelper(reason, line2)
        if (diffHelper != null) {
          diffItems = diffHelper.addDiffItems(diffItems) as ArrayList<DiffItem>
          diffItems = diffHelper.filterDiffItems(diffItems) as ArrayList<DiffItem>
        }
      }
    }
    return new ArrayList<DiffItem>(diffItems.order())
  } 
  
  /**
   * Filters a list of DiffItems that originates from the database. This method
   * is called in 4 places:<ol>
   * <li>Displaying differences between a PolicyPeriod and its based on
   * PolicyPeriods during a policy change
   * <li>To determine out-of-sequence transaction conflicts on a PolicyPeriod
   * <li>To determine preemption conflicts on a PolicyPeriod
   * <li>To determine the changes to communicate to
   * an integration point when a new PolicyPeriod is bound
   * </ol><p>
   * The input set of DiffItems is derived from the database and therefore
   * represents a database POV of these changes. By filtering the items you
   * can provide a more intuitive summary of the differences. See the Difference
   * class for how these DiffItems are displayed in the UI.
   *
   * @param reason Reason for calling Diff code
   * @currentPeriod PolicyPeriod associated with the DiffItems
   * @param items Original set of DiffItems
   * @return A filtered, ordered list of DiffItems.
   */   
  public override function filterDiffItems(reason : DiffReason, currentPeriod : PolicyPeriod, diffItems : List<DiffItem>) : List<DiffItem> {
    var diffHelper : DiffHelper
    
    if (reason == DiffReason.TC_FINDDUPLICATES) {
      diffItems.removeWhere(\ d -> not (d typeis DiffAdd and 
            (d.EffDatedBean typeis EffDatedLogicalMatcher and not d.EffDatedBean.findMatchesInPeriodUntyped(currentPeriod, false).Empty)))
    } else if (reason == DiffReason.TC_EXPIRATIONDATECHECK) {
      diffItems = diffItems.where(\ d -> d typeis DiffAdd or d typeis DiffProperty)
      // only need 1 entry per changed bean
      var tmpMap = diffItems.partition(\ d -> d.EffDatedBean)
      var consolidatedDiffItems = new ArrayList<DiffItem>()
      tmpMap.eachValue(\ e -> consolidatedDiffItems.add(e.first()))
      diffItems = consolidatedDiffItems
    } else if (reason != DiffReason.TC_INTEGRATION and 
        reason != DiffReason.TC_APPLYCHANGES) {
          
      // Add diffs for PolicyPeriod attributes
      if (currentPeriod.Renewal == null and reason != null) {
        diffItems = addPolicyPeriodDiffItems(currentPeriod, currentPeriod.BasedOn, reason, diffItems)
      }
      
      // Filter diffs by LOB if this is not for integration or OOS
      for (line1 in currentPeriod.BasedOn.Lines){
        var line2 = currentPeriod.Lines.firstWhere( \ p -> p.Subtype.Code == line1.Subtype.Code )
        if (line2 != null) {
          diffHelper = line1.createPolicyLineDiffHelper(reason, line2)
          if (diffHelper != null) {
            diffItems = diffHelper.filterDiffItems(diffItems)
          }
        }
      }
      
      // Remove PolicyPeriod attribute diffs if this is a rewrite job
      if (currentPeriod.Rewrite != null) {
        diffItems.removeWhere( \ d -> d.Bean typeis PolicyPeriod )
      }
    } 
    
    // Filter specific diffs for OOS
    if (reason == DiffReason.TC_APPLYCHANGES) {
      diffHelper = new DiffHelper(reason, null, null)
      diffItems = diffHelper.filterDiffItems(diffItems)
    }
    return new ArrayList<DiffItem>(diffItems.order())
  }
  
  /**
   * @return Name of the file to use for the difference tree configuration, or <code>null</code> if none exists.
   */
  @Deprecated("Use Product.DiffTreeConfig. Deprecated in 8.0.0")
  static function getDiffTreeConfig(policyPeriod : PolicyPeriod) : String {
    return policyPeriod.Policy.Product.DiffTreeConfig
  }

  /**
   * For policy review diff pages, create the root tree node which is used for 
   * displaying the diff tree, 
   * @param policyPeriod - the current policy period
   * @return RowTreeRootNode - the root node of the diff tree
   */
  @Deprecated("Use DiffTree.recalculateRootNodeForPolicyReview(PolicyPeriod). Deprecated in 8.0.0")
  static function recalculateRootNodeForPolicyReview(policyPeriod : PolicyPeriod) : RowTreeRootNode {
    return DiffTree.recalculateRootNodeForPolicyReview(policyPeriod)
  }

  @Deprecated("Use DiffTree.recalculateRootNodeForPreemptionConflicts(PolicyPeriod, DiffItem[]). Deprecated in 8.0.0")
  static function recalculateRootNodeForPreemptionConflicts(policyPeriod : PolicyPeriod, diffItems : DiffItem[]) : RowTreeRootNode {
    return DiffTree.recalculateRootNodeForPreemptionConflicts(policyPeriod, diffItems)
  }
  
  /**
   * Create the root tree node which is used for displaying the diff tree, based
   * on a particular diff reason
   * @param p1         - the first policy period that we're comparing
   * @param p2         - the second policy period that we're comparing
   * @param diffReason - the reason used to generate the diffs. 
   * @return RowTreeRootNode - the root node of the diff tree
   */
  @Deprecated("Use DiffTree.recalculateRootNode(PolicyPeriod, PolicyPeriod, DiffReason). Deprecated in 8.0.0")
  static function recalculateRootNode(p1 : PolicyPeriod, p2 : PolicyPeriod, diffReason : DiffReason) : RowTreeRootNode {
    return DiffTree.recalculateRootNode(p1, p2, diffReason)
  }
  
  /**
   * Entities that hang directly off of PolicyPeriod are not diffed, add these manually here
   * @param currentPeriod - the current policy period
   * @param basedOnPeriod - the current policy period's based on period
   * @param diffReason - the reason used to generate the diffs. 
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  function addPolicyPeriodDiffItems(currentPeriod : PolicyPeriod, basedOnPeriod : PolicyPeriod, reason : DiffReason, diffItems : List<DiffItem>) : List<DiffItem>{
    // Ensure diffs are against the correct slice for policy reviews
    if (reason == DiffReason.TC_POLICYREVIEW) {
      var periodRange = DateRangeUtil.allDatesBetween(basedOnPeriod.PeriodStart, basedOnPeriod.PeriodEnd)
      if (periodRange.includes(currentPeriod.EditEffectiveDate)) {
        basedOnPeriod = basedOnPeriod.getSlice(currentPeriod.EditEffectiveDate)  
      } else {
        basedOnPeriod = basedOnPeriod.LatestPeriod    
      }
    }
    
    if (currentPeriod.ProducerCodeOfRecord != basedOnPeriod.ProducerCodeOfRecord) {
      diffItems.add(new DiffProperty(currentPeriod, basedOnPeriod, PolicyPeriod.Type.TypeInfo.getProperty( "ProducerCodeOfRecord" )))
    }   
      
    if (currentPeriod.Offering != basedOnPeriod.Offering) {
      var newItems = new DiffUtils(new PCBeanMatcher()).compareField(basedOnPeriod, currentPeriod, PolicyPeriod.Type.TypeInfo.getProperty("EffectiveDatedFields"), 1)
      diffItems.addAll(newItems)
    } 
    
    // Add Term Type, PeriodStart/PeriodEnd diff items
    if (currentPeriod.PeriodStart != basedOnPeriod.PeriodStart) {
      diffItems.add(new DiffProperty(currentPeriod, basedOnPeriod, PolicyPeriod.Type.TypeInfo.getProperty("PeriodStart")))
    }  
    if (currentPeriod.PeriodEnd != basedOnPeriod.PeriodEnd) {
      diffItems.add(new DiffProperty(currentPeriod, basedOnPeriod, PolicyPeriod.Type.TypeInfo.getProperty("PeriodEnd")))
    }

    // Add Base State to diffs
    if (currentPeriod.BaseState != basedOnPeriod.BaseState) {
      diffItems.add(new DiffProperty(currentPeriod, basedOnPeriod, PolicyPeriod.Type.TypeInfo.getProperty("BaseState")))
    }

    // Add Product Modifiers to diffs
    diffItems.addAll(new DiffUtils(new PCBeanMatcher()).compareField(basedOnPeriod.EffectiveDatedFields, currentPeriod.EffectiveDatedFields, EffectiveDatedFields.Type.TypeInfo.getProperty("ProductModifiers"), 2))
    
    return diffItems
  }
  
}
