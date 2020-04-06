package gw.webservice
uses gw.api.system.PCLoggerCategory
uses gw.api.database.Query
uses gw.api.webservice.exception.AlreadyExecutedException
uses gw.api.webservice.exception.FieldConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.ServerStateException
uses gw.api.webservice.exception.SOAPException
uses org.slf4j.Logger
uses java.lang.Throwable
uses gw.pl.persistence.core.Bundle
uses gw.transaction.Transaction
uses java.lang.Exception
uses java.lang.Throwable

@Export
class SOAPUtil
{
  private construct() { }

  /**
   * Throws a {@link FieldConversionException} if <code>object</code> is null. The exception message
   * will be <code>description</code>.
   */
  static function notNull( object : Object, description : String ) {
    if (object == null){
      throw new FieldConversionException( description )
    }
  }

    /**
   * Check that the given value is not null. If it is, throw an exception
   * complaining that the required parameter "parameterName" is null.
   *
   * @param value         the value of the parameter
   * @param parameterName the name of the parameter, used in the exception message
   */
  static function require(value: Object, parameterName: String) {
    if (value == null) {
      throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField(parameterName))
    }
  }

  /**
   * Calls the block and converts any exception to a SOAPException
   */

  static function convertToSOAPException(aLogger : Logger, aCall : block()) {
    try {
      aCall()
    }
    catch (e : SOAPException) {
      // Log the exception because we're losing the stack trace from the original
      // exception
      aLogger.error(e.toString(), e)
      throw e
    }
    catch (e : Throwable) {
      aLogger.error(e.toString(), e)
      throw new SOAPException(e.toString())
    }
  }

  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(ServerStateException, "if other exception occurs")
  public static function tryCatch<T>(call : block(bundle : Bundle) : T, transactionId : String) : T {
    // check the uniqueness of the transaction id
    // we stray away from using the TransactionId table because the only way to set it
    // is not committed twice.
    var executionCount = Query.make(Sequence)
          .compare("SequenceKey", Equals, transactionId)
          .compare("SequenceNumber", Equals, 1 as java.lang.Long)
          .select().Count
    if(executionCount > 0){
      PCLoggerCategory.API.warn("Transaction ${transactionId} is already executed")
      throw new AlreadyExecutedException(displaykey.SOAPUtil.AlreadyExecuted(transactionId))
    }
    var result : T
    try{
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        if(transactionId <> null){
          var s = new Sequence(bundle)
          s.SequenceKey = transactionId
          s.SequenceNumber = 1
        }
        result = call(bundle)
      })
    }catch(e : com.guidewire.pl.system.exception.DBAlreadyExecutedException){
      // this can still happen after the checked above because of race condition
      e.printStackTrace()
      throw new AlreadyExecutedException(displaykey.SOAPUtil.AlreadyExecuted(transactionId))
    }catch(e : Exception){
      e.printStackTrace()
      throw e
    }
    return result
  }
}
