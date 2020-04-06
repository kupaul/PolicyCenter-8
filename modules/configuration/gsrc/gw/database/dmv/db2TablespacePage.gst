<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2tablespace.* %>

<%@ params( tablespaces : Collection<DB2MonClasses.DB2PDSimpleXML> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Tablespace Statistics <B>
<br>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<td>Tbsp Name</td>
<td>Tbsp Id</td>
<td>Member</td>
<td>Tbsp Type</td>
<td>Tbsp Content Type</td>
<td>Tbsp Page Size</td>
<td>Tbsp Extent Size</td>
<td>Tbsp Prefetch Size</td>
<td>Tbsp Cur Pool Id</td>
<td>Tbsp Next Pool Id</td>
<td>Fs Caching</td>
<td>Tbsp Rebalancer Mode</td>
<td>Tbsp Using Auto Storage</td>
<td>Tbsp Auto Resize Enabled</td>
<td>Direct Reads</td>
<td>Direct Read Reqs</td>
<td>Direct Writes</td>
<td>Direct Write Reqs</td>
<td>Pool Data L Reads</td>
<td>Pool Temp Data L Reads</td>
<td>Pool Xda L Reads</td>
<td>Pool Temp Xda L Reads</td>
<td>Pool Index L Reads</td>
<td>Pool Temp Index L Reads</td>
<td>Pool Data P Reads</td>
<td>Pool Temp Data P Reads</td>
<td>Pool Xda P Reads</td>
<td>Pool Temp Xda P Reads</td>
<td>Pool Index P Reads</td>
<td>Pool Temp Index P Reads</td>
<td>Pool Data Writes</td>
<td>Pool Xda Writes</td>
<td>Pool Index Writes</td>
<td>Direct Read Time</td>
<td>Direct Write Time</td>
<td>Pool Read Time</td>
<td>Pool Write Time</td>
<td>Pool Async Data Reads</td>
<td>Pool Async Data Read Reqs</td>
<td>Pool Async Data Writes</td>
<td>Pool Async Index Reads</td>
<td>Pool Async Index Read Reqs</td>
<td>Pool Async Index Writes</td>
<td>Pool Async Xda Reads</td>
<td>Pool Async Xda Read Reqs</td>
<td>Pool Async Xda Writes</td>
<td>Vectored Ios</td>
<td>Pages From Vectored Ios</td>
<td>Block Ios</td>
<td>Pages From Block Ios</td>
<td>Unread Prefetch Pages</td>
<td>Files Closed</td>
<td>Tbsp State</td>
<td>Tbsp Used Pages</td>
<td>Tbsp Free Pages</td>
<td>Tbsp Usable Pages</td>
<td>Tbsp Total Pages</td>
<td>Tbsp Pending Free Pages</td>
<td>Tbsp Page Top</td>
<td>Tbsp Max Page Top</td>
<td>Reclaimable Space Enabled</td>
<td>Auto Storage Hybrid</td>
<td>Tbsp Paths Dropped</td>
<th>Pool Async Read Time</th>
<th>Pool Async Write Time</th>
<th>Tbsp Trackmod State</th>
<th>Storage Group Name</th>
<th>Storage Group Id</th>
<th>Tbsp Datatag</th>
<th>Tbsp Last Consec Page</th>
<th>Pool Queued Async Data Reqs</th>
<th>Pool Queued Async Index Reqs</th>
<th>Pool Queued Async Temp Data Reqs</th>
<th>Pool Queued Async Temp Index Reqs</th>
<th>Pool Queued Async Temp Xda Reqs</th>
<th>Pool Queued Async Other Reqs</th>
<th>Pool Queued Async Data Pages</th>
<th>Pool Queued Async Index Pages</th>
<th>Pool Queued Async Xda Reqs</th>
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
<th>Skipped Prefetch Data P Reads</th>
<th>Skipped Prefetch Index P Reads</th>
<th>Skipped Prefetch Xda P Reads</th>
<th>Skipped Prefetch Temp Data P Reads</th>
<th>Skipped Prefetch Temp Index P Reads</th>
<th>Skipped Prefetch Temp Xda P Reads</th>
<th>Skipped Prefetch Uow Data P Reads</th>
<th>Skipped Prefetch Uow Index P Reads</th>
<th>Skipped Prefetch Uow Xda P Reads</th>
<th>Skipped Prefetch Uow Temp Data P Reads</th>
<th>Skipped Prefetch Uow Temp Index P Reads</th>
<th>Skipped Prefetch Uow Temp Xda P Reads</th>
<th>Prefetch Wait Time</th>
<th>Prefetch Waits</th>
<th>Pool Data Gbp Indep Pages Found In Lbp</th>
<th>Pool Index Gbp Indep Pages Found In Lbp</th>
<th>Pool Xda Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Data Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Index Gbp Indep Pages Found In Lbp</th>
<th>Pool Async Xda Gbp Indep Pages Found In Lbp</th>
</tr>
 <%  var odd = false
     var clss = "awrc"
     for (tablespace in tablespaces) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
     var ts =  DB2TABLESPACE.parse(tablespace.RawXML)%>
     <tr class="${clss}">
    <td>${tablespace.Name}</td>
<td>${ts.TBSP_ID}</td>
<td>${ts.MEMBER}</td>
<td>${ts.TBSP_TYPE}</td>
<td>${ts.TBSP_CONTENT_TYPE}</td>
<td>${ts.TBSP_PAGE_SIZE}</td>
<td>${ts.TBSP_EXTENT_SIZE}</td>
<td>${ts.TBSP_PREFETCH_SIZE}</td>
<td>${ts.TBSP_CUR_POOL_ID}</td>
<td>${ts.TBSP_NEXT_POOL_ID}</td>
<td>${ts.FS_CACHING}</td>
<td>${ts.TBSP_REBALANCER_MODE}</td>
<td>${ts.TBSP_USING_AUTO_STORAGE}</td>
<td>${ts.TBSP_AUTO_RESIZE_ENABLED}</td>
<td>${ts.DIRECT_READS}</td>
<td>${ts.DIRECT_READ_REQS}</td>
<td>${ts.DIRECT_WRITES}</td>
<td>${ts.DIRECT_WRITE_REQS}</td>
<td>${ts.POOL_DATA_L_READS}</td>
<td>${ts.POOL_TEMP_DATA_L_READS}</td>
<td>${ts.POOL_XDA_L_READS}</td>
<td>${ts.POOL_TEMP_XDA_L_READS}</td>
<td>${ts.POOL_INDEX_L_READS}</td>
<td>${ts.POOL_TEMP_INDEX_L_READS}</td>
<td>${ts.POOL_DATA_P_READS}</td>
<td>${ts.POOL_TEMP_DATA_P_READS}</td>
<td>${ts.POOL_XDA_P_READS}</td>
<td>${ts.POOL_TEMP_XDA_P_READS}</td>
<td>${ts.POOL_INDEX_P_READS}</td>
<td>${ts.POOL_TEMP_INDEX_P_READS}</td>
<td>${ts.POOL_DATA_WRITES}</td>
<td>${ts.POOL_XDA_WRITES}</td>
<td>${ts.POOL_INDEX_WRITES}</td>
<td>${ts.DIRECT_READ_TIME}</td>
<td>${ts.DIRECT_WRITE_TIME}</td>
<td>${ts.POOL_READ_TIME}</td>
<td>${ts.POOL_WRITE_TIME}</td>
<td>${ts.POOL_ASYNC_DATA_READS}</td>
<td>${ts.POOL_ASYNC_DATA_READ_REQS}</td>
<td>${ts.POOL_ASYNC_DATA_WRITES}</td>
<td>${ts.POOL_ASYNC_INDEX_READS}</td>
<td>${ts.POOL_ASYNC_INDEX_READ_REQS}</td>
<td>${ts.POOL_ASYNC_INDEX_WRITES}</td>
<td>${ts.POOL_ASYNC_XDA_READS}</td>
<td>${ts.POOL_ASYNC_XDA_READ_REQS}</td>
<td>${ts.POOL_ASYNC_XDA_WRITES}</td>
<td>${ts.VECTORED_IOS}</td>
<td>${ts.PAGES_FROM_VECTORED_IOS}</td>
<td>${ts.BLOCK_IOS}</td>
<td>${ts.PAGES_FROM_BLOCK_IOS}</td>
<td>${ts.UNREAD_PREFETCH_PAGES}</td>
<td>${ts.FILES_CLOSED}</td>
<td>${ts.TBSP_STATE}</td>
<td>${ts.TBSP_USED_PAGES}</td>
<td>${ts.TBSP_FREE_PAGES}</td>
<td>${ts.TBSP_USABLE_PAGES}</td>
<td>${ts.TBSP_TOTAL_PAGES}</td>
<td>${ts.TBSP_PENDING_FREE_PAGES}</td>
<td>${ts.TBSP_PAGE_TOP}</td>
<td>${ts.TBSP_MAX_PAGE_TOP}</td>
<td>${ts.RECLAIMABLE_SPACE_ENABLED}</td>
<td>${ts.AUTO_STORAGE_HYBRID}</td>
<td>${ts.TBSP_PATHS_DROPPED}</td>
<td>${ts.POOL_ASYNC_READ_TIME}</td>
<td>${ts.POOL_ASYNC_WRITE_TIME}</td>
<td>${ts.TBSP_TRACKMOD_STATE}</td>
<td>${ts.STORAGE_GROUP_NAME}</td>
<td>${ts.STORAGE_GROUP_ID}</td>
<td>${ts.TBSP_DATATAG}</td>
<td>${ts.TBSP_LAST_CONSEC_PAGE}</td>
<td>${ts.POOL_QUEUED_ASYNC_DATA_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_INDEX_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_DATA_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_INDEX_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_XDA_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_OTHER_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_DATA_PAGES}</td>
<td>${ts.POOL_QUEUED_ASYNC_INDEX_PAGES}</td>
<td>${ts.POOL_QUEUED_ASYNC_XDA_REQS}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_DATA_PAGES}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_INDEX_PAGES}</td>
<td>${ts.POOL_QUEUED_ASYNC_TEMP_XDA_PAGES}</td>
<td>${ts.POOL_FAILED_ASYNC_DATA_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_INDEX_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_XDA_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_TEMP_DATA_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_TEMP_INDEX_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_TEMP_XDA_REQS}</td>
<td>${ts.POOL_FAILED_ASYNC_OTHER_REQS}</td>
<td>${ts.SKIPPED_PREFETCH_DATA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_INDEX_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_XDA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_TEMP_DATA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_TEMP_INDEX_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_TEMP_XDA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_DATA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_INDEX_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_XDA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_TEMP_DATA_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_TEMP_INDEX_P_READS}</td>
<td>${ts.SKIPPED_PREFETCH_UOW_TEMP_XDA_P_READS}</td>
<td>${ts.PREFETCH_WAIT_TIME}</td>
<td>${ts.PREFETCH_WAITS}</td>
<td>${ts.POOL_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ts.POOL_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ts.POOL_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ts.POOL_ASYNC_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ts.POOL_ASYNC_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ts.POOL_ASYNC_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
  </tr>     
    <% } %>
    </table>

    </body>
 </html>
    
