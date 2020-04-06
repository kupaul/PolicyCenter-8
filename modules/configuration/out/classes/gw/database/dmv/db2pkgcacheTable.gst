<% uses java.util.TimeZone %>
<% uses java.util.Collection %>
<% uses javax.xml.bind.annotation.XmlAccessOrder %>
<% uses gw.xml.XmlSimpleValue %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xsd.database.db2newpkgcache.* %>
<% uses com.guidewire.pl.perfdownload.platform.analyzer.internal.QueryHandle%>
<% uses gw.util.fingerprint.FP64 %>

<%@ params( queriesToPrint : Collection<DB2MonClasses.DB2PDQuery>, tableAccess : Collection<QueryHandle>, linkGen : block(q: DB2MonClasses.DB2PDQuery, i : Number ) : String, monTotals : DB2MonClasses.DB2MonTotals ) %>
<% linkGen =  linkGen ?: \ q, iq -> "<a href=\"../queries/query" + q.QueryHash + ".html\">" + q.QueryHash + "</a>" %>

<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">

<tr class="hideableheaderrow">
  <th colspan="1"></th>
  <th colspan="1"></th>
  <th colspan="1"></th>
  <th colspan="1"></th>
  <% if (tableAccess != null) { %> 
     <th colspan="1"></th>
  <% }
   var cs = 2;
   var groupTitles = "<th>Total</th><th>Per Exec</th>"
   if  (monTotals != null) {
     cs = 3;
     groupTitles = "<th>% of Total</th>"+groupTitles
     }%>
  <th colspan="${cs}">Act Time(ms)</th>
  <th colspan="${cs}">Act Wait Time</th>
  <th colspan="${cs}">L Reads (Ix + Data)</th>
  <th colspan="${cs}">P Reads (Ix + Data)</th>
  <th colspan="${cs}">Read Time</th>
  <th colspan="6">Selected Wait Times</th>
  <th colspan="5">Sorts</th>
  <th colspan="152" align="left" class="initiallyHidden">Other Stuff</th>
