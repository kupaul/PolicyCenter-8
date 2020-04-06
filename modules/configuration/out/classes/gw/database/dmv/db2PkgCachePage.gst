<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xml.XmlSimpleValue %>

<%@ params( queriesToPrint : Collection<DB2MonClasses.DB2PDQuery>, totals :DB2MonClasses.DB2MonTotals  ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>
   ${gw.database.dmv.db2pkgcacheTable.renderToString(queriesToPrint,null, null, totals )}
    </body>
 </html>
 