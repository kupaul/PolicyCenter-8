<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2moncommon.* %>




<%@ params( wlPeriods : DB2MonClasses.DB2PDWorkloadPeriods ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Workload Periods Statistics <B>
<br>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
   <th>Statistics Time</th>
   <th>Wlm Queue Time Total</th>
   <th>Wlm Queue Assignments Total</th>
   <th>Fcm Tq Recv Wait Time</th>
   <th>Fcm Message Recv Wait Time</th>
   <th>Fcm Tq Send Wait Time</th>
   <th>Fcm Message Send Wait Time</th>
   <th>Agent Wait Time</th>
   <th>Agent Waits Total</th>
   <th>Lock Wait Time</th>
   <th>Lock Waits</th>
   <th>Direct Read Time</th>
   <th>Direct Read Reqs</th>
   <th>Direct Write Time</th>
   <th>Direct Write Reqs</th>
   <th>Log Buffer Wait Time</th>
   <th>Num Log Buffer Full</th>
   <th>Log Disk Wait Time</th>
   <th>Log Disk Waits Total</th>
   <th>Tcpip Recv Wait Time</th>
   <th>Tcpip Recvs Total</th>
   <th>Client Idle Wait Time</th>
   <th>Ipc Recv Wait Time</th>
   <th>Ipc Recvs Total</th>
   <th>Ipc Send Wait Time</th>
   <th>Ipc Sends Total</th>
   <th>Tcpip Send Wait Time</th>
   <th>Tcpip Sends Total</th>
   <th>Pool Write Time</th>
   <th>Pool Read Time</th>
   <th>Audit File Write Wait Time</th>
   <th>Audit File Writes Total</th>
   <th>Audit Subsystem Wait Time</th>
   <th>Audit Subsystem Waits Total</th>
   <th>Diaglog Write Wait Time</th>
   <th>Diaglog Writes Total</th>
   <th>Fcm Send Wait Time</th>
   <th>Fcm Recv Wait Time</th>
   <th>Total Wait Time</th>
   <th>Total Rqst Time</th>
   <th>Rqsts Completed Total</th>
   <th>Total App Rqst Time</th>
   <th>App Rqsts Completed Total</th>
   <th>Total Section Sort Proc Time</th>
   <th>Total Section Sort Time</th>
   <th>Total Section Sorts</th>
   <th>Rows Read</th>
   <th>Rows Modified</th>
   <th>Pool Data L Reads</th>
   <th>Pool Index L Reads</th>
   <th>Pool Temp Data L Reads</th>
   <th>Pool Temp Index L Reads</th>
   <th>Pool Xda L Reads</th>
   <th>Pool Temp Xda L Reads</th>
   <th>Total Cpu Time</th>
   <th>Act Completed Total</th>
   <th>Pool Data P Reads</th>
   <th>Pool Temp Data P Reads</th>
   <th>Pool Xda P Reads</th>
   <th>Pool Temp Xda P Reads</th>
   <th>Pool Index P Reads</th>
   <th>Pool Temp Index P Reads</th>
   <th>Pool Data Writes</th>
   <th>Pool Xda Writes</th>
   <th>Pool Index Writes</th>
   <th>Direct Reads</th>
   <th>Direct Writes</th>
   <th>Rows Returned</th>
   <th>Deadlocks</th>
   <th>Lock Timeouts</th>
   <th>Lock Escals</th>
   <th>Fcm Sends Total</th>
   <th>Fcm Recvs Total</th>
   <th>Fcm Send Volume</th>
   <th>Fcm Recv Volume</th>
   <th>Fcm Message Sends Total</th>
   <th>Fcm Message Recvs Total</th>
   <th>Fcm Message Send Volume</th>
   <th>Fcm Message Recv Volume</th>
   <th>Fcm Tq Sends Total</th>
   <th>Fcm Tq Recvs Total</th>
   <th>Fcm Tq Send Volume</th>
   <th>Fcm Tq Recv Volume</th>
   <th>Tq Tot Send Spills</th>
   <th>Tcpip Send Volume</th>
   <th>Tcpip Recv Volume</th>
   <th>Ipc Send Volume</th>
   <th>Ipc Recv Volume</th>
   <th>Post Threshold Sorts</th>
   <th>Post Shrthreshold Sorts</th>
   <th>Sort Overflows</th>
   <th>Audit Events Total</th>
   <th>Total Rqst Mapped In{Zerooronetimes(?)}</th>
   <th>Total Rqst Mapped Out{Zerooronetimes(?)}</th>
   <th>Act Rejected Total</th>
   <th>Act Aborted Total</th>
   <th>Total Sorts</th>
   <th>Total Routine Time</th>
   <th>Total Compile Proc Time</th>
   <th>Total Compile Time</th>
   <th>Total Compilations</th>
   <th>Total Implicit Compile Proc Time</th>
   <th>Total Implicit Compile Time</th>
   <th>Total Implicit Compilations</th>
   <th>Total Runstats Proc Time</th>
   <th>Total Runstats Time</th>
   <th>Total Runstats</th>
   <th>Total Reorg Proc Time</th>
   <th>Total Reorg Time</th>
   <th>Total Reorgs</th>
   <th>Total Load Proc Time</th>
   <th>Total Load Time</th>
   <th>Total Loads</th>
   <th>Total Section Proc Time</th>
   <th>Total Section Time</th>
   <th>Total App Section Executions</th>
   <th>Total Commit Proc Time</th>
   <th>Total Commit Time</th>
   <th>Total App Commits</th>
   <th>Total Rollback Proc Time</th>
   <th>Total Rollback Time</th>
   <th>Total App Rollbacks</th>
   <th>Total Routine User Code Proc Time</th>
   <th>Total Routine User Code Time</th>
   <th>Thresh Violations</th>
   <th>Num Lw Thresh Exceeded</th>
   <th>Total Routine Invocations</th>
   <th>Int Commits</th>
   <th>Int Rollbacks</th>
   <th>Cat Cache Inserts</th>
   <th>Cat Cache Lookups</th>
   <th>Pkg Cache Inserts</th>
   <th>Pkg Cache Lookups</th>
   <th>Act Rqsts Total</th>
   <th>Total Act Wait Time</th>
   <th>Total Act Time</th>
   <th>Lock Wait Time Global</th>
   <th>Lock Waits Global</th>
   <th>Reclaim Wait Time</th>
   <th>Spacemappage Reclaim Wait Time</th>
   <th>Lock Timeouts Global</th>
   <th>Lock Escals Maxlocks</th>
   <th>Lock Escals Locklist</th>
   <th>Lock Escals Global</th>
   <th>Cf Wait Time</th>
   <th>Cf Waits</th>
   <th>Pool Data Gbp L Reads</th>
   <th>Pool Data Gbp P Reads</th>
   <th>Pool Data Lbp Pages Found</th>
   <th>Pool Data Gbp Invalid Pages</th>
   <th>Pool Index Gbp L Reads</th>
   <th>Pool Index Gbp P Reads</th>
   <th>Pool Index Lbp Pages Found</th>
   <th>Pool Index Gbp Invalid Pages</th>
   <th>Pool Xda Gbp L Reads</th>
   <th>Pool Xda Gbp P Reads</th>
   <th>Pool Xda Lbp Pages Found</th>
   <th>Pool Xda Gbp Invalid Pages</th>
   <th>Evmon Wait Time</th>
   <th>Evmon Waits Total</th>
   <th>Total Extended Latch Wait Time</th>
   <th>Total Extended Latch Waits</th>
   <th>Total Stats Fabrication Proc Time</th>
   <th>Total Stats Fabrication Time</th>
   <th>Total Stats Fabrications</th>
   <th>Total Sync Runstats Proc Time</th>
   <th>Total Sync Runstats Time</th>
   <th>Total Sync Runstats</th>
   <th>Total Disp Run Queue Time</th>
   <th>Pool Queued Async Data Reqs</th>
   <th>Pool Queued Async Index Reqs</th>
   <th>Pool Queued Async Xda Reqs</th>
   <th>Pool Queued Async Temp Data Reqs</th>
   <th>Pool Queued Async Temp Index Reqs</th>
   <th>Pool Queued Async Temp Xda Reqs</th>
   <th>Pool Queued Async Other Reqs</th>
   <th>Pool Queued Async Data Pages</th>
   <th>Pool Queued Async Index Pages</th>
   <th>Pool Queued Async Xda Pages</th>
   <th>Pool Queued Async Temp Data Pages</th>
   <th>Pool Queued Async Temp Index Pages</th>
   <th>Pool Queued Async Temp Xda Pages</th>
   <th>Pool Failed Async Data Reqs</th>
   <th>Pool Failed Async Index Reqs</th>
   <th>Pool Failed Async Xda Reqs</th>
   <th>Pool Failed Async Temp Data Reqs</th>
   <th>Pool Failed Async Temp Index Reqs</th>
   <th>Pool Failed Async Temp Xda Reqs</th>
   <th>Pool Failed Async Other Reqs</th>
   <th>App Act Completed Total</th>
   <th>App Act Aborted Total</th>
   <th>App Act Rejected Total</th>
   <th>Total Peds</th>
   <th>Disabled Peds</th>
   <th>Post Threshold Peds</th>
   <th>Total Peas</th>
   <th>Post Threshold Peas</th>
   <th>Tq Sort Heap Requests</th>
   <th>Tq Sort Heap Rejections</th>
   <th>Total Connect Request Proc Time</th>
   <th>Total Connect Request Time</th>
   <th>Total Connect Requests</th>
   <th>Total Connect Authentication Proc Time</th>
   <th>Total Connect Authentication Time</th>
   <th>Total Connect Authentications</th>
   <th>Prefetch Wait Time</th>
   <th>Prefetch Waits</th>
   <th>Pool Data Gbp Indep Pages Found In Lbp</th>
   <th>Pool Index Gbp Indep Pages Found In Lbp</th>
   <th>Pool Xda Gbp Indep Pages Found In Lbp</th>

</tr>
 <%  var odd = false
     var clss = "awrc"
     for (period in (wlPeriods.PeriodElements)) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
     var sm =  period.ParsedXML %>
     <tr class="${clss}">
<td>${period.StatisticsTime}</td>
<td>${sm.WlmQueueTimeTotal()}</td>
<td>${sm.WlmQueueAssignmentsTotal()}</td>
<td>${sm.FcmTqRecvWaitTime()}</td>
<td>${sm.FcmMessageRecvWaitTime()}</td>
<td>${sm.FcmTqSendWaitTime()}</td>
<td>${sm.FcmMessageSendWaitTime()}</td>
<td>${sm.AgentWaitTime()}</td>
<td>${sm.AgentWaitsTotal()}</td>
<td>${sm.LockWaitTime()}</td>
<td>${sm.LockWaits()}</td>
<td>${sm.DirectReadTime()}</td>
<td>${sm.DirectReadReqs()}</td>
<td>${sm.DirectWriteTime()}</td>
<td>${sm.DirectWriteReqs()}</td>
<td>${sm.LogBufferWaitTime()}</td>
<td>${sm.NumLogBufferFull()}</td>
<td>${sm.LogDiskWaitTime()}</td>
<td>${sm.LogDiskWaitsTotal()}</td>
<td>${sm.TcpipRecvWaitTime()}</td>
<td>${sm.TcpipRecvsTotal()}</td>
<td>${sm.ClientIdleWaitTime()}</td>
<td>${sm.IpcRecvWaitTime()}</td>
<td>${sm.IpcRecvsTotal()}</td>
<td>${sm.IpcSendWaitTime()}</td>
<td>${sm.IpcSendsTotal()}</td>
<td>${sm.TcpipSendWaitTime()}</td>
<td>${sm.TcpipSendsTotal()}</td>
<td>${sm.PoolWriteTime()}</td>
<td>${sm.PoolReadTime()}</td>
<td>${sm.AuditFileWriteWaitTime()}</td>
<td>${sm.AuditFileWritesTotal()}</td>
<td>${sm.AuditSubsystemWaitTime()}</td>
<td>${sm.AuditSubsystemWaitsTotal()}</td>
<td>${sm.DiaglogWriteWaitTime()}</td>
<td>${sm.DiaglogWritesTotal()}</td>
<td>${sm.FcmSendWaitTime()}</td>
<td>${sm.FcmRecvWaitTime()}</td>
<td>${sm.TotalWaitTime()}</td>
<td>${sm.TotalRqstTime()}</td>
<td>${sm.RqstsCompletedTotal()}</td>
<td>${sm.TotalAppRqstTime()}</td>
<td>${sm.AppRqstsCompletedTotal()}</td>
<td>${sm.TotalSectionSortProcTime()}</td>
<td>${sm.TotalSectionSortTime()}</td>
<td>${sm.TotalSectionSorts()}</td>
<td>${sm.RowsRead()}</td>
<td>${sm.RowsModified()}</td>
<td>${sm.PoolDataLReads()}</td>
<td>${sm.PoolIndexLReads()}</td>
<td>${sm.PoolTempDataLReads()}</td>
<td>${sm.PoolTempIndexLReads()}</td>
<td>${sm.PoolXdaLReads()}</td>
<td>${sm.PoolTempXdaLReads()}</td>
<td>${sm.TotalCpuTime()}</td>
<td>${sm.ActCompletedTotal()}</td>
<td>${sm.PoolDataPReads()}</td>
<td>${sm.PoolTempDataPReads()}</td>
<td>${sm.PoolXdaPReads()}</td>
<td>${sm.PoolTempXdaPReads()}</td>
<td>${sm.PoolIndexPReads()}</td>
<td>${sm.PoolTempIndexPReads()}</td>
<td>${sm.PoolDataWrites()}</td>
<td>${sm.PoolXdaWrites()}</td>
<td>${sm.PoolIndexWrites()}</td>
<td>${sm.DirectReads()}</td>
<td>${sm.DirectWrites()}</td>
<td>${sm.RowsReturned()}</td>
<td>${sm.Deadlocks()}</td>
<td>${sm.LockTimeouts()}</td>
<td>${sm.LockEscals()}</td>
<td>${sm.FcmSendsTotal()}</td>
<td>${sm.FcmRecvsTotal()}</td>
<td>${sm.FcmSendVolume()}</td>
<td>${sm.FcmRecvVolume()}</td>
<td>${sm.FcmMessageSendsTotal()}</td>
<td>${sm.FcmMessageRecvsTotal()}</td>
<td>${sm.FcmMessageSendVolume()}</td>
<td>${sm.FcmMessageRecvVolume()}</td>
<td>${sm.FcmTqSendsTotal()}</td>
<td>${sm.FcmTqRecvsTotal()}</td>
<td>${sm.FcmTqSendVolume()}</td>
<td>${sm.FcmTqRecvVolume()}</td>
<td>${sm.TqTotSendSpills()}</td>
<td>${sm.TcpipSendVolume()}</td>
<td>${sm.TcpipRecvVolume()}</td>
<td>${sm.IpcSendVolume()}</td>
<td>${sm.IpcRecvVolume()}</td>
<td>${sm.PostThresholdSorts()}</td>
<td>${sm.PostShrthresholdSorts()}</td>
<td>${sm.SortOverflows()}</td>
<td>${sm.AuditEventsTotal()}</td>
<td>${sm.TotalRqstMappedIn()}</td>
<td>${sm.TotalRqstMappedOut()}</td>
<td>${sm.ActRejectedTotal()}</td>
<td>${sm.ActAbortedTotal()}</td>
<td>${sm.TotalSorts()}</td>
<td>${sm.TotalRoutineTime()}</td>
<td>${sm.TotalCompileProcTime()}</td>
<td>${sm.TotalCompileTime()}</td>
<td>${sm.TotalCompilations()}</td>
<td>${sm.TotalImplicitCompileProcTime()}</td>
<td>${sm.TotalImplicitCompileTime()}</td>
<td>${sm.TotalImplicitCompilations()}</td>
<td>${sm.TotalRunstatsProcTime()}</td>
<td>${sm.TotalRunstatsTime()}</td>
<td>${sm.TotalRunstats()}</td>
<td>${sm.TotalReorgProcTime()}</td>
<td>${sm.TotalReorgTime()}</td>
<td>${sm.TotalReorgs()}</td>
<td>${sm.TotalLoadProcTime()}</td>
<td>${sm.TotalLoadTime()}</td>
<td>${sm.TotalLoads()}</td>
<td>${sm.TotalSectionProcTime()}</td>
<td>${sm.TotalSectionTime()}</td>
<td>${sm.TotalAppSectionExecutions()}</td>
<td>${sm.TotalCommitProcTime()}</td>
<td>${sm.TotalCommitTime()}</td>
<td>${sm.TotalAppCommits()}</td>
<td>${sm.TotalRollbackProcTime()}</td>
<td>${sm.TotalRollbackTime()}</td>
<td>${sm.TotalAppRollbacks()}</td>
<td>${sm.TotalRoutineUserCodeProcTime()}</td>
<td>${sm.TotalRoutineUserCodeTime()}</td>
<td>${sm.ThreshViolations()}</td>
<td>${sm.NumLwThreshExceeded()}</td>
<td>${sm.TotalRoutineInvocations()}</td>
<td>${sm.IntCommits()}</td>
<td>${sm.IntRollbacks()}</td>
<td>${sm.CatCacheInserts()}</td>
<td>${sm.CatCacheLookups()}</td>
<td>${sm.PkgCacheInserts()}</td>
<td>${sm.PkgCacheLookups()}</td>
<td>${sm.ActRqstsTotal()}</td>
<td>${sm.TotalActWaitTime()}</td>
<td>${sm.TotalActTime()}</td>
<td>${sm.LockWaitTimeGlobal()}</td>
<td>${sm.LockWaitsGlobal()}</td>
<td>${sm.ReclaimWaitTime()}</td>
<td>${sm.SpacemappageReclaimWaitTime()}</td>
<td>${sm.LockTimeoutsGlobal()}</td>
<td>${sm.LockEscalsMaxlocks()}</td>
<td>${sm.LockEscalsLocklist()}</td>
<td>${sm.LockEscalsGlobal()}</td>
<td>${sm.CfWaitTime()}</td>
<td>${sm.CfWaits()}</td>
<td>${sm.PoolDataGbpLReads()}</td>
<td>${sm.PoolDataGbpPReads()}</td>
<td>${sm.PoolDataLbpPagesFound()}</td>
<td>${sm.PoolDataGbpInvalidPages()}</td>
<td>${sm.PoolIndexGbpLReads()}</td>
<td>${sm.PoolIndexGbpPReads()}</td>
<td>${sm.PoolIndexLbpPagesFound()}</td>
<td>${sm.PoolIndexGbpInvalidPages()}</td>
<td>${sm.PoolXdaGbpLReads()}</td>
<td>${sm.PoolXdaGbpPReads()}</td>
<td>${sm.PoolXdaLbpPagesFound()}</td>
<td>${sm.PoolXdaGbpInvalidPages()}</td>
<td>${sm.EvmonWaitTime()}</td>
<td>${sm.EvmonWaitsTotal()}</td>
<td>${sm.TotalExtendedLatchWaitTime()}</td>
<td>${sm.TotalExtendedLatchWaits()}</td>
<td>${sm.TotalStatsFabricationProcTime()}</td>
<td>${sm.TotalStatsFabricationTime()}</td>
<td>${sm.TotalStatsFabrications()}</td>
<td>${sm.TotalSyncRunstatsProcTime()}</td>
<td>${sm.TotalSyncRunstatsTime()}</td>
<td>${sm.TotalSyncRunstats()}</td>
<td>${sm.TotalDispRunQueueTime()}</td>
<td>${sm.PoolQueuedAsyncDataReqs()}</td>
<td>${sm.PoolQueuedAsyncIndexReqs()}</td>
<td>${sm.PoolQueuedAsyncXdaReqs()}</td>
<td>${sm.PoolQueuedAsyncTempDataReqs()}</td>
<td>${sm.PoolQueuedAsyncTempIndexReqs()}</td>
<td>${sm.PoolQueuedAsyncTempXdaReqs()}</td>
<td>${sm.PoolQueuedAsyncOtherReqs()}</td>
<td>${sm.PoolQueuedAsyncDataPages()}</td>
<td>${sm.PoolQueuedAsyncIndexPages()}</td>
<td>${sm.PoolQueuedAsyncXdaPages()}</td>
<td>${sm.PoolQueuedAsyncTempDataPages()}</td>
<td>${sm.PoolQueuedAsyncTempIndexPages()}</td>
<td>${sm.PoolQueuedAsyncTempXdaPages()}</td>
<td>${sm.PoolFailedAsyncDataReqs()}</td>
<td>${sm.PoolFailedAsyncIndexReqs()}</td>
<td>${sm.PoolFailedAsyncXdaReqs()}</td>
<td>${sm.PoolFailedAsyncTempDataReqs()}</td>
<td>${sm.PoolFailedAsyncTempIndexReqs()}</td>
<td>${sm.PoolFailedAsyncTempXdaReqs()}</td>
<td>${sm.PoolFailedAsyncOtherReqs()}</td>
<td>${sm.AppActCompletedTotal()}</td>
<td>${sm.AppActAbortedTotal()}</td>
<td>${sm.AppActRejectedTotal()}</td>
<td>${sm.TotalPeds()}</td>
<td>${sm.DisabledPeds()}</td>
<td>${sm.PostThresholdPeds()}</td>
<td>${sm.TotalPeas()}</td>
<td>${sm.PostThresholdPeas()}</td>
<td>${sm.TqSortHeapRequests()}</td>
<td>${sm.TqSortHeapRejections()}</td>
<td>${sm.TotalConnectRequestProcTime()}</td>
<td>${sm.TotalConnectRequestTime()}</td>
<td>${sm.TotalConnectRequests()}</td>
<td>${sm.TotalConnectAuthenticationProcTime()}</td>
<td>${sm.TotalConnectAuthenticationTime()}</td>
<td>${sm.TotalConnectAuthentications()}</td>
<td>${sm.PrefetchWaitTime()}</td>
<td>${sm.PrefetchWaits()}</td>
<td>${sm.PoolDataGbpIndepPagesFoundInLbp()}</td>
<td>${sm.PoolIndexGbpIndepPagesFoundInLbp()}</td>
<td>${sm.PoolXdaGbpIndepPagesFoundInLbp()}</td>
 </tr>     
    <% } %>
    </table>

    </body>
 </html>
