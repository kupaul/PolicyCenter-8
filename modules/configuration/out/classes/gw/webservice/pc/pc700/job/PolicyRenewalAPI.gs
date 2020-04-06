package gw.webservice.pc.pc700.job

uses gw.api.productmodel.Product
uses gw.api.productmodel.ProductLookup
uses gw.api.webservice.exception.AlreadyExecutedException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.FieldFormatException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.ServerStateException
uses gw.plugin.Plugins
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.plugin.billing.InstallmentPlanDataImpl
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.Exception
uses java.lang.IllegalArgumentException
uses java.math.BigDecimal
uses java.util.Date
uses gw.plugin.billing.InstallmentPlanData

/**
 * External API for managing renewals on policies in PolicyCenter.
 */
@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/job/PolicyRenewalAPI" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.job.PolicyRenewalAPI instead")
class PolicyRenewalAPI {

  /**
   * Confirm a policy term. This usually happen when a payment is received by the billing system.
   * Update policy period confirmed status in BC by calling updatePolicyPeriodConfirmed()
   *
   * @param policyNumber the policy number.
   * @param termNumber the term number.
   * @param transactionId the unique id for this request
   */
  @Throws(AlreadyExecutedException, "If the transactionId is duplicated with that of any other previous requests")
  @Throws(BadIdentifierException, "If no policy is found for the given policy number and term number, or if that policy is not bound")
  @Throws(SOAPException, "If communication errors occur")
  function confirmTerm(policyNumber : String, termNumber : int, transactionId : String) {
    SOAPUtil.tryCatch<String>(\ bundle -> {
      var query = PolicyPeriod.finder.findByPolicyNumberAndTerm(policyNumber, termNumber)
      if (query.Empty) {
        throw new BadIdentifierException(displaykey.JobAPI.CantFindTermPolicy(policyNumber, termNumber))
      }
      var period = query.FirstResult
      if (period.PolicyTerm.Archived) {
        throw new BadIdentifierException(displaykey.JobAPI.PolicyTermIsArchived(period.PolicyTerm))
      }
      if(query.Count == 1 and period.Status <> PolicyPeriodStatus.TC_BOUND){
        throw new BadIdentifierException( "The term ${period} is not bound yet.")
      }
      bundle.add(period.PolicyTerm).Bound = true

      var bcPlugin = Plugins.get(IBillingSystemPlugin)
      bcPlugin.updatePolicyPeriodTermConfirmed(policyNumber, termNumber, true)

      return null
    }, transactionId)
  }

  /**
   * Notify PolicyCenter that payment has been received for a specific renewal offer.
   * This method will create an activity if the policy is not in the correct state to receive
   * this payment, or if no applicable payment plan for this payment amount can be found.
   * @param offerID the unique identification of the renewal offer
   * @param selectedPaymentPlanCode the payment plan code selected, which will be sent to Billing
   * @param paymentAmount the payment amount
   * @param transactionId the unique id for this request
   * @return the new policy number, or null if the payment cannot be applied
   */
  @Throws(AlreadyExecutedException, "If the transactionId is duplicated with that of any other previous requests")
  @Throws(BadIdentifierException, "If the renewal offer specified cannot be found or if the offer expired")
  @Throws(ServerStateException, "If any unexpected issue occurs")
  @Throws(SOAPException, "If communication errors occur")
  function notifyPaymentReceivedForRenewalOffer(offerID : String,
        selectedPaymentPlanCode : String, paymentAmount : BigDecimal,
        transactionId : String) : String{
    return SOAPUtil.tryCatch<String>(\ bundle -> {
      var job = Job.finder.findJobByJobNumber(offerID)
      if (job == null or not (job typeis Renewal)) {
        throw new BadIdentifierException(displaykey.JobAPI.CantFindRenewalOffer(offerID))
      }
      var period = job.LatestPeriod
      if (period.PolicyTerm.Archived) {
        throw new BadIdentifierException(displaykey.JobAPI.PolicyTermIsArchived(period.PolicyTerm))
      }
      if (period.Status == PolicyPeriodStatus.TC_BOUND) {
        return period.PolicyNumber
      }
      if (not canReceivePayment(period)) {
        var description = displaykey.RenewalAPI.RenewalOffer.OfferNotReady(offerID)
        createActivity(job, description)
        return null
      }
      var installmentPlans = period.retrievePaymentPlans().InstallmentPlans
      var paymentPlan = getApplicablePaymentPlan(period, selectedPaymentPlanCode, paymentAmount, installmentPlans)
      if (paymentPlan == null) {
        var description = selectedPaymentPlanCode == null
                ? displaykey.RenewalAPI.RenewalOffer.InvalidPlan(paymentAmount)
                : displaykey.RenewalAPI.RenewalOffer.InvalidPayment(selectedPaymentPlanCode, paymentAmount)
        createActivity(job, description)
        return null
      }
      try {
        period = bundle.add(period)
        period.SelectedPaymentPlan = paymentPlan.createPaymentPlanSummary(bundle)
        period.ActiveWorkflow.invokeTrigger(WorkflowTriggerKey.TC_FINISHISSUERENEWAL, true)
      } catch(e : Exception) {
        e.printStackTrace()
        var description = displaykey.RenewalAPI.RenewalOffer.OfferNotReady(offerID)
        createActivity(job, description)
      }
      return period.PolicyNumber
    }, transactionId)
  }

