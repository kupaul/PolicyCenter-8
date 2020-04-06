package gw.lob.gl
uses gw.lob.common.AbstractScheduledItemAdapter
uses gw.api.productmodel.Schedule
uses gw.api.domain.Clause
uses gw.policy.PolicyLineConfiguration

@Export
class GLLineScheduleExclItemCoverableAdapter extends AbstractScheduledItemAdapter {

  var _owner : GLLineScheduleExclItem  as readonly Owner

  construct(item : GLLineScheduleExclItem) {
    _owner = item
  }

  override property get ScheduleParent() : Schedule {
    if (_owner.Schedule == null) {
      return null
    }
    return _owner.Schedule
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.Schedule.GLLine
  }

  override property get Clause() : Clause {
    return null
  }

  override function hasClause() : boolean {
    return false
  }

  override property get DefaultCurrency() : Currency {
    return _owner.Schedule.GLLine.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_GL).AllowedCurrencies
  }
}
