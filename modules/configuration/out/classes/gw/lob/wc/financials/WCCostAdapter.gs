package gw.lob.wc.financials
uses gw.api.domain.financials.CostAdapter

@Export
class WCCostAdapter implements CostAdapter
{
  var _owner : WCCost
  construct(owner : WCCost) { _owner = owner }

  override function createTransaction( branch : PolicyPeriod ) : Transaction
  {
    var transaction = new WCTransaction( branch, branch.PeriodStart, branch.PeriodEnd )
    transaction.WCCost          = _owner.Unsliced
    return transaction
  }

  override property get Reinsurable() : Reinsurable {
    if (not _owner.SubjectToRICeding) {
      return null
    }

    return _owner.Branch.AllReinsurables.single() // only one on a WC policy -- the line
  }

  override property get Coverable() : Coverable {
    return _owner.OwningCoverable
  }

  override property get NameOfCoverable() : String {
    return _owner.Description
  }

  override function isMatchingBean(bean : KeyableBean) : boolean {
    return false
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.WorkersCompLine
  }
}
