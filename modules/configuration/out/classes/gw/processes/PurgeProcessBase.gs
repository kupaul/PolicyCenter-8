/**
   This is the base batch process to clear out "old" data. It expects two optional parameters: 
   the number of days before data is considered old and the batch size. 

   Things to note:
   This will throw an exception out of the plugin if the args are not correct
   That doWork does not have a bundle so it uses Transaction.runWithBundle to obtain a bundle
   It uses the default check initial conditions
 */
package gw.processes

uses gw.processes.BatchProcessBase
uses java.lang.Integer
uses gw.transaction.Transaction

@Export
abstract class PurgeProcessBase extends BatchProcessBase
{
  private var _daysOld : int
  private var _batchSize = 1024

  construct(batchProcessType : BatchProcessType, daysOld : int, batchSize : int) {
    this(batchProcessType, {daysOld, batchSize})
  }
  
  construct(batchProcessType : BatchProcessType, arguments : Object[]) {
    super(batchProcessType)
    if (arguments != null) {
      if ((arguments.length > 0) && (arguments[0] != null)) {
        _daysOld = arguments[0] as Integer
      }
      if ((arguments.length > 1) && (arguments[1] != null)) {
        _batchSize = arguments[1] as Integer
      }
    }
  }

  override final function doWork() : void { 
    var query = getQueryToRetrieveOldEntries(_daysOld)
    OperationsExpected = query.getCount()
    var itr = query.iterator() 
    while (itr.hasNext() and not TerminateRequested) {
      Transaction.runWithNewBundle( \ b -> {
        var cnt = 0
        while (itr.hasNext() and cnt < _batchSize and not TerminateRequested) {
          cnt = cnt + 1
          incrementOperationsCompleted()
          b.remove( itr.next() )
      }
      }, "su")
    }
  }
  
  protected abstract function getQueryToRetrieveOldEntries(daysOld : int) : KeyableBeanQuery
}
