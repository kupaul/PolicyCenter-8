package gw.webservice.pc.pc700.job
uses gw.webservice.SOAPUtil
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.DataConversionException
uses gw.transaction.Transaction
uses gw.api.productmodel.Product
uses gw.api.webservice.exception.BadIdentifierException
uses java.lang.Exception
uses java.util.Date
uses gw.api.database.Query
uses gw.api.productmodel.ProductLookup

/**
 * API to create submissions for all LOBs.
 */
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/job/SubmissionAPI" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.job.SubmissionAPI instead")
class SubmissionAPI {

  /**
   * Start a draft submission in PolicyCenter. The policy data is passed
   * in as policyPeriodData string which will be parsed by Guidewire's PolicyPeriod GX model schema.
   *
   * @param accountNumber account number
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param producerCodeId public id of the producer code
   * @param policyPeriodData the data used to populate the new policy period
   * @param parseOptions the options passed to the parser to parse policyPeriodData
   *
   * @return the job number of the submission
   */
  @Throws(SOAPException, "If communication fails")
  @Throws(RequiredFieldException, "If any required field (accountNumber, producerCodeId or productCode) is null")
  @Throws(BadIdentifierException, "If cannot find an account, producer code or product with the specified id")
  @Throws(DataConversionException, "If cannot populate policy period from policyPeriodData.")
  function startDraftSubmission(accountNumber : String,
                                productCode : String,
                                producerCodeId : String,
                                policyPeriodData : String,
                                parseOptions : String) : String {
    var policyPeriod = startSubmission(accountNumber, productCode, producerCodeId,
                                policyPeriodData, parseOptions)
    return policyPeriod.Job.JobNumber
  }

  private function startSubmission(accountNumber : String,
                                productCode : String,
                                producerCodeId : String,
                                policyPeriodData : String,
                                parseOptions : String) : PolicyPeriod{
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(productCode, "productCode")
    SOAPUtil.require(producerCodeId, "producerCodeId")

    var account = Account.finder.findAccountByAccountNumber(accountNumber)
    if(account == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindAccountNumber(accountNumber))
    }

    var producerCodeQuery = Query.make(ProducerCode).compare("PublicID", Equals, producerCodeId)
    var producerCode = producerCodeQuery.select().AtMostOneRow
    if(producerCode == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindProducerCode(producerCodeId))
    }
    var product = ProductLookup.getByCode(productCode)
    if(product == null){
      throw new BadIdentifierException(displaykey.JobAPI.CantFindProductCode(productCode))
    }

    var policyPeriod : PolicyPeriod
    Transaction.runWithNewBundle(\ bundle -> {
      account = bundle.add(account)
      try{
        var submission = account.createSubmission(Date.Today, product, producerCode,
          \ period -> {
            if(policyPeriodData <> null and policyPeriodData.NotBlank){
              var model = gw.webservice.pc.pc700.gxmodel.policyperiodmodel.PolicyPeriod.parse(policyPeriodData)
              model.$TypeInstance.populatePolicyPeriod(period)
            }
          })
        // don't know why we have to do this but if we don't the period will new instead of draft
        policyPeriod = submission.LatestPeriod
        policyPeriod.SubmissionProcess.beginEditing()
      }catch(e : Exception){
        e.printStackTrace()
        throw new DataConversionException(e.Message)
      }
    })
    return policyPeriod
  }

  /**
   * Quote a submission in PolicyCenter.
   *
   * @param accountNumber account number
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param producerCodeId public id of the producer code
   * @param policyPeriodData the data used to populate the new policy period
   * @param parseOptions the options passed to the parser to parse policyPeriodData
   *
   * @return the job number of the submission
   */
  @Throws(SOAPException, "If communication fails")
  @Throws(RequiredFieldException, "If any required field (accountNumber, producerCodeId or productCode) is null")
  @Throws(BadIdentifierException, "If cannot find an account, producer code or product with the specified id")
  @Throws(DataConversionException, "If cannot populate policy period from policyPeriodData.")
  function quoteSubmission(accountNumber : String,
                                productCode : String,
                                producerCodeId : String,
                                policyPeriodData : String,
                                parseOptions : String) : String {
    var policyPeriod = startSubmission(accountNumber, productCode, producerCodeId,
                                policyPeriodData, parseOptions)
    Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.SubmissionProcess.requestQuote()
    })
    return policyPeriod.Job.JobNumber
  }
}
