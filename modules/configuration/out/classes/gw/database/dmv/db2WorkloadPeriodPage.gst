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
   <th>Act Completed Total</th>
   <th>Total Cpu Time</th>
   <th>Total Act Time</th>
   <th>Total Act Wait Time</th>
   <th>Total Section Proc Time</th>
   <th>Total Section Time</th>
   <th>Lock Wait Time</th>
   <th>Lock Waits</th>

   <th>Total Section Sort Proc Time</th>
   <th>Total Section Sort Time</th>
   <th>Total Section Sorts</th>
   <th>Post Shrthreshold Sorts</th>
   <th>Sort Overflows</th>
   
   <th>Pool Data L Reads</th>
   <th>Pool Data P Reads</th>
   <th>Pool Data Writes</th>
       
   <th>Pool Index L Reads</th>
   <th>Pool Index P Reads</th>
   <th>Pool Index Writes</th>
   
   <th>Pool Temp Data L Reads</th>
   <th>Pool Temp Data P Reads</th>

   <th>Pool Read Time</th>
   <th>Pool Write Time</th>

   <th>Prefetch Wait Time</th>
   <th>Prefetch Waits</th>

   <th>Direct Read Time</th>
   <th>Direct Reads</th>
   <th>Direct Write Time</th>
   <th>Direct Writes</th>

   <th>Total Peds</th>
   <th>Disabled Peds</th>
   <th>Post Threshold Peds</th>
   <th>Total Peas</th>
   <th>Post Threshold Peas</th>


   <th>Rows Read</th>
   <th>Rows Modified</th>

   
   <th>Rows Returned</th>
   <th>Deadlocks</th>
   <th>Lock Timeouts</th>
   <th>Lock Escals</th>
 
</tr>
 <%  var odd = false
     var clss = "awrc"
     for (period in (wlPeriods.PeriodElements)) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
     var sm =  period.ParsedXML %>
     <tr class="${clss}">
<td>${period.StatisticsTime}</td>
<td>${sm.ActCompletedTotal()}</td>
<td>${sm.TotalCpuTime()}</td>
<td>${sm.TotalActTime()}</td>
<td>${sm.TotalActWaitTime()}</td>
<td>${sm.TotalSectionProcTime()}</td>
<td>${sm.TotalSectionTime()}</td>
<td>${sm.LockWaitTime()}</td>
<td>${sm.LockWaits()}</td>


<td>${sm.TotalSectionSortProcTime()}</td>
<td>${sm.TotalSectionSortTime()}</td>
<td>${sm.TotalSectionSorts()}</td>
<td>${sm.PostShrthresholdSorts()}</td>
<td>${sm.SortOverflows()}</td>



<td>${sm.PoolDataLReads()}</td>
<td>${sm.PoolDataPReads()}</td>
<td>${sm.PoolDataWrites()}</td>

<td>${sm.PoolIndexLReads()}</td>
<td>${sm.PoolIndexPReads()}</td>
<td>${sm.PoolIndexWrites()}</td>

<td>${sm.PoolTempDataLReads()}</td>
<td>${sm.PoolTempDataPReads()}</td>

<td>${sm.PoolReadTime()}</td>
<td>${sm.PoolWriteTime()}</td>

<td>${sm.PrefetchWaitTime()}</td>
<td>${sm.PrefetchWaits()}</td>

<td>${sm.DirectReadTime()}</td>
<td>${sm.DirectReads()}</td>
<td>${sm.DirectWriteTime()}</td>
<td>${sm.DirectWrites()}</td>

<td>${sm.TotalPeds()}</td>
<td>${sm.DisabledPeds()}</td>
<td>${sm.PostThresholdPeds()}</td>
<td>${sm.TotalPeas()}</td>
<td>${sm.PostThresholdPeas()}</td>


<td>${sm.RowsRead()}</td>
<td>${sm.RowsModified()}</td>


<td>${sm.RowsReturned()}</td>
<td>${sm.Deadlocks()}</td>
<td>${sm.LockTimeouts()}</td>
<td>${sm.LockEscals()}</td>


 </tr>     
    <% } %>
    </table>

    </body>
 </html>
