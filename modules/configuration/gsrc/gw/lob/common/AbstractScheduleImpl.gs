package gw.lob.common

uses entity.KeyableBean
uses java.lang.String
uses gw.api.productmodel.Schedule
uses gw.api.productmodel.SchedulePropertyInfo
uses java.lang.IllegalStateException
uses gw.api.productmodel.ClausePattern
uses gw.pl.persistence.core.Bundle
uses gw.lang.reflect.IPropertyInfo
uses java.util.Map
uses gw.api.productmodel.ScheduleTypeKeyPropertyInfo
uses gw.entity.TypeKey
uses gw.api.util.DisplayableException

/**
 * Abstract implementation of the Schedule interface. Also provides implementation for ScheduleAutoNumberSequence
 */
@Export
abstract class AbstractScheduleImpl<T extends ScheduleAutoNumberSequence> implements Schedule {

  var _owner : T as Owner
  var _propertyInfoMap : Map<String, SchedulePropertyInfo> as PropertyInfoMap
  
  construct(delegateOwner : T) {
    Owner = delegateOwner
    PropertyInfoMap = PropertyInfos.partitionUniquely(\ propInfo -> propInfo.PropertyInfo.Name)
  }

  override property get MostDescriptivePropertyInfo() : SchedulePropertyInfo {
    if (PropertyInfoMap.get("StringCol1") != null) {
      return PropertyInfoMap.get("StringCol1")
    } else if (PropertyInfoMap.get("NamedInsured") != null) {
      return PropertyInfoMap.get("NamedInsured")
    } else if (PropertyInfoMap.get("TypeKeyCol1") != null) {
      return PropertyInfoMap.get("TypeKeyCol1")
    } else if (PropertyInfoMap.get("IntCol1") != null) {
      return PropertyInfoMap.get("IntCol1") 
    } else if (PropertyInfoMap.get("PosIntCol1") != null) {
      return PropertyInfoMap.get("PosIntCol1")
    } else if (PropertyInfoMap.get("DateCol1") != null) {
      return PropertyInfoMap.get("DateCol1")
    }
    return null
  } 
  
  override property get ScheduleName() : String {
    return Owner.DisplayName  
  }

  override property get PropertyInfos() : SchedulePropertyInfo[] {
    // Subtypes need to handle specific patterns
    throw new IllegalStateException("Unknown pattern type")
  }

  @Deprecated("PC8.0. Deprecated inPolicyCenter 8.0. Please use the ScheduledItemMultiPatterns even for a single pattern.")
  override property get ScheduledItemPattern() : ClausePattern {
    // Backward compatible until we remove
    return ScheduledItemMultiPatterns == null
      ? null
      : ScheduledItemMultiPatterns.single()
  }

  override property get ScheduledItemMultiPatterns() : ClausePattern[] {
    // Simple schedules without cov terms do not have a pattern
    return null
  }

  protected function initializeScheduledItem(scheduledItem : Coverable & ScheduledItem) {
    if (ScheduledItemMultiPatterns != null) {
      scheduledItem.createCoverageConditionOrExclusion(ScheduledItemMultiPatterns.single())
    }
  }
  
  override function renumberAutoNumberSequence() {
    if (Owner.ScheduleAutoNumberSeq != null) { //this could be null if the schedule doesn't have scheduled items
      Owner.ScheduleAutoNumberSeq.renumber(CurrentAndFutureScheduledItems, ScheduleNumberPropInfo)
    }
  }
  
  override function renumberNewScheduledItems() {
    if (Owner.ScheduleAutoNumberSeq != null) {    
      Owner.ScheduleAutoNumberSeq.renumberNewBeans(CurrentAndFutureScheduledItems, ScheduleNumberPropInfo)
    }
  }

  override function cloneAutoNumberSequence() {
    if (Owner.ScheduleAutoNumberSeq != null) {
      Owner.ScheduleAutoNumberSeq = Owner.ScheduleAutoNumberSeq.clone(Owner.Bundle)
    }
  }

  override function resetAutoNumberSequence() {
    if (Owner.ScheduleAutoNumberSeq != null) {
      Owner.ScheduleAutoNumberSeq.reset()
      renumberAutoNumberSequence()
    }
  }

  override function bindAutoNumberSequence() {
    if (Owner.ScheduleAutoNumberSeq != null) {
      renumberAutoNumberSequence()
      Owner.ScheduleAutoNumberSeq.bind(CurrentAndFutureScheduledItems, ScheduleNumberPropInfo)
    }
  }

  override function initializeAutoNumberSequence(bundle : Bundle) {
    if (Owner.ScheduleAutoNumberSeq == null) {
      Owner.ScheduleAutoNumberSeq = new AutoNumberSequence(bundle)
    }
  }

  override function createAutoNumber(scheduledItem : KeyableBean) {
    initializeAutoNumberSequence(scheduledItem.Bundle)
    Owner.ScheduleAutoNumberSeq.number(scheduledItem, CurrentAndFutureScheduledItems, ScheduleNumberPropInfo)
  }

  /**
   * Returns an array containing scheduled items from current and future slices. Used for autonumbering.
   */
  abstract protected property get CurrentAndFutureScheduledItems() : KeyableBean[]
  
  /**
   * Get scheduled item property via reflection. Used for autonumbering.
   */
  abstract protected property get ScheduleNumberPropInfo() : IPropertyInfo

  override function getScheduledItemDescription(scheduledItem : ScheduledItem) : String {
    var propInfo = MostDescriptivePropertyInfo
    if (propInfo != null) {
      var propValue = propInfo.PropertyInfo.Accessor.getValue(scheduledItem) as String
      if (propValue != null and propValue != "") {
      
      if (propInfo typeis ScheduleTypeKeyPropertyInfo){
        var getters = propInfo.ValueRange as List<TypeKey>
        propValue = getters.firstWhere(\ t -> t.Code == propValue).DisplayName
      }

        return displaykey.Web.Policy.ScheduledItem(propValue)
      } else {
        return displaykey.Web.Policy.ScheduledItem("")
      }
    } 
    throw new DisplayableException(displaykey.Web.Policy.NoDescriptiveColumn(scheduledItem.DisplayName))
  } 
}