</tr>
<tr class="sortheaderrow">
    ${tableAccess != null ? "<th>Table Access</th> " : "" }
    <th>Query</th>
    <th>Num Prepares</th>
    <th>Reasons for Flagging</th>
    <th>Num Exec With Metrics</th>
    ${groupTitles}
    ${groupTitles}
    ${groupTitles}
    ${groupTitles}
    ${groupTitles}
   <th>Pool Read Time</th>
   <th>Pool Write Time</th>
   <th>Direct Read Time</th>
   <th>Direct Write Time</th>
   <th>Lock Wait Time</th>
   <th>Log Disk Wait Time</th>
   
   <th>Total Sorts</th>
   <th>Sort Overflows</th>
   <th>Post Threshold Sorts</th>
   <th>Post Shrthreshold Sorts</th>
   <th>Total Section Sort Time</th>
   
   <th>Rows Returned</th>
   <th>Prep Time</th>
   <th>Total Cpu Time</th>
   

   <th>Total Section Sort Proc Time</th>
   <th>Total Section Sorts</th>
   
   <th>Lock Escals</th>
   <th>Lock Waits</th>
   <th>Rows Modified</th>
   <th>Rows Read</th>
   <th>Rows Returned</th>
   <th>Direct Reads</th>
   <th>Direct Read Reqs</th>
   <th>Direct Writes</th>
   <th>Direct Write Reqs</th>
   <th>Pool Data L Reads</th>
   <th>Pool Temp Data L Reads</th>
   <th>Pool Xda L Reads</th>
   <th>Pool Temp Xda L Reads</th>
   <th>Pool Index L Reads</th>
   <th>Pool Temp Index L Reads</th>
   <th>Pool Data P Reads</th>
   <th>Pool Temp Data P Reads</th>
   <th>Pool Xda P Reads</th>
   <th>Pool Temp Xda P Reads</th>
   <th>Pool Index P Reads</th>
   <th>Pool Temp Index P Reads</th>
   <th>Pool Data Writes</th>
   <th>Pool Xda Writes</th>
   <th>Pool Index Writes</th>



   <th>Wlm Queue Time Total</th>
   <th>Wlm Queue Assignments Total</th>
   <th>Deadlocks</th>
   <th>Fcm Recv Volume</th>
   <th>Fcm Recvs Total</th>
   <th>Fcm Send Volume</th>
   <th>Fcm Sends Total</th>
   <th>Fcm Recv Wait Time</th>
   <th>Fcm Send Wait Time</th>
   <th>Lock Timeouts</th>
   <th>Log Buffer Wait Time</th>
   <th>Num Log Buffer Full</th>

   <th>Log Disk Waits Total</th>
   <th>Last Metrics Update</th>
   <th>Num Coord Exec</th>
   <th>Num Coord Exec With Metrics</th>
   <th>Total Routine Time</th>
   <th>Total Routine Invocations</th>
   <th>Routine Id</th>
   <th>Stmt Type Id</th>
   <th>Query Cost Estimate</th>
   <th>Stmt Pkg Cache Id</th>
   <th>Coord Stmt Exec Time</th>
   <th>Stmt Exec Time</th>
   <th>Total Section Time</th>
   <th>Total Section Proc Time</th>
   <th>Total Routine Non Sect Time</th>
   <th>Total Routine Non Sect Proc Time</th>
   <th>Lock Waits Global</th>
   <th>Lock Wait Time Global</th>
   <th>Lock Timeouts Global</th>
   <th>Lock Escals Maxlocks</th>
   <th>Lock Escals Locklist</th>
   <th>Lock Escals Global</th>
   <th>Reclaim Wait Time</th>
   <th>Spacemappage Reclaim Wait Time</th>
   <th>Cf Waits</th>
   <th>Cf Wait Time</th>
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
   <th>Audit Events Total</th>
   <th>Audit File Writes Total</th>
   <th>Audit File Write Wait Time</th>
   <th>Audit Subsystem Waits Total</th>
   <th>Audit Subsystem Wait Time</th>
   <th>Diaglog Writes Total</th>
   <th>Diaglog Write Wait Time</th>
   <th>Fcm Message Recvs Total</th>
   <th>Fcm Message Recv Volume</th>
   <th>Fcm Message Recv Wait Time</th>
   <th>Fcm Message Sends Total</th>
   <th>Fcm Message Send Volume</th>
   <th>Fcm Message Send Wait Time</th>
   <th>Fcm Tq Recvs Total</th>
   <th>Fcm Tq Recv Volume</th>
   <th>Fcm Tq Recv Wait Time</th>
   <th>Fcm Tq Sends Total</th>
   <th>Fcm Tq Send Volume</th>
   <th>Fcm Tq Send Wait Time</th>
   <th>Num Lw Thresh Exceeded</th>
   <th>Thresh Violations</th>
   <th>Total App Section Executions</th>
   <th>Total Routine User Code Proc Time</th>
   <th>Total Routine User Code Time</th>
   <th>Tq Tot Send Spills</th>
   <th>Evmon Wait Time</th>
   <th>Evmon Waits Total</th>
   <th>Total Extended Latch Wait Time</th>
   <th>Total Extended Latch Waits</th>
   <th>Max Coord Stmt Exec Time</th>
   <th>Max Coord Stmt Exec Timestamp</th>
   <th>Total Disp Run Queue Time</th>
   <th>Query Data Tag List</th>
   <th>Total Stats Fabrication Time</th>
   <th>Total Stats Fabrications</th>
   <th>Total Sync Runstats Time</th>
   <th>Total Sync Runstats</th>
   <th>Total Peds</th>
   <th>Disabled Peds</th>
   <th>Post Threshold Peds</th>
   <th>Total Peas</th>
   <th>Post Threshold Peas</th>
   <th>Tq Sort Heap Requests</th>
   <th>Tq Sort Heap Rejections</th>
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
   <th>Prefetch Wait Time</th>
   <th>Prefetch Waits</th>
   <th>Pool Data Gbp Indep Pages Found In Lbp</th>
   <th>Pool Index Gbp Indep Pages Found In Lbp</th>
   <th>Pool Xda Gbp Indep Pages Found In Lbp</th>
      <th>Section Type</th>
   <th>Insert Timestamp</th>
   <th>Effective Isolation</th>

   <th>Stmt Text</th>
