/**
This is batch process that clears out completed workflow logs.  It expects upto
two parameters the days for successful processes, the batch size.

Things to note:
This will throw an exception out of the plugin if the args are not correct
That doWork does not have a bundle so it uses Transaction.runWithBundle to obtain a bundle
It uses the default check initial conditions
*/
package gw.processes

uses gw.api.util.DateUtil
uses gw.api.system.PLConfigParameters

@Export
class PurgeWorkflowLogs extends PurgeProcessBase
{
  construct() {
    this({PLConfigParameters.WorkflowLogPurgeDaysOld.Value})
  }

  construct(daysOld : int, batchSize : int) {
    this({daysOld, batchSize})
  }
  
  private construct(arguments : Object[]) {
    super(TC_PurgeWorkflowLogs, arguments)
  }

  override function getQueryToRetrieveOldEntries( daysOld : int ) : KeyableBeanQuery {
    return find(wl in WorkflowLogEntry 
                where wl.LogDate < DateUtil.currentDate().addDays(- daysOld)
                  and exists (w in WorkflowLogEntry.Workflow where w.State == "completed" ))
  }

}
