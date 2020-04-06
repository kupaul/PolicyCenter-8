package gw.lob.common
uses entity.PolicyLocation
uses entity.PolicyLine
uses typekey.Jurisdiction
uses entity.Exclusion
uses entity.ScheduledItem
uses entity.PolicyCondition
uses gw.api.domain.CoverableAdapter
uses java.util.Date
uses java.lang.UnsupportedOperationException
uses gw.api.productmodel.ScheduledItemAdapter

/**
 * Abstract implementation of {@link CoverableAdapter} and {@link ScheduledItemAdapter}
 * Create default, unsupported operations for the add/remove functions of Coverages/Exclusions/Conditions.
 */
@Export
abstract class AbstractScheduledItemAdapter implements CoverableAdapter, ScheduledItemAdapter {

  abstract property get Owner() : ScheduledItem
  
  override property get PolicyLocations() : PolicyLocation[] {
    return {}
  }
  
  override property get State() : Jurisdiction{
    return PolicyLine.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return {}
  }

  override function addCoverage(cov : Coverage ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("addCoverage"))
  }

  override function removeCoverage(cov : Coverage ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("removeCoverage"))
  }

  override property get AllExclusions() : Exclusion[] {
    return {}
  }

  override function addExclusion(exclusion : Exclusion ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("addExclusion"))
  }

  override function removeExclusion(exclusion : Exclusion ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("removeExclusion"))
  }

  override property get AllConditions() : PolicyCondition[] {
    return {}
  }

  override function addCondition(cond : PolicyCondition ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("addCondition"))
  }

  override function removeCondition(cond : PolicyCondition ) : void {
    throw new UnsupportedOperationException(displaykey.ScheduledItemAdapter.Error.MustOverrideMethod("removeCondition"))    
  }

  override property get ReferenceDateInternal() : Date {
    return Owner.ReferenceDateInternal
  }
  
  override property set ReferenceDateInternal( date : Date )  {
    Owner.ReferenceDateInternal = date
  }
}
