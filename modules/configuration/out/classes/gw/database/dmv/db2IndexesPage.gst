<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2table.* %>
<% uses gw.xsd.database.db2index.DB2INDX %>

<%@ params( indexes : Collection<DB2MonClasses.DB2PDIndex> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


Indexes
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th> Index Name </th>
<th> Unique </th>
<th width=50> Columns  </th>
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
<th>Index Jump Scans</th>
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

<%  var odd = false
    var clss = "awrc"
    for (indx in indexes) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;   
       var ind =  DB2INDX.parse(indx.RawXML)
    %>
<tr class="${clss}"> 
<td>${ind.NAME}</td>
<td>${ind.UNIQUERULE}</td>
<td width=50>${ind.COLNAMES}</td>
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
<td>${indx.Refqrys.map(\o -> "<a href=\"../queries/query" + o.QueryHash + ".html\">" + o.QueryHash +"</a>" ).join(", ") }</td>
</tr>
<% } %>
</table>


    </body>
 </html>