</tr>

<%  var clss = "awrnc"
    var totals : DB2MonClasses.DB2PDQuery = null
    var i = 0

   var it = queriesToPrint.iterator()
   var pdQuery = it.hasNext() ? it.next() : null

  while (pdQuery != null || totals != null) {
    i = i + 1
    if (totals != null) {
      if (pdQuery == null) {
        pdQuery = totals
        totals = null;
        linkGen = \q, iq -> "<b>TOTALS</b>"
      } else {
         totals.aggregateValues(pdQuery)
      }
   } else if (queriesToPrint.Count > 1)  {
     totals = pdQuery.duplicateMe()
   }

  var xml = pdQuery.ParsedXML
  clss  =  clss == "awrnc" ? "awrc" : "awrnc" %>

<tr  class="${clss} ${null == totals ? " sortbottom\"" : "\""}>
   ${tableAccess == null ? "" : "<td class=\"${clss}\">" + (tableAccess.contains(pdQuery.QueryHandle) ? "True" : "") + "</td>"}
  <td>${linkGen(pdQuery, i)}</td>
  <td>${pdQuery.NumPrepares}</td>
  <td>${pdQuery.QueryPlan.FlaggedGroups == null ? "" : pdQuery.QueryPlan.FlaggedGroups.map(\p->"<a href=\"../groups/"+p+".html\">"+p+"</a>").join("<br>")}&nbsp;</td>
  <td>${xml.NUM_EXEC_WITH_METRICS()}</td>

  <% if (monTotals != null) { %>
    <td>${monTotals.ActTime > 0 ? (xml.TOTAL_ACT_TIME() * 100 / monTotals.ActTime) : -1}</td>
  <% } %>
  <td>${xml.TOTAL_ACT_TIME()}</td>
  <td>${xml.NUM_EXEC_WITH_METRICS() > 0 ? (xml.TOTAL_ACT_TIME() / xml.NUM_EXEC_WITH_METRICS()) : 0}</td>
  
  <% if (monTotals != null) { %>
    <td>${monTotals.ActWaitTime >0 ? (xml.TOTAL_ACT_WAIT_TIME() * 100 / monTotals.ActWaitTime) : -1}</td>
  <% } %>
  <td>${xml.TOTAL_ACT_WAIT_TIME()}</td>
  <td>${xml.NUM_EXEC_WITH_METRICS() > 0 ? (xml.TOTAL_ACT_WAIT_TIME() / xml.NUM_EXEC_WITH_METRICS()) : 0}</td>
  
  <% if (monTotals != null) { %>
   <td>${monTotals.LReads >0 ? ((xml.POOL_DATA_L_READS() + xml.POOL_INDEX_L_READS()) * 100 / monTotals.LReads) : -1}</td>
  <% } %>
  <td>${(xml.POOL_DATA_L_READS() + xml.POOL_INDEX_L_READS())  }</td>
  <td>${xml.NUM_EXEC_WITH_METRICS() > 0 ? ((xml.POOL_DATA_L_READS() + xml.POOL_INDEX_L_READS()) / xml.NUM_EXEC_WITH_METRICS()) : 0  }</td>
  
  <% if (monTotals != null) { %>
    <td>${monTotals.PReads > 0 ? ((xml.POOL_DATA_P_READS() + xml.POOL_INDEX_P_READS()) * 100 / monTotals.PReads) : -1}</td>
  <% } %>  
  <td>${(xml.POOL_DATA_P_READS() + xml.POOL_INDEX_P_READS())}</td>
  <td>${xml.NUM_EXEC_WITH_METRICS() > 0 ? ((xml.POOL_DATA_P_READS() + xml.POOL_INDEX_P_READS()) / xml.NUM_EXEC_WITH_METRICS()) : 0  }</td>
  
  <% if (monTotals != null) { %>
    <td>${monTotals.ReadTime > 0 ? (xml.POOL_READ_TIME() * 100 / monTotals.ReadTime) : -1}</td>
  <% } %>
  <td>${xml.POOL_READ_TIME()}</td>
  <td>${xml.NUM_EXEC_WITH_METRICS() > 0 ? (xml.POOL_READ_TIME() / xml.NUM_EXEC_WITH_METRICS()) : 0}</td>
  
