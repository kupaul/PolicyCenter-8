package gw.lob.bop.financials
uses gw.api.domain.financials.CostAdapter
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BOPCostAdapter implements CostAdapter
{
  var _owner : BOPCost
  construct(owner : BOPCost) { _owner = owner }

  override function createTransaction( branch : PolicyPeriod ) : Transaction
  {
    var transaction = new BOPTransaction( branch, branch.PeriodStart, branch.PeriodEnd )
    transaction.BOPCost            = _owner.Unsliced
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
    return (_owner.Building != null) ? _owner.Building.DisplayName
         : (_owner.Location != null) ? _owner.Location.DisplayName : _owner.State.DisplayName
  }

  override function isMatchingBean(bean : KeyableBean) : boolean {
    return false
  }

  override property get Coverable() : Coverable {
    return _owner.OwningCoverable
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BusinessOwnersLine
  }
}
