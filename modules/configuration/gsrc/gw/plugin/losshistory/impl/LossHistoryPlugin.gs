package gw.plugin.losshistory.impl

uses gw.plugin.losshistory.ILossHistoryPlugin
uses java.util.Date
uses java.util.ArrayList
uses java.math.BigDecimal

@Export
class LossHistoryPlugin implements ILossHistoryPlugin {

  override function getLossFinancialsForAccount( accountNumber: String ) : LossFinancials[] {
    var account = Account.finder.findAccountByAccountNumber(accountNumber)
    var policies = account.IssuedPolicies
    var results = new ArrayList<LossFinancials>()
    var iter = policies.iterator()
    while (iter.hasNext()) {
      var policy = iter.next()
      var periodId = policy.PolicyPeriodId
      var period = policy.Bundle.loadBean(periodId) as PolicyPeriod
      results.add(getLossFinancialsForPolicyPeriod(period.LatestPeriod, policy.PolicyNumber, policy.EditEffectiveDate))
    }
    return results.toTypedArray()
  }

  override function getLossFinancialsForPolicy( policyNumber: String, periodAsOfDate: Date ) : LossFinancials {
    if (policyNumber == null) {
      return null
    }
    var periodInForce = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, periodAsOfDate)
    return getLossFinancialsForPolicyPeriod(periodInForce, policyNumber, periodAsOfDate)
  }

  private function getLossFinancialsForPolicyPeriod(periodInForce : PolicyPeriod, policyNumber : String, periodAsOfDate : Date) : LossFinancials {
    var currency = periodInForce.PreferredSettlementCurrency
    var lossFinancials = new LossFinancials()
    lossFinancials.PolicyNumber = policyNumber
    lossFinancials.AsOfDate = periodAsOfDate
    lossFinancials.BeginDate = periodInForce.PeriodStart.toString()
    lossFinancials.EndDate = periodInForce.PeriodEnd.toString()
    lossFinancials.TotalPaidLoss = new BigDecimal(100000).ofCurrency(currency)
    lossFinancials.OpenLossReserves = new BigDecimal(90000).ofCurrency(currency)
    lossFinancials.TotalPaidExpense = new BigDecimal(75000).ofCurrency(currency)
    lossFinancials.OpenExpenseReserves = new BigDecimal(425000).ofCurrency(currency)
    lossFinancials.TotalRecoveries = new BigDecimal(84000).ofCurrency(currency)
    return lossFinancials
  }
}
