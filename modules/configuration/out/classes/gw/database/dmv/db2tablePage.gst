<% uses gw.xsd.database.db2table.* %>
<% uses gw.xsd.database.db2index.* %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses java.util.Collection %>
<% uses java.util.HashSet %>
<% uses java.util.Map %>
<% uses java.util.HashMap %>


<%@ params( table : DB2MonClasses.DB2PDTable  ) %>

<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<%    var xml =  DB2TABLE.parse(table.RawXML) 
      var objTotals : Map<String, DB2MonClasses.DB2MonTotals>  = new HashMap<String, DB2MonClasses.DB2MonTotals> ()
 %>

<B> DB2 Table Data </B>
<br>
<br>
<B>${xml.NAME}</B>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
   <th>Name</th>
   <th>Table Scans</th>
   <th>Rows Read</th>
   <th>Rows Inserted</th>
   <th>Rows Updated</th>
   <th>Rows Deleted</th>
   <th>Overflow Accesses</th>
   <th>Overflow Creates</th>
   <th>Page Reorgs</th>
   <th>Tab Type</th>
   <th>Tab File_id</th>
   <th>Data Partition_id</th>
   <th>Tbsp_id</th>
   <th>Index Tbsp_id</th>
   <th>Long Tbsp_id</th>
   <th>Data Object L Pages</th>
   <th>Lob Object L Pages</th>
   <th>Long Object L Pages</th>
   <th>Index Object L Pages</th>
   <th>Xda Object L Pages</th>
   <th>Dbpartitionnum</th>
   <th>No Change Updates</th>
   <th>Lock Wait Time</th>
   <th>Lock Wait Time Global</th>
   <th>Lock Waits</th>
   <th>Lock Waits Global</th>
   <th>Lock Escals</th>
   <th>Lock Escals Global</th>
   <th>Direct Writes</th>
   <th>Direct Write Reqs</th>
   <th>Direct Reads</th>
   <th>Direct Read Reqs</th>
   <th>Object Data L Reads</th>
   <th>Object Data P Reads</th>
   <th>Object Data Gbp L Reads</th>
   <th>Object Data Gbp P Reads</th>
   <th>Object Data Gbp Invalid Pages</th>
   <th>Object Data Lbp Pages Found</th>
   <th>Object Data Gbp Indep Pages Found In Lbp</th>
   <th>Object Xda L Reads</th>
   <th>Object Xda P Reads</th>
   <th>Object Xda Gbp L Reads</th>
   <th>Object Xda Gbp P Reads</th>
   <th>Object Xda Gbp Invalid Pages</th>
   <th>Object Xda Lbp Pages Found</th>
   <th>Object Xda Gbp Indep Pages Found In Lbp</th>
   <th>Num Page Dict Built</th>
