package gw.lob.common
uses gw.policy.PolicyEvalContext
uses java.util.Date

@Export
abstract class AbstractUnderwriterEvaluator implements UnderwriterEvaluator {

  protected var _policyEvalContext : PolicyEvalContext

  construct (policyEvalContext : PolicyEvalContext){
    _policyEvalContext = policyEvalContext
  }

  override function canEvaluate() : boolean {
    return true
  }

  override function evaluate() {
    if (not canEvaluate()) {
      return
    }

    switch(_policyEvalContext.CheckingSet) {
      case (UWIssueCheckingSet.TC_PREQUOTE) :
        onPrequote()
        break
      case (UWIssueCheckingSet.TC_REFERRAL) :
        onReferral()
        break
      case (UWIssueCheckingSet.TC_QUESTION) :
        onQuestion()
        break
      case (UWIssueCheckingSet.TC_RENEWAL) :
        onRenewal()
        break
      case (UWIssueCheckingSet.TC_REINSURANCE) :
        onReinsurance()
        break
      default :
        onDefault()
        break
    }
  }

  protected function onDefault() {}
  protected function onPrequote() {}
  protected function onQuestion() {}
  protected function onReferral() {}
  protected function onReinsurance() {}
  protected function onRenewal() {}

  protected function producerChanged() {
    final var period = _policyEvalContext.Period

    var rr = period.isRiskReserved()

    if (period.Job typeis Submission or period.Job typeis Issuance) {
      // find latest period of same product type
      var others = findActivePoliciesWithSameProduct(period)
          .map(\ p -> p.fetchPolicyPeriod().getSlice(p.PeriodStart))
          .where(\ p -> p.Policy != period.Policy)

      var otherProducer = others.firstWhere(\ o -> o.ProducerOfRecord != period.ProducerOfRecord)
      var otherCode = others.firstWhere(\ o -> o.ProducerCodeOfRecord != period.ProducerCodeOfRecord)

      if (otherProducer != null) {
        maybeAddUWIssueForProducer(otherProducer.ProducerOfRecord.Name, period.ProducerOfRecord.Name,
                                   otherProducer.ProducerCodeOfRecord,  period.ProducerCodeOfRecord)
      } else if (otherCode != null) {
        maybeAddUWIssueForProducer(otherCode.ProducerOfRecord.Name, period.ProducerOfRecord.Name,
                                   otherCode.ProducerCodeOfRecord,  period.ProducerCodeOfRecord)
      }
    }
  }

  private function findActivePoliciesWithSameProduct(period : PolicyPeriod): List<PolicyPeriodSummary> {
    var todaysDate = Date.CurrentDate
    var policies = period.Policy.Account.IssuedPolicies
        .where(\ p -> p.ProductCode == period.Policy.ProductCode
            and p.CancellationDate == null
            and p.PeriodStart != null
            and p.PeriodEnd != null
            and not todaysDate.before(p.PeriodStart)
            and p.PeriodEnd.after(todaysDate))

    return policies
  }

  private function maybeAddUWIssueForProducer(oldProducerName : String, newProducerName : String,
                                              oldCode : ProducerCode, newCode : ProducerCode) {
    var uwIssueCode     : String = null
    var shortDesc       : String = null
    var longDescription : String = null

    if (oldProducerName != newProducerName) {
      uwIssueCode = "ChangedProducerOrg"
      shortDesc = displaykey.UWIssue.ProducerOrgChange.ShortDesc
      longDescription = displaykey.UWIssue.ProducerOrgChange.LongDesc(newProducerName, newCode)
    } else if (oldCode != newCode) {
      uwIssueCode = "ChangedProducerCode"
      shortDesc = displaykey.UWIssue.ProducerCodeChange.ShortDesc
      longDescription = displaykey.UWIssue.ProducerCodeChange.LongDesc(newProducerName, newCode)
    }

    if (uwIssueCode != null) {
      var uwIssueKey = newProducerName + " (" + newCode + ")"

      _policyEvalContext.addIssue(uwIssueCode, uwIssueKey, \ -> shortDesc, \ -> longDescription)
    }
  }
}