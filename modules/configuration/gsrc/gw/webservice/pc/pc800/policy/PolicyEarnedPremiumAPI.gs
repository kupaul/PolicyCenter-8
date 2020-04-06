package gw.webservice.pc.pc800.policy

uses gw.api.domain.financials.TransactionFinder
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.IllegalArgumentException
uses java.util.ArrayList
uses java.util.Date
uses gw.xml.ws.annotation.WsiPermissions

@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/policy/PolicyEarnedPremiumAPI" )
@Export
class PolicyEarnedPremiumAPI {

  construct() {
  }

  /**
   * Calculates the earned premium from the specified policy, using the specified period and given the desired evaluation date.
   * 
   * @param policyNumber    the number of the policy
   * @param periodAsOfDate  A date on which the policy to find is in effect.
   * @param earnedAsOfDate  A date used for evaluating the earned premium.
   * @param includeEBUR     whether to include EBUR in the calculation
   * @return List of PolicyEarnedPremiumInfos, each containing business line, earned premium and premium currency.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If any required field (Policy Number, Period As Of, Earned As Of, or Include EBUR) is null")
  @Throws(BadIdentifierException, "If cannot find policy with given number")
  @Throws(IllegalArgumentException, "If includeEBUR value is incompatible with the policy.")
  @Param("policyNumber", "the number of the policy")
  @Param("periodAsOfDate", "A date on which the policy to find is in effect.")
  @Param("earnedAsOfDate", "A date used for evaluating the earned premium.")
  @Param("includeEBUR", "whether to include EBUR in the calculation")
  @WsiPermissions({SystemPermissionType.TC_PFILEDETAILS})
  @Returns("List of PolicyEarnedPremiumInfos, each containing business line, earned premium and premium currency.")
  public function calcEarnedPremiumByPolicyNumber(policyNumber : String, periodAsOfDate : Date, earnedAsOfDate : Date, includeEBUR : boolean ) :  List<PolicyEarnedPremiumInfo> {
    SOAPUtil.require(policyNumber, "Policy Number")
    SOAPUtil.require(periodAsOfDate, "Period As Of Date")
    SOAPUtil.require(earnedAsOfDate, "Earned As Of Date")
    SOAPUtil.require(includeEBUR, "Include EBUR")
    
    var results = new ArrayList<PolicyEarnedPremiumInfo>()
    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, periodAsOfDate)    
    if(period == null){
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindPolicyForPolicyNumber(policyNumber, periodAsOfDate))
    }

    // Check Earned date to be meaningful
    if (earnedAsOfDate.compareIgnoreTime(period.PeriodStart) < 0) {
      throw new IllegalArgumentException(displaykey.Webservice.Error.EarnedBeforePeriodStart(earnedAsOfDate, period.PeriodStart))
    }
    
    //figure out the last reported date
    var lastReportedDate : Date
    if (period.IsReportingPolicy) {
      lastReportedDate = period.LastReportedDate
    }
    if (lastReportedDate == null) {
      lastReportedDate = period.PeriodStart
    }
    
    // if includeEBUR on non reporting policy, error
    if (includeEBUR and not period.IsReportingPolicy) {
      throw new IllegalArgumentException(displaykey.Webservice.Error.IncludeEBURNotValidForPolicy)
    }
    
    // quietly override EBUR if set to true and it cannot apply
    //   For example, include may be set to true, but if the final audit is complete, 
    //      then it does not apply
    // if there is a final audit in place, do not allow user to includeEBUR
    var passIncludeEBUR = includeEBUR
    if (period.IsReportingPolicy and period.CompletedNotReversedFinalAudits.Count <> 0) {
      passIncludeEBUR = false
    }
    
    // get all transactions
    var txs = TransactionFinder.instance.findPostedTransactions(period)
    // partition by line
    var txsByPolicyLine = 
    txs.partition(\ t -> ( t.Cost.BranchUntyped as PolicyPeriod).Lines.singleWhere(\ line -> line.Costs.contains(t.Cost)).Pattern.Name)
    //txs.partition(\ t -> t.Cost.Coverable.PolicyLine.Pattern.Name)
    // for each line, add an item to the info POGO
    for (line in txsByPolicyLine.Keys) {
      results.add(createInfo(txsByPolicyLine.get(line), earnedAsOfDate, lastReportedDate, passIncludeEBUR, line))
    }
    
    return results
  }

  private function createInfo(txs : List<Transaction>, passAsOf : Date, lastReportedDate : Date, passIncludeEBUR : boolean, line : String) : PolicyEarnedPremiumInfo {
    var info = new PolicyEarnedPremiumInfo()
    var amount = txs.sum(\ t -> t.earnedAsOf(passAsOf, lastReportedDate, passIncludeEBUR))
    info.EarnedPremium = amount.Amount
    info.PremiumCurrency = amount.Currency
    info.LOB = line
    return info
  }
}
