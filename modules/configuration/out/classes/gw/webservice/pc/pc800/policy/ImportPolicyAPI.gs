package gw.webservice.pc.pc800.policy

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiWebService
uses java.lang.Exception
uses java.util.ArrayList
uses java.util.Date
uses gw.api.productmodel.ProductLookup
uses gw.xml.ws.annotation.WsiPermissions
uses gw.api.system.PCLoggerCategory

/**
 * This api is used to import external policy periods into Policy Center using
 * xml data.
 */
@Export
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/policy/ImportPolicyAPI")
class ImportPolicyAPI {

  construct() {  }

  /**
   * Quote a submission in PolicyCenter.
   *
   * @param accountNumber account number
   * @param productCode the code of the product (e.g., PersonalAuto, WorkersComp)
   * @param producerCodeId public id of the producer code
   * @param policyPeriodData the data used to populate the new policy period
   * @param parseOptions the options passed to the parser to parse policyPeriodData
   *
   * @return a QuoteResponse object containing the Submission number and any errors generated
   */
  @Throws(SOAPException, "If communication fails")
  @Throws(RequiredFieldException, "If any required field (accountNumber, producerCodeId or productCode) is null")
  @Throws(BadIdentifierException, "If cannot find an account, producer code or product with the specified id")
  @Throws(DataConversionException, "If cannot populate policy period from policyPeriodData.")
  @Param("accountNumber", "The relevant Account number")
  @Param("productCode", "the code of the product (e.g., PersonalAuto, WorkersComp)")
  @Param("producerCodeId", "public id of the producer code")
  @Param("policyPeriodData", "the data used to populate the new PolicyPeriod")
  @Param("parseOptions", "the options passed to the parser to parse policyPeriodData")
  @WsiPermissions({SystemPermissionType.TC_EDITSUBMISSION, SystemPermissionType.TC_QUOTE})
  @Returns("a QuoteResponse object containing the Submission number and any errors generated")
  function quoteSubmission(accountNumber : String,
                                productCode : String,
                                producerCodeId : String,
                                policyPeriodData : String,
                                parseOptions : String) : QuoteResponse {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(productCode, "productCode")
    SOAPUtil.require(producerCodeId, "producerCodeId")

    var account = Account.finder.findAccountByAccountNumber(accountNumber)
    if(account == null){
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindAccount(accountNumber))
    }
    var producerCodeQuery = Query.make(ProducerCode).compare("PublicID", Equals, producerCodeId)
    var producerCode = producerCodeQuery.select().AtMostOneRow
    if(producerCode == null){
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindProducerCode(producerCodeId))
    }
    var product = ProductLookup.getByCode(productCode)
    if(product == null){
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindProductCode(productCode))
    }

    var policyPeriod : PolicyPeriod
    var errors = new ArrayList<String>() // quoting error
    Transaction.runWithNewBundle(\ bundle -> {
      account = bundle.add(account)
      try{
        var submission = account.createSubmission(Date.Today, product, producerCode,
          \ period -> {
            if(policyPeriodData <> null and policyPeriodData.NotBlank){
              var model = gw.webservice.pc.pc800.gxmodel.policyperiodmodel.PolicyPeriod.parse(policyPeriodData)
              model.$TypeInstance.populatePolicyPeriod(period)
            }
          })
        // don't know why we have to do this but if we don't the period will new instead of draft
        policyPeriod = submission.LatestPeriod
        policyPeriod.SubmissionProcess.beginEditing()
      }catch(e : Exception){
        PCLoggerCategory.API.error(e.Message, e)
        throw new DataConversionException(e.Message)
      }
    })
    Transaction.runWithNewBundle(\ bundle -> {
      try{
        policyPeriod = bundle.add(policyPeriod)
        policyPeriod.SubmissionProcess.requestQuote(null, ValidationLevel.TC_QUOTABLE, RatingStyle.TC_QUICKQUOTE)
      }catch(e : Exception){
        errors.add(e.Message)
      }
    })
    return new QuoteResponse(policyPeriod.Job.JobNumber, errors.toTypedArray())
  }
}