<td>${xml.POOL_READ_TIME()}</td>
<td>${xml.POOL_WRITE_TIME()}</td>
<td>${xml.DIRECT_READ_TIME()}</td>
<td>${xml.DIRECT_WRITE_TIME()}</td>
<td>${xml.LOCK_WAIT_TIME()}</td>
<td>${xml.LOG_DISK_WAIT_TIME()}</td>

<td>${xml.TOTAL_SORTS()}</td>
<td>${xml.SORT_OVERFLOWS()}</td>
<td>${xml.POST_THRESHOLD_SORTS()}</td>
<td>${xml.POST_SHRTHRESHOLD_SORTS()}</td>
<td>${xml.TOTAL_SECTION_SORT_TIME()}</td>

  <td>${xml.ROWS_RETURNED()}</td>
<td>${xml.PREP_TIME()}</td>

<td>${xml.TOTAL_CPU_TIME()}</td>
<td>${xml.TOTAL_SECTION_SORT_PROC_TIME()}</td>
<td>${xml.TOTAL_SECTION_SORTS()}</td>
<td>${xml.LOCK_ESCALS()}</td>
<td>${xml.LOCK_WAITS()}</td>
<td>${xml.ROWS_MODIFIED()}</td>
<td>${xml.ROWS_READ()}</td>
<td>${xml.ROWS_RETURNED()}</td>
<td>${xml.DIRECT_READS()}</td>
<td>${xml.DIRECT_READ_REQS()}</td>
<td>${xml.DIRECT_WRITES()}</td>
<td>${xml.DIRECT_WRITE_REQS()}</td>
<td>${xml.POOL_DATA_L_READS()}</td>
<td>${xml.POOL_TEMP_DATA_L_READS()}</td>
<td>${xml.POOL_XDA_L_READS()}</td>
<td>${xml.POOL_TEMP_XDA_L_READS()}</td>
<td>${xml.POOL_INDEX_L_READS()}</td>
<td>${xml.POOL_TEMP_INDEX_L_READS()}</td>
<td>${xml.POOL_DATA_P_READS()}</td>
<td>${xml.POOL_TEMP_DATA_P_READS()}</td>
<td>${xml.POOL_XDA_P_READS()}</td>
<td>${xml.POOL_TEMP_XDA_P_READS()}</td>
<td>${xml.POOL_INDEX_P_READS()}</td>
<td>${xml.POOL_TEMP_INDEX_P_READS()}</td>
<td>${xml.POOL_DATA_WRITES()}</td>
<td>${xml.POOL_XDA_WRITES()}</td>
<td>${xml.POOL_INDEX_WRITES()}</td>



<td>${xml.WLM_QUEUE_TIME_TOTAL()}</td>
<td>${xml.WLM_QUEUE_ASSIGNMENTS_TOTAL()}</td>
<td>${xml.DEADLOCKS()}</td>
<td>${xml.FCM_RECV_VOLUME()}</td>
<td>${xml.FCM_RECVS_TOTAL()}</td>
<td>${xml.FCM_SEND_VOLUME()}</td>
<td>${xml.FCM_SENDS_TOTAL()}</td>
<td>${xml.FCM_RECV_WAIT_TIME()}</td>
<td>${xml.FCM_SEND_WAIT_TIME()}</td>
<td>${xml.LOCK_TIMEOUTS()}</td>
<td>${xml.LOG_BUFFER_WAIT_TIME()}</td>
<td>${xml.NUM_LOG_BUFFER_FULL()}</td>