  /**
   * Starts a renewal for each policy number specified in the argument array. The policy numbers
   * are handled in sequence. Each successful renewal will be committed to the database as it is
   * created. There will be no gap in coverage between the renewal and its based-on period. An
   * unsuccessful renewal will throw an exception, and subsequent policy numbers in the argument
   * array will not be handled.
   * @param policyNumbers an array of policy number strings. Each number is expected to match a policy in the PolicyCenter database.
   */
  @Throws(RequiredFieldException, "If the <code>policyNumbers</code> argument is null")
  @Throws(BadIdentifierException, "If any of the <code>policyNumbers</code> does not match a policy in the PolicyCenter database")
  @Throws(SOAPException, "If communication errors occur")
  function startRenewals(policyNumbers : String[]) {
    if (policyNumbers == null) {
      throw new RequiredFieldException(displaykey.PolicyRenewalAPI.StartRenewals.Error.NullArgument)
    }
    for (policyNumber in policyNumbers) {
      var period = Policy.finder.findMostRecentBoundPeriodByPolicyNumber(policyNumber)
      if (period == null) {
        throw new BadIdentifierException(displaykey.PolicyRenewalAPI.StartRenewals.Error.InvalidPolicyNumber(policyNumber))
      }
      Transaction.runWithNewBundle(\ bundle -> {
        var renewal = new Renewal(bundle)
        renewal.startJob(period.Policy)
      })
    }
  }

  /**
   * <b>Deprecated</b> - As of 7.0.4, use startConversionRenewal() which creates a basedOn period to
   * represent the legacy PolicyPeriod.
   *
   * Starts a renewal for a policy that does not already exist in PC. The policy data is passed
   * in as policyPeriodData string which will be parsed by Guidewire's PolicyPeriod GX model schema.
   *
   * @param accountNumber account number
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param producerCodeId public id of the producer code
   * @param policyPeriodData the data used to populate the new policy period
   * @param parseOptions the options passed to the parser to parse policyPeriodData
   *
   * @return the job number of the newly started renewal
   */
  @Throws(RequiredFieldException, "If any required field is null")
  @Throws(BadIdentifierException, "If the specified account, product or producer code does not exist")
  @Throws(DataConversionException, "If a policy period cannot be populated from policyPeriodData.")
  @Throws(SOAPException, "If communication fails")
  function startNewRenewal(accountNumber : String,
                           productCode : String,
                           producerCodeId : String,
                           policyPeriodData : String,
                           parseOptions : String) : String {
    var renewal : Renewal
    startRenewal(accountNumber, productCode, producerCodeId, \ account, product, producerCode -> {
      Transaction.runWithNewBundle(\ bundle -> {
        account = bundle.add(account)
        try {
          renewal = account.createConversionRenewal(Date.CurrentDate, product, producerCode,
            \ period -> {
              if(policyPeriodData <> null and policyPeriodData.NotBlank){
                var model = gw.webservice.pc.pc700.gxmodel.policyperiodmodel.PolicyPeriod.parse(policyPeriodData)
                model.$TypeInstance.populatePolicyPeriod(period)
              }
            })
        } catch(e : Exception){
          e.printStackTrace()
          throw new DataConversionException(e.Message)
        }
      })
    })
    return renewal.JobNumber
  }

