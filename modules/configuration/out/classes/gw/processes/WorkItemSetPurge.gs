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
class WorkItemSetPurge extends BatchProcessBase {
  private var _daysOld : int

  construct() {
    this({ PLConfigParameters.BatchProcessHistoryPurgeDaysOld.Value })
  }

  construct(daysOld : int) {
    this({ daysOld })
  }

  private construct(arguments : Object[]) {
    super(TC_WorkItemSetPurge)

    if (arguments != null) {
      if ((arguments.length > 0) && (arguments[0] != null)) {
        _daysOld = arguments[0] as Integer
      }
    }
  }

  override final function doWork() : void {
    OperationsCompleted = 0
    var date = PLDependencies.getSystemClock().DateTime.addBusinessDays(-_daysOld)
    OperationsCompleted += deleteWorkItemSets(date)
  }

  function deleteWorkItemSets(date: Date): int {
    var db = new DeleteBuilder(WorkItemSet.Type)
    db.Query.compare("EndTime", Relop.LessThan, date)
    return db.execute()
  }
}
