<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>

<%@ params( reasonMap : DB2MonClasses.DB2PDGroupMap ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Reasons For Flagging <B>
<br>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th> Reason For Flagging </th>
<th> Plans </th>
</tr>

 <% var queryHashMap = reasonMap.QueryHashMap 
    for (reason in queryHashMap.Keys) { %>
      <tr class="awrc">
        <td><a href="${reason}.html">${reason}</a></td>
        <td>${queryHashMap.get(reason).map(\ o -> "<a href=\"../queries/query"+ o + ".html\">" + o + "</a>").join(", ")}</td>
      </tr>
    <% } %>
    </table>

    </body>
 </html>