  /**
   * Starts a renewal for a policy that does not already exist in PC. The policy data is passed
   * in as policyPeriodData string which will be parsed by Guidewire's PolicyPeriod GX model schema.
   *
   * @param accountNumber account number
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param producerCodeId public id of the producer code
   * @param policyNumber The policy number for the policy periods associated with this Renewal. If null,
   *            generate a new, unique policyNumber. Raises an underwriter issue if not unique.
   * @param policyPeriodData the data used to populate the new policy period
   * @param changesToApply things to change in the renewal period that differ from the legacy period. This
   *             parameter is not used out of the box, but is present to facilitate custom implementations.
   * @param parseOptions the options passed to the parser to parse policyPeriodData
   * @param basedOnEffectiveDate the effective date for the basedOn period
   * @param basedOnExpirationDate the expiration date for the basedOn period. This is
   *            also is the effectiveDate of the new renewal period.
   *
   * @return the job number of the newly started renewal
   */
  @Throws(RequiredFieldException, "If any required field is null")
  @Throws(BadIdentifierException, "If the specified account, product or producer code does not exist")
  @Throws(DataConversionException, "If a policy period cannot be populated from policyPeriodData.")
  @Throws(SOAPException, "If communication fails")
  @Throws(FieldFormatException, "If either basedOnEffectiveDate or basedOnExpirationDate cannot be parsed")
  function startConversionRenewal(accountNumber : String,
                             productCode : String,
                             producerCodeId : String,
                             policyNumber : String,
                             policyPeriodData : String,
                             changesToApply : String,
                             parseOptions : String,
                             basedOnEffectiveDate : String,
                             basedOnExpirationDate : String) : String {

    var basedOnEffectiveDateAsDate : Date
    var basedOnExpirationDateAsDate : Date
    var renewal : Renewal
    startRenewal(accountNumber, productCode, producerCodeId, \ account, product, producerCode -> {
      SOAPUtil.require(basedOnEffectiveDate, "basedOnEffectiveDate")
      SOAPUtil.require(basedOnExpirationDate, "basedOnExpirationDate")
      Transaction.runWithNewBundle(\ bundle -> {
        basedOnEffectiveDateAsDate = parseDateFromString(basedOnEffectiveDate, "basedOnEffectiveDate")
        basedOnExpirationDateAsDate = parseDateFromString(basedOnExpirationDate, "basedOnExpirationDate")
        account = bundle.add(account)
        try {
          renewal = account.createConversionRenewalWithBasedOn(basedOnEffectiveDateAsDate, basedOnExpirationDateAsDate,
            product, producerCode, policyNumber, \ period -> {
              if (policyPeriodData <> null and policyPeriodData.NotBlank) {
                var model = gw.webservice.pc.pc700.gxmodel.policyperiodmodel.PolicyPeriod.parse(policyPeriodData)
                model.$TypeInstance.populatePolicyPeriod(period)
              }
            })
          var policyPeriod = renewal.LatestPeriod

          //this makes the renewal period - not basedon - enter as draft and not new. assigns UWCompany.
          //different behavior from startNewRenewal.
          policyPeriod.RenewalProcess.beginEditing()

          for (territoryCode in policyPeriod.PrimaryLocation.TerritoryCodes) {
            if (territoryCode.Code == null) {
              territoryCode.fillWithFirst()
            }
          }
        } catch(e : Exception){
          e.printStackTrace()
          throw new DataConversionException(e.Message)
        }
      })
    })
    return renewal.JobNumber
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function createActivity(job : Job, description : String) {
    Transaction.runWithNewBundle(\ bundle -> {
      var activityPattern = ActivityPattern.finder.getActivityPatternByCode("renewal_review")
      var activity = activityPattern.createJobActivity(bundle, job, null, description, null, null, null, null, null)
      activity.AssignedUser = job.Underwriter
    })
  }

  private function canReceivePayment(period : PolicyPeriod) : boolean {
    return period.ActiveWorkflow != null and period.ActiveWorkflow.isTriggerAvailable(WorkflowTriggerKey.TC_FINISHISSUERENEWAL)
  }

  private function getApplicablePaymentPlan(period: PolicyPeriod,
                                            selectedPaymentPlanCode: String,
                                            paymentAmount: BigDecimal,
                                            paymentPlans: InstallmentPlanData[]) : InstallmentPlanData {
    if (selectedPaymentPlanCode == null && period.SelectedPaymentPlan != null) {
      if (period.SelectedPaymentPlan.DownPayment.Amount <= paymentAmount) {
        return paymentPlans.getByBillingId(period.SelectedPaymentPlan.BillingId) as InstallmentPlanData
      }
      else if (paymentPlans.HasElements) {
        return paymentPlans.where(\p -> p.DownPayment.Amount <= paymentAmount).maxBy(\p -> p.DownPayment.Amount)
      }
    }
    else {
      return paymentPlans.firstWhere(\p -> p.BillingId == selectedPaymentPlanCode and p.DownPayment.Amount <= paymentAmount)
    }
    return null
  }

  private function startRenewal(accountNumber : String,
                           productCode : String,
                           producerCodeId : String,
                           createConversionRenewal(account : Account,
                               product : Product,
                               producerCode : ProducerCode)) {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(productCode, "productCode")
    SOAPUtil.require(producerCodeId, "producerCodeId")

    var account = Account.finder.findAccountByAccountNumber(accountNumber)
    if(account == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindAccountNumber(accountNumber))
    }
    var product = ProductLookup.getByCode(productCode)
    if(product == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindProductCode(productCode))
    }
    var producerCode = gw.api.database.Query.make(ProducerCode).compare("PublicID", Equals, producerCodeId).select().AtMostOneRow
    if(producerCode == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindProducerCode(producerCodeId))
    }
    createConversionRenewal(account, product, producerCode)
  }

  private function parseDateFromString(dateString : String, parameterName : String) : Date {
    try {
      return new Date(dateString)
    } catch (iae : IllegalArgumentException) {
      iae.printStackTrace()
      throw new DataConversionException(displaykey.JobAPI.CantParseParameterName(parameterName, dateString))
    }
  }
}
