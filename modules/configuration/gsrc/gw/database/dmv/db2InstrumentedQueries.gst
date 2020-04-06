<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dbmsinstrumentation.InstrumentedInstrumentationQuery%>
<% uses gw.xml.XmlSimpleValue %>
<% uses gw.xsd.database.db2tablespace.* %>

<%@ params( iqs : Collection<InstrumentedInstrumentationQuery> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>

<B> DB2 Instrumentation Queries <B>
<br>
<br>

<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th>Duration (s)</td>
<th>Start Time</td>
<th>End Time</td>
<th>Thread Name</td>
<th>Description</td>
<th>Query</td>
</tr>

 <%  var odd = false
     var clss = "awrc"
     for (iq in iqs) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
%>
     <tr class="${clss}">
     <td>${iq.DurationInSeconds}</td>
     <td>${iq.StartTime}</td>
     <td>${iq.EndTime}</td>     
     <td>${iq.ThreadName}</td>     
     <td>${iq.Description}</td>     
     <td>${iq.Query}</td>
  </tr>     
    <% } %>
    </table>
    </body>
 </html> 
     