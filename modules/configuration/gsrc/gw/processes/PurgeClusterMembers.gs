package gw.processes

uses gw.api.system.PLConfigParameters
uses gw.api.util.DateUtil

@Export
class PurgeClusterMembers extends PurgeProcessBase {
  construct() {
    this({PLConfigParameters.ClusterMemberPurgeDaysOld.Value})
  }

  construct(daysOld : String, batchSize : String) {
    this({daysOld, batchSize})
  }
  
  private construct(arguments : Object[]) {
    super(TC_PurgeClusterMembers, arguments)
  }

  override function getQueryToRetrieveOldEntries( daysOld : int ) : KeyableBeanQuery {
    return find(cm in ClusterMemberData where cm.LastUpdate < DateUtil.currentDate().addDays(- daysOld).Time)
  }
}
