package gw.lob.gl
uses gw.lob.common.AbstractScheduledItemAdapter
uses gw.api.productmodel.Schedule
uses gw.api.domain.Clause
uses gw.policy.PolicyLineConfiguration

@Export
class GLLineScheduleCovItemCoverableAdapter extends AbstractScheduledItemAdapter{
  var _owner : GLLineScheduleCovItem  as readonly Owner

  construct(item : GLLineScheduleCovItem) {
    _owner = item
  }

  override property get ScheduleParent() : Schedule {
    return _owner.Schedule
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.Schedule.GLLine
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.ScheduledItemClause == null ? {} : {_owner.ScheduledItemClause}
  }

  override function addCoverage( cov : Coverage) {
    _owner.ScheduledItemClause = cov as GLLineSchCovItemCov
  }

  override function removeCoverage( cov : Coverage ) {
    _owner.ScheduledItemClause = null
  }

  override property get Clause() : Clause {
    var result = _owner.ScheduledItemClause
    return result
  }

  override function hasClause() : boolean {
    return (_owner.ScheduledItemClause != null)
  }

  override property get DefaultCurrency() : Currency {
    return _owner.Schedule.GLLine.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_GL).AllowedCurrencies
  }
}
