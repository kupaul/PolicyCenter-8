<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2bufferpool.* %>

<%@ params( bufferpools : Collection<DB2MonClasses.DB2PDSimpleXML> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Bufferpool Statistics <B>
<br>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th>Bp Name</th>
<th>Automatic</th>
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
<th>Direct Read Time</th>
<th>Direct Write Time</th>
<th>Pool Read Time</th>
<th>Pool Write Time</th>
<th>Pool Async Data Reads</th>
<th>Pool Async Data Read Reqs</th>
<th>Pool Async Data Writes</th>
<th>Pool Async Index Reads</th>
<th>Pool Async Index Read Reqs</th>
<th>Pool Async Index Writes</th>
<th>Pool Async Xda Reads</th>
<th>Pool Async Xda Read Reqs</th>
<th>Pool Async Xda Writes</th>
<th>Pool No Victim Buffer</th>
<th>Pool Lsn Gap Clns</th>
<th>Pool Drty Pg Steal Clns</th>
<th>Pool Drty Pg Thrsh Clns</th>
<th>Vectored Ios</th>
<th>Pages From Vectored Ios</th>
<th>Block Ios</th>
<th>Pages From Block Ios</th>
<th>Unread Prefetch Pages</th>
<th>Files Closed</th>
<th>Pool Data Gbp Indep Pages Found In Lbp</th>
<th>Pool Index Gbp Indep Pages Found In Lbp</th>
<th>Pool Xda Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Data Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Index Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Xda Gbp Indep Pages Found In Lbp</th>
</tr>
 <%  var odd = false
     var clss = "awrc"
     for (bufferpool in bufferpools) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
     var bp =  DB2BUFFERPOOL.parse(bufferpool.RawXML)%>
     <tr class="${clss}">
     <td>${bufferpool.Name}</td>
<td>${bp.AUTOMATIC}</td>
<td>${bp.DIRECT_READS}</td>
<td>${bp.DIRECT_READ_REQS}</td>
<td>${bp.DIRECT_WRITES}</td>
<td>${bp.DIRECT_WRITE_REQS}</td>
<td>${bp.POOL_DATA_L_READS}</td>
<td>${bp.POOL_TEMP_DATA_L_READS}</td>
<td>${bp.POOL_XDA_L_READS}</td>
<td>${bp.POOL_TEMP_XDA_L_READS}</td>
<td>${bp.POOL_INDEX_L_READS}</td>
<td>${bp.POOL_TEMP_INDEX_L_READS}</td>
<td>${bp.POOL_DATA_P_READS}</td>
<td>${bp.POOL_TEMP_DATA_P_READS}</td>
<td>${bp.POOL_XDA_P_READS}</td>
<td>${bp.POOL_TEMP_XDA_P_READS}</td>
<td>${bp.POOL_INDEX_P_READS}</td>
<td>${bp.POOL_TEMP_INDEX_P_READS}</td>
<td>${bp.POOL_DATA_WRITES}</td>
<td>${bp.POOL_XDA_WRITES}</td>
<td>${bp.POOL_INDEX_WRITES}</td>
<td>${bp.DIRECT_READ_TIME}</td>
<td>${bp.DIRECT_WRITE_TIME}</td>
<td>${bp.POOL_READ_TIME}</td>
<td>${bp.POOL_WRITE_TIME}</td>
<td>${bp.POOL_ASYNC_DATA_READS}</td>
<td>${bp.POOL_ASYNC_DATA_READ_REQS}</td>
<td>${bp.POOL_ASYNC_DATA_WRITES}</td>
<td>${bp.POOL_ASYNC_INDEX_READS}</td>
<td>${bp.POOL_ASYNC_INDEX_READ_REQS}</td>
<td>${bp.POOL_ASYNC_INDEX_WRITES}</td>
<td>${bp.POOL_ASYNC_XDA_READS}</td>
<td>${bp.POOL_ASYNC_XDA_READ_REQS}</td>
<td>${bp.POOL_ASYNC_XDA_WRITES}</td>
<td>${bp.POOL_NO_VICTIM_BUFFER}</td>
<td>${bp.POOL_LSN_GAP_CLNS}</td>
<td>${bp.POOL_DRTY_PG_STEAL_CLNS}</td>
<td>${bp.POOL_DRTY_PG_THRSH_CLNS}</td>
<td>${bp.VECTORED_IOS}</td>
<td>${bp.PAGES_FROM_VECTORED_IOS}</td>
<td>${bp.BLOCK_IOS}</td>
<td>${bp.PAGES_FROM_BLOCK_IOS}</td>
<td>${bp.UNREAD_PREFETCH_PAGES}</td>
<td>${bp.FILES_CLOSED}</td>
<td>${bp.POOL_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${bp.POOL_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${bp.POOL_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${bp.POOL_ASYNC_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${bp.POOL_ASYNC_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${bp.POOL_ASYNC_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
 </tr>     
    <% } %>
    </table>

    </body>
 </html>
