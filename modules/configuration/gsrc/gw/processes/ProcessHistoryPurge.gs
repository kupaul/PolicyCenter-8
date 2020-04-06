package gw.processes

uses gw.api.system.PLConfigParameters
uses gw.api.util.DateUtil

@Export
class ProcessHistoryPurge extends PurgeProcessBase {

  construct() {
    this({PLConfigParameters.BatchProcessHistoryPurgeDaysOld.Value})
  }

  construct(daysOld : int, batchSize : int) {
    this({daysOld, batchSize})
  }
  
  private construct(arguments : Object[]) {
    super(TC_ProcessHistoryPurge, arguments)
  }

  override function getQueryToRetrieveOldEntries( daysOld : int ) : KeyableBeanQuery {
    return find(ph in ProcessHistory where ph.CompleteDate < DateUtil.currentDate().addDays(- daysOld))
  }
}
