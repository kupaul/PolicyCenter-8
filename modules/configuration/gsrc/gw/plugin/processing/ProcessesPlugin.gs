package gw.plugin.processing
uses gw.plugin.processing.IProcessesPlugin
uses gw.processes.BatchProcess
uses gw.processes.PolicyRenewalClearCheckDate
uses gw.processes.ApplyPendingAccountDataUpdates
uses gw.processes.SolrDataImportBatchProcess

@Export
class ProcessesPlugin implements IProcessesPlugin {

  construct() {
  }

  override function createBatchProcess(type : BatchProcessType, arguments : Object[]) : BatchProcess {
    switch(type) {
      case BatchProcessType.TC_POLICYRENEWALCLEARCHECKDATE:
        return new PolicyRenewalClearCheckDate()
      case BatchProcessType.TC_APPLYPENDINGACCOUNTDATAUPDATES:
        return new ApplyPendingAccountDataUpdates()
      case BatchProcessType.TC_SOLRDATAIMPORT:
        return new SolrDataImportBatchProcess()
      default:
        return null
    }
  }

}
