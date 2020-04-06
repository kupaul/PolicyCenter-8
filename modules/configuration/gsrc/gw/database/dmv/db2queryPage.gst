<% uses java.util.TimeZone %>
<% uses java.util.Collection %>
<% uses javax.xml.bind.annotation.XmlAccessOrder %>
<% uses gw.database.dmv.db2queryPage %>
<% uses com.guidewire.pl.perfdownload.platform.analyzer.sql.SQLPrettyPrinterFactory %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xsd.database.db2queryplan.* %>
<% uses java.math.BigDecimal %>
<% uses java.math.MathContext %>
<% uses java.lang.NullPointerException %>
<% uses gw.xsd.database.db2objectusage.* %>
<% uses gw.database.dmv.db2UsageListTable %>

<%@ params(consolodatedQuery : DB2MonClasses.DB2PDQuery, monTotals :DB2MonClasses.DB2MonTotals) %>

<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<%   var importantAttributes = {"UNIQUE", "SORTKEY", "EARLYOUT", "PREFETCH", "MAXPAGES", "NUMROWS", "ROWWIDTH", "AGGMODE", "JUMPSCAN", "OUTERJN"}%>
<%   var xml = consolodatedQuery.QueryPlan.ParsedXML  %>

<body class="awr">
<h3 class="awr"><a  href="../index.html">DB2 Performance Snapshot</a></h3>
<br>

<b>SQL Statement:</b> <br>
 ${SQLPrettyPrinterFactory.getSQLPrettyPrinter().printText(xml.STATEMENTS().STATEMENT().firstWhere( \ p -> p.EXPLAIN_LEVEL() == "O" ).STATEMENT_TEXT(), true)}
<br><br>

<b>Basic Data</b>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
  <tr>
    <th>DB2 Version</th>
    <th>Sql Type</th>
    <th>Queryopt</th>
    <th>Block</th>
    <th>Isolation</th>
    <th>Buffpage</th>
    <th>Avg Appls</th>
    <th>Sortheap</th>
    <th>Locklist</th>
    <th>Maxlocks</th>
    <th>Locks Avail</th>
    <th>Cpu Speed</th>
    <th>DbHeap</th>
    <th>Comm Speed</th>
    <th>Parallelism</th>
    <th>Datajoiner</th>
  </tr>
  <tr>
    <td>${xml.DB2_VERSION()}</td>
    <td>${xml.SQL_TYPE()}</td>
    <td>${xml.QUERYOPT()}</td>
    <td>${xml.BLOCK()}</td>
    <td>${xml.ISOLATION()}</td>
    <td>${xml.BUFFPAGE()}</td>
    <td>${xml.AVG_APPLS()}</td>
    <td>${xml.SORTHEAP()}</td>
    <td>${xml.LOCKLIST()}</td>
    <td>${xml.MAXLOCKS()}</td>
    <td>${xml.LOCKS_AVAIL()}</td>
    <td>${xml.CPU_SPEED()}</td>
    <td>${xml.DBHEAP()}</td>
    <td>${xml.COMM_SPEED()}</td>
    <td>${xml.PARALLELISM()}</td>
    <td>${xml.DATAJOINER()}</td>
  </tr>
</table>
<br><br>


<%--  Table of Plans  --%>
<br><br> Plans for This Query <br>
${consolodatedQuery.AddlPlans.Count < 2 ? "" : gw.database.dmv.db2pkgcacheTable.renderToString(consolodatedQuery.AddlPlans,null, \q, num -> "<a href=\"#plan"+ num + "\">plan"+ num + "</a>", monTotals )}
<br><br>

