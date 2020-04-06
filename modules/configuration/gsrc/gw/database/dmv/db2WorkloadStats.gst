<% uses gw.xsd.database.db2monroutines.* %>
<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<%@ params( workload : byte[] ) %>

<B> DB2 Workload Information <B>

<% var xml = Db2Workload.parse(workload)  %>
 
 <table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">

 <tr><th>Metric</th> <th>Value</th></tr>  
<tr><td class="awrnc">workload name</td>	<td class="awrnc">${xml.WorkloadName}</td></tr>
<tr><td class="awrc">workload id</td>	<td class="awrc">${xml.WorkloadId}</td></tr>
<tr><td class="awrnc">wlm queue time total</td>	<td class="awrnc">${xml.SystemMetrics.WlmQueueTimeTotal}</td></tr>
<tr><td class="awrc">wlm queue assignments total</td>	<td class="awrc">${xml.SystemMetrics.WlmQueueAssignmentsTotal}</td></tr>
<tr><td class="awrnc">fcm tq recv wait time</td>	<td class="awrnc">${xml.SystemMetrics.FcmTqRecvWaitTime}</td></tr>
<tr><td class="awrc">fcm message recv wait time</td>	<td class="awrc">${xml.SystemMetrics.FcmMessageRecvWaitTime}</td></tr>
<tr><td class="awrnc">fcm tq send wait time</td>	<td class="awrnc">${xml.SystemMetrics.FcmTqSendWaitTime}</td></tr>
<tr><td class="awrc">fcm message send wait time</td>	<td class="awrc">${xml.SystemMetrics.FcmMessageSendWaitTime}</td></tr>
<tr><td class="awrnc">agent wait time</td>	<td class="awrnc">${xml.SystemMetrics.AgentWaitTime}</td></tr>
<tr><td class="awrc">agent waits total</td>	<td class="awrc">${xml.SystemMetrics.AgentWaitsTotal}</td></tr>
<tr><td class="awrnc">lock wait time</td>	<td class="awrnc">${xml.SystemMetrics.LockWaitTime}</td></tr>
<tr><td class="awrc">lock waits</td>	<td class="awrc">${xml.SystemMetrics.LockWaits}</td></tr>
<tr><td class="awrnc">direct read time</td>	<td class="awrnc">${xml.SystemMetrics.DirectReadTime}</td></tr>
<tr><td class="awrc">direct read reqs</td>	<td class="awrc">${xml.SystemMetrics.DirectReadReqs}</td></tr>
<tr><td class="awrnc">direct write time</td>	<td class="awrnc">${xml.SystemMetrics.DirectWriteTime}</td></tr>
<tr><td class="awrc">direct write reqs</td>	<td class="awrc">${xml.SystemMetrics.DirectWriteReqs}</td></tr>
<tr><td class="awrnc">log buffer wait time</td>	<td class="awrnc">${xml.SystemMetrics.LogBufferWaitTime}</td></tr>
<tr><td class="awrc">num log buffer full</td>	<td class="awrc">${xml.SystemMetrics.NumLogBufferFull}</td></tr>
<tr><td class="awrnc">log disk wait time</td>	<td class="awrnc">${xml.SystemMetrics.LogDiskWaitTime}</td></tr>
<tr><td class="awrc">log disk waits total</td>	<td class="awrc">${xml.SystemMetrics.LogDiskWaitsTotal}</td></tr>
<tr><td class="awrnc">tcpip recv wait time</td>	<td class="awrnc">${xml.SystemMetrics.TcpipRecvWaitTime}</td></tr>
<tr><td class="awrc">tcpip recvs total</td>	<td class="awrc">${xml.SystemMetrics.TcpipRecvsTotal}</td></tr>
<tr><td class="awrnc">client idle wait time</td>	<td class="awrnc">${xml.SystemMetrics.ClientIdleWaitTime}</td></tr>
<tr><td class="awrc">ipc recv wait time</td>	<td class="awrc">${xml.SystemMetrics.IpcRecvWaitTime}</td></tr>
<tr><td class="awrnc">ipc recvs total</td>	<td class="awrnc">${xml.SystemMetrics.IpcRecvsTotal}</td></tr>
<tr><td class="awrc">ipc send wait time</td>	<td class="awrc">${xml.SystemMetrics.IpcSendWaitTime}</td></tr>
<tr><td class="awrnc">ipc sends total</td>	<td class="awrnc">${xml.SystemMetrics.IpcSendsTotal}</td></tr>
<tr><td class="awrc">tcpip send wait time</td>	<td class="awrc">${xml.SystemMetrics.TcpipSendWaitTime}</td></tr>
<tr><td class="awrnc">tcpip sends total</td>	<td class="awrnc">${xml.SystemMetrics.TcpipSendsTotal}</td></tr>
<tr><td class="awrc">pool write time</td>	<td class="awrc">${xml.SystemMetrics.PoolWriteTime}</td></tr>
<tr><td class="awrnc">pool read time</td>	<td class="awrnc">${xml.SystemMetrics.PoolReadTime}</td></tr>
<tr><td class="awrc">audit file write wait time</td>	<td class="awrc">${xml.SystemMetrics.AuditFileWriteWaitTime}</td></tr>
<tr><td class="awrnc">audit file writes total</td>	<td class="awrnc">${xml.SystemMetrics.AuditFileWritesTotal}</td></tr>
<tr><td class="awrc">audit subsystem wait time</td>	<td class="awrc">${xml.SystemMetrics.AuditSubsystemWaitTime}</td></tr>
<tr><td class="awrnc">audit subsystem waits total</td>	<td class="awrnc">${xml.SystemMetrics.AuditSubsystemWaitsTotal}</td></tr>
<tr><td class="awrc">diaglog write wait time</td>	<td class="awrc">${xml.SystemMetrics.DiaglogWriteWaitTime}</td></tr>
<tr><td class="awrnc">diaglog writes total</td>	<td class="awrnc">${xml.SystemMetrics.DiaglogWritesTotal}</td></tr>
<tr><td class="awrc">fcm send wait time</td>	<td class="awrc">${xml.SystemMetrics.FcmSendWaitTime}</td></tr>
<tr><td class="awrnc">fcm recv wait time</td>	<td class="awrnc">${xml.SystemMetrics.FcmRecvWaitTime}</td></tr>
<tr><td class="awrc">total wait time</td>	<td class="awrc">${xml.SystemMetrics.TotalWaitTime}</td></tr>
<tr><td class="awrnc">total rqst time</td>	<td class="awrnc">${xml.SystemMetrics.TotalRqstTime}</td></tr>
<tr><td class="awrc">rqsts completed total</td>	<td class="awrc">${xml.SystemMetrics.RqstsCompletedTotal}</td></tr>
<tr><td class="awrnc">total app rqst time</td>	<td class="awrnc">${xml.SystemMetrics.TotalAppRqstTime}</td></tr>
<tr><td class="awrc">app rqsts completed total</td>	<td class="awrc">${xml.SystemMetrics.AppRqstsCompletedTotal}</td></tr>
<tr><td class="awrnc">total section sort proc time</td>	<td class="awrnc">${xml.SystemMetrics.TotalSectionSortProcTime}</td></tr>
<tr><td class="awrc">total section sort time</td>	<td class="awrc">${xml.SystemMetrics.TotalSectionSortTime}</td></tr>
<tr><td class="awrnc">total section sorts</td>	<td class="awrnc">${xml.SystemMetrics.TotalSectionSorts}</td></tr>
<tr><td class="awrc">rows read</td>	<td class="awrc">${xml.SystemMetrics.RowsRead}</td></tr>
<tr><td class="awrnc">rows modified</td>	<td class="awrnc">${xml.SystemMetrics.RowsModified}</td></tr>
<tr><td class="awrc">pool data l reads</td>	<td class="awrc">${xml.SystemMetrics.PoolDataLReads}</td></tr>
<tr><td class="awrnc">pool index l reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolIndexLReads}</td></tr>
<tr><td class="awrc">pool temp data l reads</td>	<td class="awrc">${xml.SystemMetrics.PoolTempDataLReads}</td></tr>
<tr><td class="awrnc">pool temp index l reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolTempIndexLReads}</td></tr>
<tr><td class="awrc">pool xda l reads</td>	<td class="awrc">${xml.SystemMetrics.PoolXdaLReads}</td></tr>
<tr><td class="awrnc">pool temp xda l reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolTempXdaLReads}</td></tr>
<tr><td class="awrc">total cpu time</td>	<td class="awrc">${xml.SystemMetrics.TotalCpuTime}</td></tr>
<tr><td class="awrnc">act completed total</td>	<td class="awrnc">${xml.SystemMetrics.ActCompletedTotal}</td></tr>
<tr><td class="awrc">pool data p reads</td>	<td class="awrc">${xml.SystemMetrics.PoolDataPReads}</td></tr>
<tr><td class="awrnc">pool temp data p reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolTempDataPReads}</td></tr>
<tr><td class="awrc">pool xda p reads</td>	<td class="awrc">${xml.SystemMetrics.PoolXdaPReads}</td></tr>
<tr><td class="awrnc">pool temp xda p reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolTempXdaPReads}</td></tr>
<tr><td class="awrc">pool index p reads</td>	<td class="awrc">${xml.SystemMetrics.PoolIndexPReads}</td></tr>
<tr><td class="awrnc">pool temp index p reads</td>	<td class="awrnc">${xml.SystemMetrics.PoolTempIndexPReads}</td></tr>
<tr><td class="awrc">pool data writes</td>	<td class="awrc">${xml.SystemMetrics.PoolDataWrites}</td></tr>
<tr><td class="awrnc">pool xda writes</td>	<td class="awrnc">${xml.SystemMetrics.PoolXdaWrites}</td></tr>
<tr><td class="awrc">pool index writes</td>	<td class="awrc">${xml.SystemMetrics.PoolIndexWrites}</td></tr>
<tr><td class="awrnc">direct reads</td>	<td class="awrnc">${xml.SystemMetrics.DirectReads}</td></tr>
<tr><td class="awrc">direct writes</td>	<td class="awrc">${xml.SystemMetrics.DirectWrites}</td></tr>
<tr><td class="awrnc">rows returned</td>	<td class="awrnc">${xml.SystemMetrics.RowsReturned}</td></tr>
<tr><td class="awrc">deadlocks</td>	<td class="awrc">${xml.SystemMetrics.Deadlocks}</td></tr>
<tr><td class="awrnc">lock timeouts</td>	<td class="awrnc">${xml.SystemMetrics.LockTimeouts}</td></tr>
<tr><td class="awrc">lock escals</td>	<td class="awrc">${xml.SystemMetrics.LockEscals}</td></tr>
<tr><td class="awrnc">fcm sends total</td>	<td class="awrnc">${xml.SystemMetrics.FcmSendsTotal}</td></tr>
<tr><td class="awrc">fcm recvs total</td>	<td class="awrc">${xml.SystemMetrics.FcmRecvsTotal}</td></tr>
<tr><td class="awrnc">fcm send volume</td>	<td class="awrnc">${xml.SystemMetrics.FcmSendVolume}</td></tr>
<tr><td class="awrc">fcm recv volume</td>	<td class="awrc">${xml.SystemMetrics.FcmRecvVolume}</td></tr>
<tr><td class="awrnc">fcm message sends total</td>	<td class="awrnc">${xml.SystemMetrics.FcmMessageSendsTotal}</td></tr>
<tr><td class="awrc">fcm message recvs total</td>	<td class="awrc">${xml.SystemMetrics.FcmMessageRecvsTotal}</td></tr>
<tr><td class="awrnc">fcm message send volume</td>	<td class="awrnc">${xml.SystemMetrics.FcmMessageSendVolume}</td></tr>
<tr><td class="awrc">fcm message recv volume</td>	<td class="awrc">${xml.SystemMetrics.FcmMessageRecvVolume}</td></tr>
<tr><td class="awrnc">fcm tq sends total</td>	<td class="awrnc">${xml.SystemMetrics.FcmTqSendsTotal}</td></tr>
<tr><td class="awrc">fcm tq recvs total</td>	<td class="awrc">${xml.SystemMetrics.FcmTqRecvsTotal}</td></tr>
<tr><td class="awrnc">fcm tq send volume</td>	<td class="awrnc">${xml.SystemMetrics.FcmTqSendVolume}</td></tr>
<tr><td class="awrc">fcm tq recv volume</td>	<td class="awrc">${xml.SystemMetrics.FcmTqRecvVolume}</td></tr>
<tr><td class="awrnc">tq tot send spills</td>	<td class="awrnc">${xml.SystemMetrics.TqTotSendSpills}</td></tr>
<tr><td class="awrc">tcpip send volume</td>	<td class="awrc">${xml.SystemMetrics.TcpipSendVolume}</td></tr>
<tr><td class="awrnc">tcpip recv volume</td>	<td class="awrnc">${xml.SystemMetrics.TcpipRecvVolume}</td></tr>
<tr><td class="awrc">ipc send volume</td>	<td class="awrc">${xml.SystemMetrics.IpcSendVolume}</td></tr>
<tr><td class="awrnc">ipc recv volume</td>	<td class="awrnc">${xml.SystemMetrics.IpcRecvVolume}</td></tr>
<tr><td class="awrc">post threshold sorts</td>	<td class="awrc">${xml.SystemMetrics.PostThresholdSorts}</td></tr>
<tr><td class="awrnc">post shrthreshold sorts</td>	<td class="awrnc">${xml.SystemMetrics.PostShrthresholdSorts}</td></tr>
<tr><td class="awrc">sort overflows</td>	<td class="awrc">${xml.SystemMetrics.SortOverflows}</td></tr>
<tr><td class="awrnc">audit events total</td>	<td class="awrnc">${xml.SystemMetrics.AuditEventsTotal}</td></tr>
<tr><td class="awrc">act rejected total</td>	<td class="awrc">${xml.SystemMetrics.ActRejectedTotal}</td></tr>
<tr><td class="awrnc">act aborted total</td>	<td class="awrnc">${xml.SystemMetrics.ActAbortedTotal}</td></tr>
<tr><td class="awrc">total sorts</td>	<td class="awrc">${xml.SystemMetrics.TotalSorts}</td></tr>
<tr><td class="awrnc">total routine time</td>	<td class="awrnc">${xml.SystemMetrics.TotalRoutineTime}</td></tr>
<tr><td class="awrc">total compile proc time</td>	<td class="awrc">${xml.SystemMetrics.TotalCompileProcTime}</td></tr>
<tr><td class="awrnc">total compile time</td>	<td class="awrnc">${xml.SystemMetrics.TotalCompileTime}</td></tr>
<tr><td class="awrc">total compilations</td>	<td class="awrc">${xml.SystemMetrics.TotalCompilations}</td></tr>
<tr><td class="awrnc">total implicit compile proc time</td>	<td class="awrnc">${xml.SystemMetrics.TotalImplicitCompileProcTime}</td></tr>
<tr><td class="awrc">total implicit compile time</td>	<td class="awrc">${xml.SystemMetrics.TotalImplicitCompileTime}</td></tr>
<tr><td class="awrnc">total implicit compilations</td>	<td class="awrnc">${xml.SystemMetrics.TotalImplicitCompilations}</td></tr>
<tr><td class="awrc">total runstats proc time</td>	<td class="awrc">${xml.SystemMetrics.TotalRunstatsProcTime}</td></tr>
<tr><td class="awrnc">total runstats time</td>	<td class="awrnc">${xml.SystemMetrics.TotalRunstatsTime}</td></tr>
<tr><td class="awrc">total runstats</td>	<td class="awrc">${xml.SystemMetrics.TotalRunstats}</td></tr>
<tr><td class="awrnc">total reorg proc time</td>	<td class="awrnc">${xml.SystemMetrics.TotalReorgProcTime}</td></tr>
<tr><td class="awrc">total reorg time</td>	<td class="awrc">${xml.SystemMetrics.TotalReorgTime}</td></tr>
<tr><td class="awrnc">total reorgs</td>	<td class="awrnc">${xml.SystemMetrics.TotalReorgs}</td></tr>
<tr><td class="awrc">total load proc time</td>	<td class="awrc">${xml.SystemMetrics.TotalLoadProcTime}</td></tr>
<tr><td class="awrnc">total load time</td>	<td class="awrnc">${xml.SystemMetrics.TotalLoadTime}</td></tr>
<tr><td class="awrc">total loads</td>	<td class="awrc">${xml.SystemMetrics.TotalLoads}</td></tr>
<tr><td class="awrnc">total section proc time</td>	<td class="awrnc">${xml.SystemMetrics.TotalSectionProcTime}</td></tr>
<tr><td class="awrc">total section time</td>	<td class="awrc">${xml.SystemMetrics.TotalSectionTime}</td></tr>
<tr><td class="awrnc">total app section executions</td>	<td class="awrnc">${xml.SystemMetrics.TotalAppSectionExecutions}</td></tr>
<tr><td class="awrc">total commit proc time</td>	<td class="awrc">${xml.SystemMetrics.TotalCommitProcTime}</td></tr>
<tr><td class="awrnc">total commit time</td>	<td class="awrnc">${xml.SystemMetrics.TotalCommitTime}</td></tr>
<tr><td class="awrc">total app commits</td>	<td class="awrc">${xml.SystemMetrics.TotalAppCommits}</td></tr>
<tr><td class="awrnc">total rollback proc time</td>	<td class="awrnc">${xml.SystemMetrics.TotalRollbackProcTime}</td></tr>
<tr><td class="awrc">total rollback time</td>	<td class="awrc">${xml.SystemMetrics.TotalRollbackTime}</td></tr>
<tr><td class="awrnc">total app rollbacks</td>	<td class="awrnc">${xml.SystemMetrics.TotalAppRollbacks}</td></tr>
<tr><td class="awrc">total routine user code proc time</td>	<td class="awrc">${xml.SystemMetrics.TotalRoutineUserCodeProcTime}</td></tr>
<tr><td class="awrnc">total routine user code time</td>	<td class="awrnc">${xml.SystemMetrics.TotalRoutineUserCodeTime}</td></tr>
<tr><td class="awrc">thresh violations</td>	<td class="awrc">${xml.SystemMetrics.ThreshViolations}</td></tr>
<tr><td class="awrnc">num lw thresh exceeded</td>	<td class="awrnc">${xml.SystemMetrics.NumLwThreshExceeded}</td></tr>
<tr><td class="awrc">total routine invocations</td>	<td class="awrc">${xml.SystemMetrics.TotalRoutineInvocations}</td></tr>
<tr><td class="awrnc">int commits</td>	<td class="awrnc">${xml.SystemMetrics.IntCommits}</td></tr>
<tr><td class="awrc">int rollbacks</td>	<td class="awrc">${xml.SystemMetrics.IntRollbacks}</td></tr>
<tr><td class="awrnc">cat cache inserts</td>	<td class="awrnc">${xml.SystemMetrics.CatCacheInserts}</td></tr>
<tr><td class="awrc">cat cache lookups</td>	<td class="awrc">${xml.SystemMetrics.CatCacheLookups}</td></tr>
<tr><td class="awrnc">pkg cache inserts</td>	<td class="awrnc">${xml.SystemMetrics.PkgCacheInserts}</td></tr>
<tr><td class="awrc">pkg cache lookups</td>	<td class="awrc">${xml.SystemMetrics.PkgCacheLookups}</td></tr>
<tr><td class="awrnc">act rqsts total</td>	<td class="awrnc">${xml.SystemMetrics.ActRqstsTotal}</td></tr>
<tr><td class="awrc">total act wait time</td>	<td class="awrc">${xml.SystemMetrics.TotalActWaitTime}</td></tr>
<tr><td class="awrnc">total act time</td>	<td class="awrnc">${xml.SystemMetrics.TotalActTime}</td></tr>
<tr><td class="awrc">Audit Events Total</td>   <td class="awrc">${xml.SystemMetrics.AuditEventsTotal}</td></tr>
<tr><td class="awrnc">Audit File Writes Total</td>      <td class="awrnc">${xml.SystemMetrics.AuditFileWritesTotal}</td></tr>
<tr><td class="awrc">Audit File Write Wait Time</td>   <td class="awrc">${xml.SystemMetrics.AuditFileWriteWaitTime}</td></tr>
<tr><td class="awrnc">Audit Subsystem Waits Total</td>  <td class="awrnc">${xml.SystemMetrics.AuditSubsystemWaitsTotal}</td></tr>
<tr><td class="awrc">Audit Subsystem Wait Time</td>    <td class="awrc">${xml.SystemMetrics.AuditSubsystemWaitTime}</td></tr>
<tr><td class="awrnc">Diaglog Writes Total</td> <td class="awrnc">${xml.SystemMetrics.DiaglogWritesTotal}</td></tr>
<tr><td class="awrc">Diaglog Write Wait Time</td>      <td class="awrc">${xml.SystemMetrics.DiaglogWriteWaitTime}</td></tr>
<tr><td class="awrnc">Fcm Message Recvs Total</td>      <td class="awrnc">${xml.SystemMetrics.FcmMessageRecvsTotal}</td></tr>
<tr><td class="awrc">Fcm Message Recv Volume</td>      <td class="awrc">${xml.SystemMetrics.FcmMessageRecvVolume}</td></tr>
<tr><td class="awrnc">Fcm Message Recv Wait Time</td>   <td class="awrnc">${xml.SystemMetrics.FcmMessageRecvWaitTime}</td></tr>
<tr><td class="awrc">Fcm Message Sends Total</td>      <td class="awrc">${xml.SystemMetrics.FcmMessageSendsTotal}</td></tr>
<tr><td class="awrnc">Fcm Message Send Volume</td>      <td class="awrnc">${xml.SystemMetrics.FcmMessageSendVolume}</td></tr>
<tr><td class="awrc">Fcm Message Send Wait Time</td>   <td class="awrc">${xml.SystemMetrics.FcmMessageSendWaitTime}</td></tr>
<tr><td class="awrnc">Fcm Tq Recvs Total</td>   <td class="awrnc">${xml.SystemMetrics.FcmTqRecvsTotal}</td></tr>
<tr><td class="awrc">Fcm Tq Recv Volume</td>   <td class="awrc">${xml.SystemMetrics.FcmTqRecvVolume}</td></tr>
<tr><td class="awrnc">Fcm Tq Recv Wait Time</td>        <td class="awrnc">${xml.SystemMetrics.FcmTqRecvWaitTime}</td></tr>
<tr><td class="awrc">Fcm Tq Sends Total</td>   <td class="awrc">${xml.SystemMetrics.FcmTqSendsTotal}</td></tr>
<tr><td class="awrnc">Fcm Tq Send Volume</td>   <td class="awrnc">${xml.SystemMetrics.FcmTqSendVolume}</td></tr>
<tr><td class="awrc">Fcm Tq Send Wait Time</td>        <td class="awrc">${xml.SystemMetrics.FcmTqSendWaitTime}</td></tr>
<tr><td class="awrnc">Total Routine User Code Proc Time</td>    <td class="awrnc">${xml.SystemMetrics.TotalRoutineUserCodeProcTime}</td></tr>
<tr><td class="awrc">Total Routine User Code Time</td> <td class="awrc">${xml.SystemMetrics.TotalRoutineUserCodeTime}</td></tr>
<tr><td class="awrnc">Tq Tot Send Spills</td>   <td class="awrnc">${xml.SystemMetrics.TqTotSendSpills}</td></tr>
<tr><td class="awrc">Evmon Wait Time</td>      <td class="awrc">${xml.SystemMetrics.EvmonWaitTime}</td></tr>
<tr><td class="awrnc">Evmon Waits Total</td>    <td class="awrnc">${xml.SystemMetrics.EvmonWaitsTotal}</td></tr>
<tr><td class="awrc">Total Connect Request Time</td>   <td class="awrc">${xml.SystemMetrics.TotalConnectRequestTime}</td></tr>
<tr><td class="awrnc">Total Connect Request Proc Time</td>      <td class="awrnc">${xml.SystemMetrics.TotalConnectRequestProcTime}</td></tr>
<tr><td class="awrc">Total Connect Requests</td>       <td class="awrc">${xml.SystemMetrics.TotalConnectRequests}</td></tr>
<tr><td class="awrnc">Total Connect Authentication Time</td>    <td class="awrnc">${xml.SystemMetrics.TotalConnectAuthenticationTime}</td></tr>
<tr><td class="awrc">Total Connect Authentication Proc Time</td>       <td class="awrc">${xml.SystemMetrics.TotalConnectAuthenticationProcTime}</td></tr>
<tr><td class="awrnc">Total Connect Authentications</td>        <td class="awrnc">${xml.SystemMetrics.TotalConnectAuthentications}</td></tr>
<tr><td class="awrc">Total Extended Latch Wait Time</td>       <td class="awrc">${xml.SystemMetrics.TotalExtendedLatchWaitTime}</td></tr>
<tr><td class="awrnc">Total Extended Latch Waits</td>   <td class="awrnc">${xml.SystemMetrics.TotalExtendedLatchWaits}</td></tr>
<tr><td class="awrc">Total Stats Fabrication Time</td> <td class="awrc">${xml.SystemMetrics.TotalStatsFabricationTime}</td></tr>
<tr><td class="awrnc">Total Stats Fabrication Proc Time</td>    <td class="awrnc">${xml.SystemMetrics.TotalStatsFabricationProcTime}</td></tr>
<tr><td class="awrc">Total Stats Fabrications</td>     <td class="awrc">${xml.SystemMetrics.TotalStatsFabrications}</td></tr>
<tr><td class="awrnc">Total Sync Runstats Time</td>     <td class="awrnc">${xml.SystemMetrics.TotalSyncRunstatsTime}</td></tr>
<tr><td class="awrc">Total Sync Runstats Proc Time</td>        <td class="awrc">${xml.SystemMetrics.TotalSyncRunstatsProcTime}</td></tr>
<tr><td class="awrnc">Total Sync Runstats</td>  <td class="awrnc">${xml.SystemMetrics.TotalSyncRunstats}</td></tr>
<tr><td class="awrc">Total Disp Run Queue Time</td>    <td class="awrc">${xml.SystemMetrics.TotalDispRunQueueTime}</td></tr>
<tr><td class="awrnc">Disabled Peds</td>        <td class="awrnc">${xml.SystemMetrics.DisabledPeds}</td></tr>
<tr><td class="awrc">Post Threshold Peas</td>  <td class="awrc">${xml.SystemMetrics.PostThresholdPeas}</td></tr>
<tr><td class="awrnc">Post Threshold Peds</td>  <td class="awrnc">${xml.SystemMetrics.PostThresholdPeds}</td></tr>
<tr><td class="awrc">Total Peas</td>   <td class="awrc">${xml.SystemMetrics.TotalPeas}</td></tr>
<tr><td class="awrnc">Total Peds</td>   <td class="awrnc">${xml.SystemMetrics.TotalPeds}</td></tr>
<tr><td class="awrc">Tq Sort Heap Rejections</td>      <td class="awrc">${xml.SystemMetrics.TqSortHeapRejections}</td></tr>
<tr><td class="awrnc">Tq Sort Heap Requests</td>        <td class="awrnc">${xml.SystemMetrics.TqSortHeapRequests}</td></tr>
<tr><td class="awrc">App Act Aborted Total</td>        <td class="awrc">${xml.SystemMetrics.AppActAbortedTotal}</td></tr>
<tr><td class="awrnc">App Act Completed Total</td>      <td class="awrnc">${xml.SystemMetrics.AppActCompletedTotal}</td></tr>
<tr><td class="awrc">App Act Rejected Total</td>       <td class="awrc">${xml.SystemMetrics.AppActRejectedTotal}</td></tr>
<tr><td class="awrnc">Pool Queued Async Data Reqs</td>  <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncDataReqs}</td></tr>
<tr><td class="awrc">Pool Queued Async Index Reqs</td> <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncIndexReqs}</td></tr>
<tr><td class="awrnc">Pool Queued Async Xda Reqs</td>   <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncXdaReqs}</td></tr>
<tr><td class="awrc">Pool Queued Async Temp Data Reqs</td>     <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncTempDataReqs}</td></tr>
<tr><td class="awrnc">Pool Queued Async Temp Index Reqs</td>    <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncTempIndexReqs}</td></tr>
<tr><td class="awrc">Pool Queued Async Temp Xda Reqs</td>      <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncTempXdaReqs}</td></tr>
<tr><td class="awrnc">Pool Queued Async Other Reqs</td> <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncOtherReqs}</td></tr>
<tr><td class="awrc">Pool Queued Async Data Pages</td> <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncDataPages}</td></tr>
<tr><td class="awrnc">Pool Queued Async Index Pages</td>        <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncIndexPages}</td></tr>
<tr><td class="awrc">Pool Queued Async Xda Pages</td>  <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncXdaPages}</td></tr>
<tr><td class="awrnc">Pool Queued Async Temp Data Pages</td>    <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncTempDataPages}</td></tr>
<tr><td class="awrc">Pool Queued Async Temp Index Pages</td>   <td class="awrc">${xml.SystemMetrics.PoolQueuedAsyncTempIndexPages}</td></tr>
<tr><td class="awrnc">Pool Queued Async Temp Xda Pages</td>     <td class="awrnc">${xml.SystemMetrics.PoolQueuedAsyncTempXdaPages}</td></tr>
<tr><td class="awrc">Pool Failed Async Data Reqs</td>  <td class="awrc">${xml.SystemMetrics.PoolFailedAsyncDataReqs}</td></tr>
<tr><td class="awrnc">Pool Failed Async Index Reqs</td> <td class="awrnc">${xml.SystemMetrics.PoolFailedAsyncIndexReqs}</td></tr>
<tr><td class="awrc">Pool Failed Async Xda Reqs</td>   <td class="awrc">${xml.SystemMetrics.PoolFailedAsyncXdaReqs}</td></tr>
<tr><td class="awrnc">Pool Failed Async Temp Data Reqs</td>     <td class="awrnc">${xml.SystemMetrics.PoolFailedAsyncTempDataReqs}</td></tr>
<tr><td class="awrc">Pool Failed Async Temp Index Reqs</td>    <td class="awrc">${xml.SystemMetrics.PoolFailedAsyncTempIndexReqs}</td></tr>
<tr><td class="awrnc">Pool Failed Async Temp Xda Reqs</td>      <td class="awrnc">${xml.SystemMetrics.PoolFailedAsyncTempXdaReqs}</td></tr>
<tr><td class="awrc">Pool Failed Async Other Reqs</td> <td class="awrc">${xml.SystemMetrics.PoolFailedAsyncOtherReqs}</td></tr>
<tr><td class="awrnc">Prefetch Wait Time</td>   <td class="awrnc">${xml.SystemMetrics.PrefetchWaitTime}</td></tr>
<tr><td class="awrc">Prefetch Waits</td>       <td class="awrc">${xml.SystemMetrics.PrefetchWaits}</td></tr>
<tr><td class="awrnc">Pool Data Gbp Indep Pages Found In Lbp</td>       <td class="awrnc">${xml.SystemMetrics.PoolDataGbpIndepPagesFoundInLbp}</td></tr>
<tr><td class="awrc">Pool Index Gbp Indep Pages Found In Lbp</td>      <td class="awrc">${xml.SystemMetrics.PoolIndexGbpIndepPagesFoundInLbp}</td></tr>
<tr><td class="awrnc">Pool Xda Gbp Indep Pages Found In Lbp</td>        <td class="awrnc">${xml.SystemMetrics.PoolXdaGbpIndepPagesFoundInLbp}</td></tr>
<tr><td class="awrc">Comm Exit Wait Time</td>  <td class="awrc">${xml.SystemMetrics.CommExitWaitTime}</td></tr>
<tr><td class="awrnc">Comm Exit Waits</td>      <td class="awrnc">${xml.SystemMetrics.CommExitWaits}</td></tr>
</table></body></html>
   
