package gw.processes

uses gw.api.system.PLConfigParameters
uses gw.api.util.DateUtil
uses java.lang.Integer
uses gw.transaction.Transaction
uses gw.pl.persistence.core.Bundle
uses gw.processes.BatchProcessBase
uses com.guidewire.pl.system.database.query.DeleteBuilder
uses gw.api.database.Relop
uses com.guidewire.pl.system.dependency.PLDependencies
uses java.util.Date

@Export
class WorkQueueInstrumentationPurge extends BatchProcessBase {
  private var _daysOld : int
  private var _batchSize = 1024

  construct() {
    this({ PLConfigParameters.InstrumentedWorkerInfoPurgeDaysOld.Value })
  }

  construct(daysOld : int) {
    this({ daysOld })
  }

  private construct(arguments : Object[]) {
    super(TC_WorkQueueInstrumentationPurge)

    if (arguments != null) {
      if ((arguments.length > 0) && (arguments[0] != null)) {
        _daysOld = arguments[0] as Integer
      }
    }
  }

  override final function doWork() : void {
    OperationsCompleted = 0
    var date = PLDependencies.getSystemClock().DateTime.addBusinessDays(-_daysOld)
    OperationsCompleted += deleteExecutors(date)
    OperationsCompleted += deleteTasks(date)
  }

  function deleteExecutors(date: Date): int {
    var db = new DeleteBuilder(InstrumentedWorkExecutor.Type)
    db.Query.compare("EndTime", Relop.LessThan, date)
    return db.execute()
  }

  function deleteTasks(date: Date): int {
    var db = new DeleteBuilder(InstrumentedWorkerTask.Type)
    db.Query.compare("EndTime", Relop.LessThan, date)
    return db.execute()
  }
}