<%   var i = 0
    for (query in consolodatedQuery.AddlPlans) {
      i = i + 1
     var  queryPlan = query.QueryPlan
    xml = queryPlan.ParsedXML  %>

<% var mc4 = new MathContext(4) %>
<b><a name = "plan${i}">Plan ${i}</a></b>
<br>
<b>Plan Statistics</b>
${gw.database.dmv.db2pkgcacheTable.renderToString(query.MeInAnArray,null, \q, num -> "<a href=\"#plan"+ num + "\">plan"+ num + "</a>", monTotals )}
<br>
Longest Running Stats
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr><th>Time (ms)</th><th>Timestamp</th></tr>
<tr><td>${query.ParsedXML.MAX_COORD_STMT_EXEC_TIME()}</td>
<td>${query.ParsedXML.MAX_COORD_STMT_EXEC_TIMESTAMP()}</td></tr>
</table>
<%if (!query.ParsedXML.MAX_COORD_STMT_EXEC_TIME_ARGS().Children.Empty) {%>
<table>
<tr><td valign="top">
<% printBindVars(query.ParsedXML.MAX_COORD_STMT_EXEC_TIME_ARGS().MaxCoordStmtExecTimeArgs().MaxCoordStmtExecTimeArg().where(\ m -> m.StmtValueIsreopt().contentEquals("yes")),
                           "Reopt Bind Vars") %>

</td><td valign="top">
<% printBindVars(query.ParsedXML.MAX_COORD_STMT_EXEC_TIME_ARGS().MaxCoordStmtExecTimeArgs().MaxCoordStmtExecTimeArg().where(\ m -> m.StmtValueIsreopt().contentEquals("no")),
                           "Longest Running Bind Vars") %>
</td></tr>
</table>
<% } %>

<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">

  <tr>
    <th>Id</th>
    <th>Parent Id</th>
    <th>Children</th>
    <th>Nodename</th>
    <th>Key Attributes</th>
    <th>Object</th>
    <th>Predicate</th>
    <th>Stream Count</th>
    <th>Total Cost</th>
    <th>First Row Cost</th>
    <th>Cpu Cost</th>
    <th>Io Cost</th>
    <th>Buffers</th>
    <th>Attributes</th>
  </tr>
<%   var clss = "awrc"
     for (plannode in xml.QUERYTREE().PLANNODE()) {
       clss  =  clss == "awrnc" ? "awrc"  : "awrnc" %>
  <tr class="${clss}">
   <td>${plannode.SOURCE_ID()}</td>
   <td>${plannode.TARGET_ID()}</td>
   <td>${plannode.CHILDREN().CHILD()*.CHILD_ID().join(", ")}</td>
   <td>${new String("&nbsp;").repeat((plannode.LEVEL() as int -1) * 3)}${plannode.NODENAME()} </td>
   <td>${plannode.ARGUMENTS().ARGUMENT().where(\ a ->importantAttributes.hasMatch(\ s -> a.ARGUMENT_TYPE().startsWith(s))).map(\ a -> a.ARGUMENT_TYPE() + "=" + a.ARGUMENT_VALUE()).join("<BR>")}&nbsp; </td>
   <td><a href="#${plannode.OBJNAME()}"> ${plannode.OBJNAME()} </a></td>
   <td>${plannode.PREDICATES().PREDICATE().map(\ p -> p.HOW_APPLIED() + ": "+ p.PREDICATE_TEXT() + " <b>[" +new BigDecimal(p.FILTER_FACTOR(), mc4).toString()+"]</b>" + ((p.RANGE_NUM() != null) ? (" (Range: " + p.RANGE_NUM() +")") : "") ).join("<br>")}&nbsp;</td>
   <td>${new BigDecimal(plannode.STREAM_COUNT()).setScale(3,BigDecimal.ROUND_HALF_UP).toString()}</td>
   <td>${new BigDecimal(plannode.OPERATOR().TOTAL_COST()).setScale(3,BigDecimal.ROUND_HALF_UP).toString()}</td>
   <td>${new BigDecimal(plannode.OPERATOR().FIRST_ROW_COST()).setScale(3,BigDecimal.ROUND_HALF_UP).toString()}</td>
   <td>${new BigDecimal(plannode.OPERATOR().CPU_COST()).setScale(3,BigDecimal.ROUND_HALF_UP).toString()}</td>
   <td>${new BigDecimal(plannode.OPERATOR().IO_COST()).setScale(3,BigDecimal.ROUND_HALF_UP).toString()}</td>
   <td>${plannode.OPERATOR().BUFFERS()}</td>
   <td>${plannode.ARGUMENTS().ARGUMENT().map(\ a -> a.ARGUMENT_TYPE() + "=\"" + a.ARGUMENT_VALUE() + "\"").join(", ")}</td>
 </tr>
  <% } %>
    </table>
    <br><br><br>

   <% if (query.ObjectUsages.Count > 0) { 
      var totals = new DB2MonClasses.DB2MonTotals(0, 0, query.ParsedXML.POOL_DATA_L_READS() + query.ParsedXML.POOL_INDEX_L_READS(),
                                                 query.ParsedXML.POOL_DATA_P_READS() + query.ParsedXML.POOL_INDEX_P_READS(), 0) %>

    Object Usage Lists
     ${ db2UsageListTable.renderToString(query.ObjectUsages, "Table Name",
           \ d -> "<a href=\"../tables/"+ d.TbName + ".html\">" + d.ObName + "</a>",
           \ k -> totals ) }
       
    <br><br><br>
    <% } %>

    <table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
     <tr>
        <th>Object Name </th>
        <th>Object Type</th>
        <th>Keycols</th>
        <th>Column Count</th>
        <th>Row Count</th>
        <th>Width</th>
        <th>Pages</th>
        <th>Distinct</th>
        <th>Overhead</th>
        <th>Transfer Rate</th>
        <th>Prefetchsize</th>
        <th>Extentsize</th>
        <th>Cluster</th>
        <th>Nleaf</th>
        <th>Nlevels</th>
        <th>Fullkeycard</th>
        <th>Overflow</th>
        <th>Firstkeycard</th>
        <th>First2keycard</th>
        <th>First3keycard</th>
        <th>First4keycard</th>
        <th>Sequential Pages</th>
        <th>Density</th>
        <th>Average Sequence Gap</th>
        <th>Average Sequence Fetch Gap</th>
        <th>Average Sequence Pages</th>
        <th>Average Sequence Fetch Pages</th>
        <th>Average Random Pages</th>
        <th>Average Random Fetch Pages</th>
        <th>Numrids</th>
        <th>Numrids Deleted</th>
        <th>Num Empty Leafs</th>
        <th>Active Blocks</th>
        <th>Num Data Parts</th>
        <th>Explain Level</th>
      </tr>

      <% for (object in xml.OBJECTS().OBJECT()) { 
         clss  =  clss == "awrnc" ? "awrc"  : "awrnc"  %>

         <tr  class="${clss}">
            <% var tablename = object.KEYCOLS() == '' ? object.OBJECT_NAME() : object.KEYCOLS().substring(0,object.KEYCOLS().indexOf(":")) %>
            <td><a name="${object.OBJECT_NAME()}" href="../tables/${tablename}.html"> ${object.OBJECT_NAME()}</a></td>
            <td> ${object.OBJECT_TYPE()} </td>
            <td> ${object.KEYCOLS()} </td>
            <td> ${object.COLUMN_COUNT()} </td>
            <td> ${object.ROW_COUNT()} </td>
            <td> ${object.WIDTH()} </td>
            <td> ${object.PAGES()} </td>
            <td> ${object.DISTINCT()} </td>
            <td> ${object.OVERHEAD()} </td>
            <td> ${object.TRANSFER_RATE()} </td>
            <td> ${object.PREFETCHSIZE()} </td>
            <td> ${object.EXTENTSIZE()} </td>
            <td> ${object.CLUSTER()} </td>
            <td> ${object.NLEAF()} </td>
            <td> ${object.NLEVELS()} </td>
            <td> ${object.FULLKEYCARD()} </td>
            <td> ${object.OVERFLOW()} </td>
            <td> ${object.FIRSTKEYCARD()} </td>
            <td> ${object.FIRST2KEYCARD()} </td>
            <td> ${object.FIRST3KEYCARD()} </td>
            <td> ${object.FIRST4KEYCARD()} </td>
            <td> ${object.SEQUENTIAL_PAGES()} </td>
            <td> ${object.DENSITY()} </td>
            <td> ${object.AVERAGE_SEQUENCE_GAP()} </td>
            <td> ${object.AVERAGE_SEQUENCE_FETCH_GAP()} </td>
            <td> ${object.AVERAGE_SEQUENCE_PAGES()} </td>
            <td> ${object.AVERAGE_SEQUENCE_FETCH_PAGES()} </td>
            <td> ${object.AVERAGE_RANDOM_PAGES()} </td>
            <td> ${object.AVERAGE_RANDOM_FETCH_PAGES()} </td>
            <td> ${object.NUMRIDS()} </td>
            <td> ${object.NUMRIDS_DELETED()} </td>
            <td> ${object.NUM_EMPTY_LEAFS()} </td>
            <td> ${object.ACTIVE_BLOCKS()} </td>
            <td> ${object.NUM_DATA_PARTS()} </td>
            <td> ${object.EXPLAIN_LEVEL()} </td>
         </tr>         
     <% } %>

    </table>

    <br><br><br>
    <b>Rewritten SQL Statement:</b> <br>

  <%   for(s in xml.STATEMENTS().STATEMENT()) {
          if (s.EXPLAIN_LEVEL() != "O") {  %>
           ${SQLPrettyPrinterFactory.getSQLPrettyPrinter().printText(s.STATEMENT_TEXT(), true)}
       <br><br>
<% } }  } %>
 </html>

<% function printBindVars(bv : java.util.List<gw.internal.schema.gw.xsd.database.db2monroutines.anonymous.elements.MaxCoordStmtExecTimeArgs_MaxCoordStmtExecTimeArg>,
                          title : String) { %>
${title}
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th>Index</th>
<th>Type</th>
<th>is Null</th>
<th>Data</th>
</tr>
<% for (longArg in bv.sortBy(\ m -> m.StmtValueIndex() )) { %>
<tr class="awrc">
<td>${longArg.StmtValueIndex()}</td>
<td>${longArg.StmtValueType()}</td>
<td>${longArg.StmtValueIsnull()}</td>
<td>${longArg.StmtValueData()}</td>
</tr>
<% } %>
</table>
<%  }  %>