<td>${xml.LOG_DISK_WAITS_TOTAL()}</td>
<td>${xml.LAST_METRICS_UPDATE()}</td>
<td>${xml.NUM_COORD_EXEC()}</td>
<td>${xml.NUM_COORD_EXEC_WITH_METRICS()}</td>
<td>${xml.TOTAL_ROUTINE_TIME()}</td>
<td>${xml.TOTAL_ROUTINE_INVOCATIONS()}</td>
<td>${xml.ROUTINE_ID()}</td>
<td>${xml.STMT_TYPE_ID()}</td>
<td>${xml.QUERY_COST_ESTIMATE()}</td>
<td>${xml.STMT_PKG_CACHE_ID()}</td>
<td>${xml.COORD_STMT_EXEC_TIME()}</td>
<td>${xml.STMT_EXEC_TIME()}</td>
<td>${xml.TOTAL_SECTION_TIME()}</td>
<td>${xml.TOTAL_SECTION_PROC_TIME()}</td>
<td>${xml.TOTAL_ROUTINE_NON_SECT_TIME()}</td>
<td>${xml.TOTAL_ROUTINE_NON_SECT_PROC_TIME()}</td>
<td>${xml.LOCK_WAITS_GLOBAL()}</td>
<td>${xml.LOCK_WAIT_TIME_GLOBAL()}</td>
<td>${xml.LOCK_TIMEOUTS_GLOBAL()}</td>
<td>${xml.LOCK_ESCALS_MAXLOCKS()}</td>
<td>${xml.LOCK_ESCALS_LOCKLIST()}</td>
<td>${xml.LOCK_ESCALS_GLOBAL()}</td>
<td>${xml.RECLAIM_WAIT_TIME()}</td>
<td>${xml.SPACEMAPPAGE_RECLAIM_WAIT_TIME()}</td>
<td>${xml.CF_WAITS()}</td>
<td>${xml.CF_WAIT_TIME()}</td>
<td>${xml.POOL_DATA_GBP_L_READS()}</td>
<td>${xml.POOL_DATA_GBP_P_READS()}</td>
<td>${xml.POOL_DATA_LBP_PAGES_FOUND()}</td>
<td>${xml.POOL_DATA_GBP_INVALID_PAGES()}</td>
<td>${xml.POOL_INDEX_GBP_L_READS()}</td>
<td>${xml.POOL_INDEX_GBP_P_READS()}</td>
<td>${xml.POOL_INDEX_LBP_PAGES_FOUND()}</td>
<td>${xml.POOL_INDEX_GBP_INVALID_PAGES()}</td>
<td>${xml.POOL_XDA_GBP_L_READS()}</td>
<td>${xml.POOL_XDA_GBP_P_READS()}</td>
<td>${xml.POOL_XDA_LBP_PAGES_FOUND()}</td>
<td>${xml.POOL_XDA_GBP_INVALID_PAGES()}</td>
<td>${xml.AUDIT_EVENTS_TOTAL()}</td>
<td>${xml.AUDIT_FILE_WRITES_TOTAL()}</td>
<td>${xml.AUDIT_FILE_WRITE_WAIT_TIME()}</td>
<td>${xml.AUDIT_SUBSYSTEM_WAITS_TOTAL()}</td>
<td>${xml.AUDIT_SUBSYSTEM_WAIT_TIME()}</td>
<td>${xml.DIAGLOG_WRITES_TOTAL()}</td>
<td>${xml.DIAGLOG_WRITE_WAIT_TIME()}</td>
<td>${xml.FCM_MESSAGE_RECVS_TOTAL()}</td>
<td>${xml.FCM_MESSAGE_RECV_VOLUME()}</td>
<td>${xml.FCM_MESSAGE_RECV_WAIT_TIME()}</td>
<td>${xml.FCM_MESSAGE_SENDS_TOTAL()}</td>
<td>${xml.FCM_MESSAGE_SEND_VOLUME()}</td>
<td>${xml.FCM_MESSAGE_SEND_WAIT_TIME()}</td>
<td>${xml.FCM_TQ_RECVS_TOTAL()}</td>
<td>${xml.FCM_TQ_RECV_VOLUME()}</td>
<td>${xml.FCM_TQ_RECV_WAIT_TIME()}</td>
<td>${xml.FCM_TQ_SENDS_TOTAL()}</td>
<td>${xml.FCM_TQ_SEND_VOLUME()}</td>
<td>${xml.FCM_TQ_SEND_WAIT_TIME()}</td>
<td>${xml.NUM_LW_THRESH_EXCEEDED()}</td>
<td>${xml.THRESH_VIOLATIONS()}</td>
<td>${xml.TOTAL_APP_SECTION_EXECUTIONS()}</td>
<td>${xml.TOTAL_ROUTINE_USER_CODE_PROC_TIME()}</td>
<td>${xml.TOTAL_ROUTINE_USER_CODE_TIME()}</td>
<td>${xml.TQ_TOT_SEND_SPILLS()}</td>
<td>${xml.EVMON_WAIT_TIME()}</td>
<td>${xml.EVMON_WAITS_TOTAL()}</td>
<td>${xml.TOTAL_EXTENDED_LATCH_WAIT_TIME()}</td>
<td>${xml.TOTAL_EXTENDED_LATCH_WAITS()}</td>
<td>${xml.MAX_COORD_STMT_EXEC_TIME()}</td>
<td>${xml.MAX_COORD_STMT_EXEC_TIMESTAMP()}</td>
<td>${xml.TOTAL_DISP_RUN_QUEUE_TIME()}</td>
<td>${xml.QUERY_DATA_TAG_LIST()}</td>
<td>${xml.TOTAL_STATS_FABRICATION_TIME()}</td>
<td>${xml.TOTAL_STATS_FABRICATIONS()}</td>
<td>${xml.TOTAL_SYNC_RUNSTATS_TIME()}</td>
<td>${xml.TOTAL_SYNC_RUNSTATS()}</td>
<td>${xml.TOTAL_PEDS()}</td>
<td>${xml.DISABLED_PEDS()}</td>
<td>${xml.POST_THRESHOLD_PEDS()}</td>
<td>${xml.TOTAL_PEAS()}</td>
<td>${xml.POST_THRESHOLD_PEAS()}</td>
<td>${xml.TQ_SORT_HEAP_REQUESTS()}</td>
<td>${xml.TQ_SORT_HEAP_REJECTIONS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_DATA_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_INDEX_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_XDA_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_DATA_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_INDEX_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_XDA_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_OTHER_REQS()}</td>
<td>${xml.POOL_QUEUED_ASYNC_DATA_PAGES()}</td>
<td>${xml.POOL_QUEUED_ASYNC_INDEX_PAGES()}</td>
<td>${xml.POOL_QUEUED_ASYNC_XDA_PAGES()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_DATA_PAGES()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_INDEX_PAGES()}</td>
<td>${xml.POOL_QUEUED_ASYNC_TEMP_XDA_PAGES()}</td>
<td>${xml.POOL_FAILED_ASYNC_DATA_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_INDEX_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_XDA_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_TEMP_DATA_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_TEMP_INDEX_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_TEMP_XDA_REQS()}</td>
<td>${xml.POOL_FAILED_ASYNC_OTHER_REQS()}</td>
<td>${xml.PREFETCH_WAIT_TIME()}</td>
<td>${xml.PREFETCH_WAITS()}</td>
<td>${xml.POOL_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP()}</td>
<td>${xml.POOL_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP()}</td>
<td>${xml.POOL_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP()}</td>
<td>${xml.SECTION_TYPE()}</td>
<td>${xml.INSERT_TIMESTAMP()}</td>
<td>${xml.EFFECTIVE_ISOLATION()}</td>

<td>${xml.STMT_TEXT()}</td>
</tr>

<% pdQuery = it.hasNext() ? it.next() : null } %>


        </table>
