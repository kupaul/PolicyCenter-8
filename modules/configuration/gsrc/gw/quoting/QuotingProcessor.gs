package gw.quoting

uses gw.api.database.Query
uses gw.api.productmodel.ProductLookup
uses gw.api.system.PCLoggerCategory
uses gw.api.webservice.exception.BadIdentifierException
uses gw.job.JobProcess
uses gw.job.JobProcessUWIssueEvaluator
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.quoting.QuotingDataPlugin
uses gw.util.ILogger

uses java.util.Date
uses gw.api.profiler.Profiler
uses gw.api.profiler.PCProfilerTag

/**
 * Processor to create quotes for all LOBs.
 */
@Export
class QuotingProcessor {

  protected static final var LOGGER : ILogger = PCLoggerCategory.QUOTING
  protected var _plugin : QuotingDataPlugin
  
  construct() {
    _plugin = Plugins.get(QuotingDataPlugin)
  }
  
  // Get an Account entity
  protected function getAccount(policyPeriodData : gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.PolicyPeriod)
      : Account {
    var startFrame = Profiler.push(PCProfilerTag.DIST_QUOTE_GET_ACCOUNT);
    var account : Account
    try {
      account = _plugin.getAccount(policyPeriodData)
    } finally {
      Profiler.pop(startFrame);
    }

    LOGGER.debug("Quoting Account used: " + account.DisplayName)
    return account
  }

  // Get a ProducerCode for the specified Account.  
  protected function getProducerCode(account : Account) : ProducerCode {
    var query = Query.make(ProducerCode)
    var producerCodesWithSpecifiedAccount = query.join(AccountProducerCode, "ProducerCode")
        .compare("Account", Equals, account)
    return producerCodesWithSpecifiedAccount.select().first()
  }
  
  protected function startSubmission(bundle : Bundle, productCode : String,
      policyPeriodData : gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.PolicyPeriod) : PolicyPeriod {
        
    var product = ProductLookup.getByCode(productCode)
    if (product == null){
      throw new BadIdentifierException(displaykey.Quoting.Submission.Error.CannotFindProductCode(productCode))
    }

    var account = bundle.add(getAccount(policyPeriodData))
    var submission = account.createSubmission(Date.Today, product, getProducerCode(account), \ period -> {
      if (policyPeriodData <> null) {
        policyPeriodData.$TypeInstance.populatePolicyPeriod(period)
      }
    })
    // don't know why we have to do this but if we don't the period will new instead of draft
    var policyPeriod = submission.LatestPeriod
    policyPeriod.SubmissionProcess.beginEditing()
    return policyPeriod
  }

  /**
   * Quote a submission in PolicyCenter. The submission is not committed into the database.
   * 
   * The XML representation of the returning quote (PolicyPeriod GX Model) is persisted into the external database
   * by the plugin.
   *
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param policyPeriodData the GX model request data used to populate the new policy period
   *
   * @return a QuoteData
   */
  function quoteSubmission(productCode : String, policyPeriodData : gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.PolicyPeriod)
      : QuoteData {
    LOGGER.debug("Quote Request:\n" + policyPeriodData.asUTFString())
    var policyPeriod = QuotingUtil.runInThrowAwayBundle(\ bundle -> {
      var policyPeriod = startSubmission(bundle, productCode, policyPeriodData)
      quoteMaybeSkippingEvaluation(policyPeriod.SubmissionProcess, true, ValidationLevel.TC_QUICKQUOTABLE, RatingStyle.TC_QUICKQUOTE)

      return policyPeriod
    })
    var model = new gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.PolicyPeriod(policyPeriod)
    var xml = model.asUTFString()
    LOGGER.debug("Quote Response:\n" + xml)

    var startFrame = Profiler.push(PCProfilerTag.DIST_QUOTE_SEND_DATA);
    var quoteID : Object
    try {
      quoteID = _plugin.sendQuotingData(xml)
    } finally {
      Profiler.pop(startFrame)
    }
    var quoteData = new QuoteData() {
      :PolicyQuoteID = quoteID,
      :PolicyPeriod = model
    }
    return quoteData
  }

  /**
   * @param skipEvaluation allows quote even if there are UW issues with the policy period being quoted.
   */
  protected function quoteMaybeSkippingEvaluation(jobProcess : JobProcess, skipEvaluation : boolean, 
      valLevel: ValidationLevel, ratingStyle : RatingStyle) {
    var prevEvaluator = jobProcess.JobProcessEvaluator
    try {
      if (skipEvaluation) {
        jobProcess.JobProcessEvaluator = JobProcessUWIssueEvaluator.NO_OP_EVALUATOR
      }
      jobProcess.requestQuote(valLevel, ratingStyle)
    } finally {
      jobProcess.JobProcessEvaluator = prevEvaluator
    }  
  }

}
