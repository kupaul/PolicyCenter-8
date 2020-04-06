package gw.webservice.pc.pc800.ccintegration

uses gw.api.util.CurrencyUtil
uses gw.api.util.LocaleUtil
uses gw.api.webservice.exception.AlreadyExecutedException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.currency.MonetaryAmount

uses java.util.Date
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiPermissions

/**
* WebService for claim system to notify the policy system of changes in the
* claim system that may be of interest.
*/
@Export
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/ccintegration/ClaimToPolicySystemNotificationAPI" )
class ClaimToPolicySystemNotificationAPI {

  construct() {}

  /**
   * Report a policy against which a claim has incurred losses past a certain
   * threshold.
   *
   * @param - lossDate the loss date of the claim, used to identify the correct
   *          policy version
   * @param - policyNumber the number of the policy
   * @param - grossTotalIncurred the amount incurred, as a user displaying string
   * @param - transactionId a unique id identifying this notification. If another
   *          notification arrives with the same transactionId then it is a
   *          duplicate (rare, but can happen due to network failures). The
   *          implementation can use this, if necessary, to discard duplicate
   *          notifications. The default implementation ignores this parameter.
   */
  @Throws(BadIdentifierException, "If the policyNumber and lossDate do not identify a policy.")
  @Throws(AlreadyExecutedException, "If this notification is duplicated for.")
  @Param("lossDate", "the loss date of the claim, used to identify the correct policy version")
  @Param("policyNumber", "the number of the policy")
  @Param("grossTotalIncurred", "the amount incurred, as a MonetaryAmount")
  @Param("transactionId", "a unique id identifying this notification")
  @WsiPermissions({SystemPermissionType.TC_VIEWPOLICYFILE})
  function claimExceedsThreshold(
      lossDate : Date,
      policyNumber :  String,
      grossTotalIncurred : MonetaryAmount,
      transactionId : String) {
    SOAPUtil.require(lossDate, "lossDate");
    SOAPUtil.require(policyNumber, "policyNumber");

    // Current implementation does not worry about checking transactionId for
    // duplicates; the worst that can happen is that we create a second
    // activity - annoying but pretty harmless
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var policyPeriod = findPolicyPeriodForLoss(lossDate, policyNumber)
      policyPeriod = bundle.add(policyPeriod)

      //FIXME: This is not correct, but I'll need some time to thing about it, use user locale instead?
      var language = LocaleUtil.toLanguage(policyPeriod.Policy.PrimaryLanguage)
      LocaleUtil.runAsCurrentLocaleAndLanguage(language, language, \ -> {
        referToUnderwriter(policyPeriod, grossTotalIncurred)
        addLargeLossActivityToPolicy(policyPeriod.Policy, policyNumber, grossTotalIncurred, policyPeriod.Job.Underwriter)
      })
    })
  }

  //------------------------ private helper methods
    private function addLargeLossActivityToPolicy(
        policy : Policy,
        policyNumber : String,
        grossTotalIncurred : MonetaryAmount,
        assignedUser : User) {
      var activityPattern = ActivityPattern.finder.getActivityPatternByCode("notification")
      var today = Date.Today.format( User.util.CurrentLocale.DateFormat.Short )
      var activity = activityPattern.createPolicyActivity(policy.Bundle,
        policy,
        displaykey.LargeLoss.ActivitySubject(policyNumber),
        displaykey.LargeLoss.ActivityDescription(convertMonetaryAmountToString(grossTotalIncurred), today),
        null, "High", true, null, null)
      activity.Recurring = false
      activity.AssignedUser = assignedUser
    }

    private function referToUnderwriter(
        policyPeriod : PolicyPeriod, grossTotalIncurred : MonetaryAmount) {
     var accountLanguage = LocaleUtil.toLanguage(policyPeriod.Policy.PrimaryLanguage)

    var descriptionEval = \ ->
      displaykey.LargeLoss.Description(convertMonetaryAmountToString(grossTotalIncurred),
         Date.Today.format(User.util.CurrentLocale.DateFormat.Short))

    policyPeriod.Policy.
        addReferralReason("ReferralBlockingBind", "LargeLoss",
          descriptionEval,
          descriptionEval,
          null)
    }

  private function convertMonetaryAmountToString(monetaryAmount : MonetaryAmount) : String {
    return CurrencyUtil.renderAsCurrency(monetaryAmount.Amount, monetaryAmount.Currency)
  }

  @Throws(BadIdentifierException,
    "If the policyNumber and lossDate do not identify a policy.")
  private function findPolicyPeriodForLoss(
      lossDate : Date,
      policyNumber :  String)
  : PolicyPeriod {
    var policyPeriod = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(
       policyNumber, lossDate )

    if( policyPeriod == null ) {
      throw new BadIdentifierException(
        displaykey.LargeLoss.ClaimExceedsThreshold.NoPolicyFound(
          policyNumber, lossDate))
    }
    return policyPeriod
  }
}
