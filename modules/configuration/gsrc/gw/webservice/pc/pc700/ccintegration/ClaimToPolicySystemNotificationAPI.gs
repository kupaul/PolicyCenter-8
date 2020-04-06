package gw.webservice.pc.pc700.ccintegration

uses gw.api.util.LocaleUtil
uses gw.api.webservice.exception.BadIdentifierException
uses java.util.Date
uses gw.api.webservice.exception.AlreadyExecutedException

/**
* WebService for claim system to notify the policy system of changes in the
* claim system that may be of interest.
*/
@Export
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/ccintegration/ClaimToPolicySystemNotificationAPI" )
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.ClaimToPolicySystemNotificationAPI instead")
class ClaimToPolicySystemNotificationAPI {

  construct() {}

  /**
   * Report a policy against which a claim has incurred losses past a certain
   * threshold.
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
  function claimExceedsThreshold(
      lossDate : Date,
      policyNumber :  String,
      grossTotalIncurred : String,
      transactionId : String) {
    // Current implementation does not worry about checking transactionId for
    // duplicates; the worst that can happen is that we create a second
    // activity - annoying but pretty harmless
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var policyPeriod = findPolicyPeriodForLoss(lossDate, policyNumber)
      policyPeriod = bundle.add(policyPeriod)
      referToUnderwriter(policyPeriod, grossTotalIncurred)
      addLargeLossActivityToPolicy(policyPeriod.Policy, policyNumber, grossTotalIncurred, policyPeriod.Job.Underwriter)
    })
  }

  //------------------------ private helper methods
  private function addLargeLossActivityToPolicy(
      policy : Policy,
      policyNumber : String,
      grossTotalIncurred : String,
      assignedUser : User) {
    var activityPattern = ActivityPattern.finder.getActivityPatternByCode("notification")
    //FIXME: Policy either needs an accountLocale or we format using the user's locale. I vote for user's locale.
    var accountLanguage = LocaleUtil.toLanguage(policy.PrimaryLanguage)
    var userLocale = LocaleUtil.toLanguage(policy.PrimaryLanguage)  //this line is not correct
    LocaleUtil.runAsCurrentLocaleAndLanguage( userLocale, accountLanguage, \ -> {
      var today = Date.Today.format( User.util.CurrentLocale.DateFormat.Short )
      var activity = activityPattern.createPolicyActivity(policy.Bundle,
        policy,
        displaykey.LargeLoss.ActivitySubject(policyNumber),
        displaykey.LargeLoss.ActivityDescription(grossTotalIncurred, today),
        null, "High", true, null, null)
      activity.Recurring = false
      activity.AssignedUser = assignedUser
    })
  }

  private function referToUnderwriter(
      policyPeriod : PolicyPeriod, grossTotalIncurred : String) {
   var accountLanguage = LocaleUtil.toLanguage(policyPeriod.Policy.PrimaryLanguage)

   //FIXME: This should be user locale I think... but using language until PC has policy locale or we use the user's locale
   var userLocale = LocaleUtil.toLanguage(policyPeriod.Policy.PrimaryLanguage)

   LocaleUtil.runAsCurrentLocaleAndLanguage( userLocale, accountLanguage, \ -> {
    var descriptionEval = \ ->
      displaykey.LargeLoss.Description(grossTotalIncurred,
         Date.Today.format(User.util.CurrentLocale.DateFormat.Short))

    policyPeriod.Policy.
        addReferralReason("ReferralBlockingBind", "LargeLoss",
          descriptionEval,
          descriptionEval,
          null)
   })
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
