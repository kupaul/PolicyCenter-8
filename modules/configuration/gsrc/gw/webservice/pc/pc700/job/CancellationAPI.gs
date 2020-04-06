package gw.webservice.pc.pc700.job

uses java.util.Date
uses gw.api.webservice.exception.*
uses gw.transaction.Transaction
uses gw.pl.persistence.core.Bundle
uses java.util.ArrayList
uses gw.webservice.SOAPUtil
uses gw.api.system.PCLoggerCategory
uses java.lang.Exception
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.xml.ws.annotation.WsiWebService
uses gw.api.archive.PolicyTermInArchiveSOAPException
/**
 * External API for managing Cancellation on policies in PolicyCenter.
 */
@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/job/CancellationAPI" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.job.CancellationAPI instead")
class CancellationAPI {

  /**
   * Start a cancellation job associated with the policy for the given policyNumber to the cancellationDate provided.
   *
   * If recalculateEffDate is set to false, starts a Cancellation job effective on cancellationDate
   * for the given policy in PolicyCenter (this date will also be the effective date of the new
   * cancellation policy period). In this case, so the caller is responsible for ensuring that any
   * legal requirements for the cancellationDate are met.
   *
   * If recalculateEffDate is set to true,  Policy Center will calculate the earliest date for the
   * cancellation to meet all legal requirements and will use that date if it is after the
   * cancellationDate. In this case, caller can set the cancellationDate to today to get the policy
   * period cancelled as soon as possible.
   *
   * @Param policyNumber The number of the period that should be canceled.
   * @Param cancellationDate The effective date for the cancellation. Cannot be null.
   * @Param recalculateEffDate If true, Policy Center will recalculate the effective date for
   *        the cancellation to meet all legal requirements, and if that date is after the
   *        cancellation date then it will be used instead of the cancellation date
   * @Param cancellationSource Who initiates the cancellation (e.g., the carrier or the insured).
   * @Param reasonCode Typekey indicating the reason for the cancellation.
   * @Param description Description for the cancellation.  May be null.
   * @Param refundCalcMethod Method used to determine the refund. If null, will be defaulted by
   *        reasonCode
   * @Param transactionId The unique id for this request. If this is duplicated with that of
   *        any other previous requests, AlreadyExecutedException will be thrown
   *
   * @Returns The unique job number for the started Cancellation job.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(AlreadyExecutedException, "If the transactionId is duplicated with that of any other"
    + " previous requests")
  @Throws(EntityStateException, "If no policy period with number <code>policyNumber</code>"
    + " effective on date <code>cancellationDate</code> can be found, if that policy period"
    + " cannot be canceled for any reason (e.g., the policy is not in force or the cancellation"
    + " would be an unsupported out-of-sequence change), or if any other error occurs"
    + " processing the SOAP request.")
  @Throws(PolicyTermInArchiveSOAPException, "If the policy term specified is in the archive, it may not"
    + " be cancelled. If necessary, restore the policy term from the archive in order to continue.")

  function beginCancellation(policyNumber : String, cancellationDate : Date,
      recalculateEffDate : boolean, cancellationSource : CancellationSource,
      reasonCode : typekey.ReasonCode, refundCalcMethod : CalculationMethod,
      description : String, transactionId : String) : String {
    return SOAPUtil.tryCatch(\ bundle -> {
      require( policyNumber, "policyNumber" )
      require( cancellationDate, "cancellationDate" )
      require( cancellationSource, "cancellationSource" )
      require( reasonCode, "reasonCode" )

      // Ensure the reasonCode matches the cancellationSource
      if(!reasonCode.Categories.contains(cancellationSource)){
        var error = displaykey.CancellationAPI.Error.ReasonCodeMismatch(cancellationSource, reasonCode)
        throw new EntityStateException(displaykey.CancellationAPI.Error.CannotCancel(policyNumber, error))
      }

      var period = retrievePolicyPeriod(policyNumber, cancellationDate, bundle)
      if (period.Archived) throw new PolicyTermInArchiveSOAPException(period.PolicyTerm)

      var error = period.Policy.canStartCancellation(cancellationDate)
      if (error != null) {
        throw new EntityStateException(displaykey.CancellationAPI.Error.CannotCancel(policyNumber, error))
      }

      try {
        var cancellation = new Cancellation(bundle)

        cancellation.Source = cancellationSource
        cancellation.CancelReasonCode = reasonCode
        cancellation.Description = description

        if(refundCalcMethod == null){
          refundCalcMethod = cancellation.calculateRefundCalcMethod( period )
        }
        var effectiveDate = adjustEffectiveDate(cancellationDate, recalculateEffDate, cancellation, period, refundCalcMethod)
        cancellation.startJob(period.Policy, effectiveDate, refundCalcMethod)
        cancellation.PolicyPeriod.CancellationProcess.scheduleCancellation( effectiveDate )

        return cancellation.JobNumber
      } catch (e : Exception) {
        throw new EntityStateException(e.LocalizedMessage)
      }
    }, transactionId)
  }

  /**
   * Reschedule a cancellation associated with the policy for the given policyNumber to the cancellationDate provided.
   *
   * @Param jobNumber The Job Number of the original cancellation. Cannot be null.
   * @Param newCancellationDate The effective date for the cancellation. Cannot be null.
   * @Param newDescription Description for the cancellation.  May be null.
   * @Param transactionId The unique id for this request. If this is duplicated with that of
   *        any other previous requests, AlreadyExecutedException will be thrown
   *
   * @Returns The unique job number for the rescheduled Cancellation job.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(AlreadyExecutedException, "If the transactionId is duplicated with that of any other"
    + " previous requests")
  @Throws(EntityStateException, "If no policy period with number <code>policyNumber</code>"
    + " effective on date <code>cancellationDate</code> can be found, if an initial"
    + " cancellation has not been scheduled, if that policy period"
    + " cannot be canceled for any reason (e.g., the policy is not in force or the cancellation"
    + " would be an unsupported out-of-sequence change), or if any other error occurs"
    + " processing the SOAP request.")
  function rescheduleCancellation(jobNumber : String, newCancellationDate : Date, newDescription : String, transactionId : String) : String {
    return SOAPUtil.tryCatch(\ bundle -> {
      require( jobNumber, "jobNumber" )
      require( newCancellationDate, "newCancellationDate" )

      var period : PolicyPeriod
      var cancellation = Job.finder.findJobByJobNumber(jobNumber) as Cancellation
      if (cancellation == null) {
        throw new EntityStateException(displaykey.JobAPI.InvalidJobNumber(jobNumber))
      }

      cancellation = bundle.add(cancellation)
      period = cancellation.PolicyPeriod
      var cancellationProcess = period.CancellationProcess
      if (period.Status != "Draft") {
        cancellationProcess.edit()
      }

      try {
        if (newDescription != null) {
          cancellation.Description = newDescription
        }
        period.CancellationProcess.setCancellationDate( newCancellationDate )
        period.CancellationProcess.requestQuote()
        period.CancellationProcess.rescheduleCancellation( newCancellationDate )

        return cancellation.JobNumber
      } catch (e : Exception) {
        throw new EntityStateException(e.StackTraceAsString)
      }
    }, transactionId)
  }

  private function adjustEffectiveDate(cancellationDate : Date, recalculateEffDate : boolean,
      cancellation : Cancellation, period : PolicyPeriod, refundCalcMethod : CalculationMethod) : Date {
    var effectiveDate = cancellationDate
    if(cancellationDate == null or recalculateEffDate) {
      var earliestDate = cancellation.getEarliestEffectiveDate(period, refundCalcMethod )
      if(cancellationDate == null or cancellationDate.before( earliestDate )) {
        effectiveDate = earliestDate
      }
    }
    return effectiveDate
  }

  /**
   * Rescinds an in-progress PolicyCenter Cancellation job for the given policy.
   *
   * @Param policyNumber The number of the period that is being canceled.
   * @Param effectiveDate The date that the cancellation will become effective on or after.
   * @Param source Who initiated the cancellation (e.g., the carrier or the insured).
   *        May be null.
   * @Param reason Typekey indicating the reason for the cancellation. May be null.
   * @Param transactionId The unique id for this request. If this is duplicated with that
   *        of any other previous requests, AlreadyExecutedException will be thrown.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(AlreadyExecutedException, "If the transactionId is duplicated with that of any"
    + " other previous requests.")
  @Throws(BadIdentifierException, "If no policy period with number <code>policyNumber</code> effective"
    + " on date <code>cancellationDate</code> with the given <code>cancellationSource</code>"
    + " and <code>reasonCode</code> (if supplied) can be found, if that policy period cannot"
    + " be rescinded for any reason (e.g., the policy cancellation already"
    + " completed), if there are multiple open cancellations for the policy period, or if"
    + " any other error occurs processing the SOAP request.")

  function rescindCancellation(policyNumber : String, effectiveDate :  Date,
                               source : CancellationSource, reason :  ReasonCode,
                               transactionId : String) {
    require(policyNumber, "policyNumber")
    PCLoggerCategory.CANCELLATION_API.info("Rescind cancellation {${policyNumber}, ${effectiveDate}, ${source}, ${reason}}")
    SOAPUtil.tryCatch(\ bundle -> {
      var q = new Query<PolicyPeriod>(PolicyPeriod)
      q.compare("PolicyNumber", Relop.Equals, policyNumber)
      if(effectiveDate <> null){
        q.compare("EditEffectiveDate", Relop.GreaterThanOrEquals, effectiveDate)
      }
      var cancellation = q.join("Job").cast(Cancellation)
      cancellation.compare("Source", Relop.Equals, source)
      cancellation.compare("CancelReasonCode", Relop.Equals, reason)
      var periods = q.select()
      if (periods.Count <> 1) {
        throw new BadIdentifierException(displaykey.CancellationAPI.Rescind.Error.NumberOfMatchingJobs( periods.Count))
      }
      _rescindCancellation(bundle.add(periods.single().Cancellation))
      return null
    }, transactionId)
  }

  /**
   * Rescinds an in-progress PolicyCenter Cancellation job.
   *
   * @Param jobNumber The number of the Cancellation job to rescind.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function rescindCancellationByJobNumber(jobNumber : String) {
    var jobQuery = Query.make(Job).compare("JobNumber", Equals, jobNumber)
    var jobs = jobQuery.select()
    var numJobs = jobs.Count
    if (numJobs != 1) {
      throw new BadIdentifierException(displaykey.CancellationAPI.Rescind.Error.NumberOfMatchingJobs(numJobs))
    }
    var job = jobs.FirstResult
    if (not (job typeis Cancellation)) {
      throw new BadIdentifierException(
        displaykey.CancellationAPI.Rescind.Error.NotCancellation(typeof job))
    }
    _rescindCancellation((jobs.getFirstResult() as Cancellation))
  }

  /**
   * Searches for cancellations that match the provided criteria and returns a list of their
   * job numbers.
   *
   * @Param policyNumber The number of the period that was canceled.  May be null if
   *        <code>cancellationDate</code> is non-null.
   * @Param cancellationDate The effective date of the cancellation. May be null if
   *        <code>policyNumber</code> is non-nulll.
   * @Param cancellationSource Who initiated the cancellation (e.g., the carrier or the
   *        insured). May be null.
   * @Param reasonCode Typekey indicating the reason for the cancellation. May be null.
   * @Param calculationMethod Method used to refund. May be null.
   *
   * @Returns An array of job numbers of all Cancellation jobs matching the provided criteria.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function findCancellations(
    policyNumber : String, cancellationDate : Date, cancellationSource : CancellationSource,
    reasonCode : ReasonCode, calculationMethod : CalculationMethod) : String[]
  {
    var criteria = new PolicySearchCriteria()

    // job type
    criteria.SearchObjectType = "Cancellation"

    // policy number
    criteria.PolicyNumber = policyNumber

    // date
    criteria.getDateCriteria().DateFieldToSearch = "EffectiveDate"
    criteria.getDateCriteria().DateSearchType = DateSearchType.TC_ENTEREDRANGE
    criteria.getDateCriteria().StartDate = cancellationDate.addDays( -1 )
    criteria.getDateCriteria().EndDate = cancellationDate.addDays( 1 )

    // source
    criteria.CancelSource = cancellationSource

    // reason code
    criteria.CancelReasonCode = reasonCode

    // refund method
    criteria.CancelRefundCalcMethod = calculationMethod

    var processor = criteria.makePolicyPeriodQuery()
    var jobNumbers = new ArrayList<String>()
    var it = processor.iterator()
    while (it.hasNext()) {
      var period = it.next()
      jobNumbers.add(period.getJob().getJobNumber())
    }
    return jobNumbers as String[]
  }


  ///////////////////////////////////////////////////////////////////////////////////
  //
  //                      Private methods
  //

  private function require(object : Object, name : String) {
    if (object == null){
      throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField(name))
    }
  }

  /**
   * Retrieves a policy period with the given policy number, as of date and
   * policy retrieval data.
   *
   * @param policyNumber The number of the policy to retrieve. Must not be null.
   * @param asOfDate The date used to determine which period of the policy to retrieve. Must
   *        not be null.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  private function retrievePolicyPeriod(policyNumber: String, asOfDate: Date, bundle: Bundle)
    : PolicyPeriod {
    require(policyNumber, "policyNumber")
    require(asOfDate, "asOfDate")
    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, asOfDate)
    if (period == null) {
      throw new BadIdentifierException(displaykey.CancellationAPI.Error.PolicyAndDateNotFound(
        policyNumber, asOfDate))
    }
    period = bundle.add(period)
    return period
  }

  /**
   * Rescinds an in-progress PolicyCenter Cancellation job for the given policy.
   */
  private function _rescindCancellation(cancellation: Cancellation) {
    var period = cancellation.PolicyPeriod
    if(period.Status == PolicyPeriodStatus.TC_BOUND){
      throw new EntityStateException(displaykey.CancellationAPI.Rescind.Error.AlreadyCompleted)
    }
    if (period.Status == PolicyPeriodStatus.TC_RESCINDED or
        period.Status == PolicyPeriodStatus.TC_WITHDRAWN or
        period.Status == PolicyPeriodStatus.TC_RESCINDING) {
      throw new EntityStateException(displaykey.CancellationAPI.Rescind.Error.AlreadyRescinded)
    }
    Transaction.runWithNewBundle( \bundle -> {
      try {
        period = bundle.add(period)
        if(period.Status == PolicyPeriodStatus.TC_CANCELING){
          period.CancellationProcess.rescind()
        }else{
          period.CancellationProcess.withdrawJob()
        }
      } catch (e : Exception) {
        throw new EntityStateException(e.getLocalizedMessage())
      }
    })
  }
}
