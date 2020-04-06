<% uses java.util.Map %> 
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses java.util.Arrays %>
<% uses java.lang.Integer %>
<% uses java.util.ArrayList %>
<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<%@ params( pages : Map<String, String>, qryGroups : DB2MonClasses.DB2PDGroupMap )%>

<% // List Orderings. There is a .reverse() at the end since we use > instead of < in the comparisons.  ∴ unfound items sort last.s 
 var order1 = {"Top Queries",
 "Reasons for Flagging",
 "Table Statistics",
 "Index Statistics",
 "Tablespace Statistics",
 "Bufferpool Statistics",
 "Workload Periods",
 "Workload Periods All Columns",
 "Instrumentation Queries"}.reverse()
 
 var order2 = {"Group: Query Generator",
    "Group: Less Than 1 Rows Affected",
    "Group: DB2 IN Subquery Rewrite",
    "Group: Zero Rows Affected",
    "Group: TEMP Table",
    "Group: HASH Join",
    "Group: Sort Overflows",
    "Group: Bean",
    "Group: Spatial Query",
    "Group: Gosu Finder"}.reverse() 
    
    var order3 = { "TEMP Table",
    "Sort Overflows",
    "Less Than 1 Rows Affected",
    "Zero Rows Affected",
    "HASH Join"}.reverse()%>
 
<h2 class="awr">DB2 Performance Download </h2>
<br>
<br>

<h3 class="awr">Performance Stats</h3>
<ul>
${pages.Keys.where(\ s -> !s.startsWith("Group") ).sort(\ s, s2 -> order1.indexOf(s) > order1.indexOf(s2))
.map(\ s -> "<li class=\"awr\"><a href = \""+pages.get(s)+"\">" + s + "</a></li>").join("\n")}
</ul>
<br>
<h3 class="awr">Groups</b></h3>
<ul>
${pages.Keys.where(\ s -> s.startsWith("Group") ).sort(\ s, s2 -> order2.indexOf(s) > order2.indexOf(s2)).map(\ s -> "<li class=\"awr\"><a href = \"groups/"+pages.get(s)+"\">" + s + "</a></li>").join("\n")}
</ul>

<h3 class="awr">Reasons for Flagging</h3>
<ul>
${qryGroups.FlaggedGroups.Map.Keys.where(\s -> true).sort(\ s, s2 -> order3.indexOf(s) > order3.indexOf(s2)).map(\ s -> "<li class=\"awr\"><a href = \"groups/"+s+".html\">" + s + "</a></li>").join("\n") }
</ul>
</body>