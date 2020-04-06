<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2table.* %>

<%@ params( tables : Collection<DB2MonClasses.DB2PDTable> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Table Statistics <B>
<br>
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
   <th>Tab File Id</th>
   <th>Data Partition_id</th>
   <th>Tbsp_id</th>
   <th>Index Tbsp Id</th>
   <th>Long Tbsp Id</th>
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
 <%  var odd = false
     var clss = "awrc"
     for (table in tables) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
     var tbstat =  DB2TABLE.parse(table.RawXML)%>
     <tr class="${clss}">
     <td><a href="../tables/${table.TableName}.html">${table.TableName}</a></td>
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
    <% } %>
    </table>

    </body>
 </html>
