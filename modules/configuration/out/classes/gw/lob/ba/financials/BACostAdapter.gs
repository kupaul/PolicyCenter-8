package gw.lob.ba.financials
uses gw.api.domain.financials.CostAdapter
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BACostAdapter implements CostAdapter
{
  var _owner : BACost
  construct(owner : BACost) { _owner = owner }

  override function createTransaction( branch : PolicyPeriod ) : Transaction
  {
    var transaction = new BATransaction( branch, branch.PeriodStart, branch.PeriodEnd )
    transaction.BACost           = _owner.Unsliced
    return transaction
  }

  override property get Reinsurable() : Reinsurable {
    if (_owner.Coverage == null or not _owner.SubjectToRICeding) {
      return null
    }

    var rCov : ReinsurableCoverable = _owner.Coverage.ReinsurableCoverable
    var candidates = rCov.Reinsurables.where(\ r -> r.CoverageGroup == _owner.Coverage.RICoverageGroupType)
    return candidates.HasElements ? candidates.single() : null
  }

  override property get NameOfCoverable() : String {
    return (_owner.Vehicle != null) ? _owner.Vehicle.DisplayName : _owner.Jurisdiction.DisplayName
  }

  override function isMatchingBean(bean : KeyableBean) : boolean {
    var b2BACost = bean as BACost
    return _owner.Coverage.PatternCode == b2BACost.Coverage.PatternCode and
           _owner.Vehicle.Vin == b2BACost.Vehicle.Vin
  }

  override property get Coverable() : Coverable {
    return _owner.OwningCoverable
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BusinessAutoLine
  }
}