</tr>
 <%  var tbstat = xml %>
     <tr class="awrc">
     <td><a href="../tables/${xml.NAME}.html">${xml.NAME}</a></td>
     <td>${tbstat.TABLE_SCANS}</td>
     <td>${tbstat.ROWS_READ}</td>
     <td>${tbstat.ROWS_INSERTED}</td>
     <td>${tbstat.ROWS_UPDATED}</td>
     <td>${tbstat.ROWS_DELETED}</td>
     <td>${tbstat.OVERFLOW_ACCESSES}</td>
     <td>${tbstat.OVERFLOW_CREATES}</td>
     <td>${tbstat.PAGE_REORGS}</td>
     <td>${tbstat.TAB_TYPE}</td>
     <td>${tbstat.TAB_FILE_ID}</td>
     <td>${tbstat.DATA_PARTITION_ID}</td>
     <td>${tbstat.TBSP_ID}</td>
     <td>${tbstat.INDEX_TBSP_ID}</td>
     <td>${tbstat.LONG_TBSP_ID}</td>
     <td>${tbstat.DATA_OBJECT_L_PAGES}</td>
   <td>${tbstat.LOB_OBJECT_L_PAGES}</td>
   <td>${tbstat.LONG_OBJECT_L_PAGES}</td>
   <td>${tbstat.INDEX_OBJECT_L_PAGES}</td>
   <td>${tbstat.XDA_OBJECT_L_PAGES}</td>
   <td>${tbstat.DBPARTITIONNUM}</td>
   <td>${tbstat.NO_CHANGE_UPDATES}</td>
   <td>${tbstat.LOCK_WAIT_TIME}</td>
   <td>${tbstat.LOCK_WAIT_TIME_GLOBAL}</td>
   <td>${tbstat.LOCK_WAITS}</td>
   <td>${tbstat.LOCK_WAITS_GLOBAL}</td>
   <td>${tbstat.LOCK_ESCALS}</td>
   <td>${tbstat.LOCK_ESCALS_GLOBAL}</td>
   <td>${tbstat.DIRECT_WRITES}</td>
   <td>${tbstat.DIRECT_WRITE_REQS}</td>
   <td>${tbstat.DIRECT_READS}</td>
   <td>${tbstat.DIRECT_READ_REQS}</td>
   <td>${tbstat.OBJECT_DATA_L_READS}</td>
   <td>${tbstat.OBJECT_DATA_P_READS}</td>
   <td>${tbstat.OBJECT_DATA_GBP_L_READS}</td>
   <td>${tbstat.OBJECT_DATA_GBP_P_READS}</td>
   <td>${tbstat.OBJECT_DATA_GBP_INVALID_PAGES}</td>
   <td>${tbstat.OBJECT_DATA_LBP_PAGES_FOUND}</td>
   <td>${tbstat.OBJECT_DATA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
   <td>${tbstat.OBJECT_XDA_L_READS}</td>
   <td>${tbstat.OBJECT_XDA_P_READS}</td>
   <td>${tbstat.OBJECT_XDA_GBP_L_READS}</td>
   <td>${tbstat.OBJECT_XDA_GBP_P_READS}</td>
   <td>${tbstat.OBJECT_XDA_GBP_INVALID_PAGES}</td>
   <td>${tbstat.OBJECT_XDA_LBP_PAGES_FOUND}</td>
   <td>${tbstat.OBJECT_XDA_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
   <td>${tbstat.NUM_PAGE_DICT_BUILT}</td>

 </tr>     
    </table>
<br>
Indexes
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr  class="awrc">
<th> Index Name </th>
<th> Unique </th>
<th> Columns  </th>
<th>Nleaf</th>
<th>Nlevels</th>
<th>Index Scans</th>
<th>Index Only Scans</th>
<th>Key Updates</th>
<th>Object Index L Reads</th>
<th>Object Index P Reads</th>
<th>Object Index Gbp L Reads</th>
<th>Object Index Gbp P Reads</th>
<th>Object Index Gbp Invalid Pages</th>
<th>Object Index Lbp Pages Found</th>
<th>Object Index Gbp Indep Pages Found In Lbp</th>
<th>Include Col Updates</th>
<th>Pseudo Deletes</th>
<th>Del Keys Cleaned</th>
<th>Root Node Splits</th>
<th>Int Node Splits</th>
<th>Boundary Leaf Node Splits</th>
<th>NONBOUNDARY Leaf Node Splits</th>
<th>Page Allocations</th>
<th>Pseudo Empty Pages</th>
<th>Empty Pages Reused</th>
<th>Empty Pages Deleted</th>
<th>Pages Merged</th>
<th>Name In Entity</th>
<th>Description</th>
<th>Referencing Queries</th>

</tr>

<% objTotals.put(xml.NAME, new DB2MonClasses.DB2MonTotals(0,0,xml.OBJECT_DATA_L_READS, xml.OBJECT_DATA_P_READS,0))

   for (indx in table.Indexes) {   
   var ind =  DB2INDX.parse(indx.RawXML) 
   objTotals.put(ind.NAME.replaceFirst(".*\\.", ""), new DB2MonClasses.DB2MonTotals(0,0,ind.OBJECT_INDEX_L_READS, ind.OBJECT_INDEX_P_READS, 0) )%>
<tr class="awrc"> 
<td>${ind.NAME}</td>
<td>${ind.UNIQUERULE}</td>
<td>${ind.COLNAMES}</td>
<td>${ind.NLEAF}</td>
<td>${ind.NLEVELS}</td>
<td>${ind.INDEX_SCANS}</td>
<td>${ind.INDEX_ONLY_SCANS}</td>
<td>${ind.KEY_UPDATES}</td>
<td>${ind.OBJECT_INDEX_L_READS}</td>
<td>${ind.OBJECT_INDEX_P_READS}</td>
<td>${ind.OBJECT_INDEX_GBP_L_READS}</td>
<td>${ind.OBJECT_INDEX_GBP_P_READS}</td>
<td>${ind.OBJECT_INDEX_GBP_INVALID_PAGES}</td>
<td>${ind.OBJECT_INDEX_LBP_PAGES_FOUND}</td>
<td>${ind.OBJECT_INDEX_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${ind.INDEX_JUMP_SCANS}</td>
<td>${ind.INCLUDE_COL_UPDATES}</td>
<td>${ind.PSEUDO_DELETES}</td>
<td>${ind.DEL_KEYS_CLEANED}</td>
<td>${ind.ROOT_NODE_SPLITS}</td>
<td>${ind.INT_NODE_SPLITS}</td>
<td>${ind.BOUNDARY_LEAF_NODE_SPLITS}</td>
<td>${ind.NONBOUNDARY_LEAF_NODE_SPLITS}</td>
<td>${ind.PAGE_ALLOCATIONS}</td>
<td>${ind.PSEUDO_EMPTY_PAGES}</td>
<td>${ind.EMPTY_PAGES_REUSED}</td>
<td>${ind.EMPTY_PAGES_DELETED}</td>
<td>${ind.PAGES_MERGED}</td>
<td>${indx.EntityName}</td>
<td>${indx.Description}</td>
<td>
<% var comma = ""
   for (ref in indx.Refqrys) { %>
   ${comma}<a href="../queries/query${ref.QueryHandle}.html">${ref.QueryHandle}</a>
<% comma = "," } %>
</td>
</tr>
<% } %>
</table>
<br><br>
<br>
Referencing Queries
 ${gw.database.dmv.db2pkgcacheTable.renderToString(table.RefqryValues, table.TableAccess, null, null )}

<% if (table.ObjectUsages != null ) { %>
<br><br>
Usage Lists by Query
<% var sorted = table.ObjectUsages.toList().sortBy(\ d -> d.ObName ) %>

 ${gw.database.dmv.db2UsageListTable.renderToString(sorted, "Query",  \ d ->  "<a href=\"../queries/query" + table.Refqrys.get(d.DmvHandle).QueryHash + ".html\">" +
        table.Refqrys.get(d.DmvHandle).QueryHash + "</a>", \ k -> objTotals.get(k)  )  }
 <% } %>
 
 </body></html>


