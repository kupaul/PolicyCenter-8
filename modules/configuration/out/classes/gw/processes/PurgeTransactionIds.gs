/**
This is batch process that clears out irrelevant transaction ids.  It can be run with an
optional parameter to override the age.
*/
package gw.processes

uses java.lang.Integer
uses gw.api.system.PLConfigParameters
uses com.guidewire.pl.domain.transaction.impl.TransactionIdImpl

@Export
class PurgeTransactionIds extends BatchProcessBase
{
  var _succDays = PLConfigParameters.TransactionIdPurgeDaysOld.Value

  construct() {
    this(null)
  }
  
  construct(arguments : Object[]) {
    super("PurgeTransactionIds")
    if (arguments != null) {
      _succDays = arguments[1] != null ? (arguments[1] as Integer) : _succDays
    }
  }

  override function doWork() : void {
    TransactionIdImpl.deleteOld( _succDays )
  }
}
