<% uses java.util.Collection %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>

<%@ params( evtMons : Collection<DB2MonClasses.DB2MonEventInfo> ) %>


<%-- Print out the Header --%>
${gw.database.dmv.DMVHeaderTempl.renderToString()}

<body class="awr">

<%-- Print the Tabular data --%>


<B> DB2 Event Monitors <B>
<br>
<br>
<table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
<tr>
<th>Name</th>
<th>Type</th>
<th>AutoStart</th>
<th>Target Type</th>
<th>State</th>
<th>Definer</th>
<th>Owner</th>
<th>$Owner Type</th>
<th>Buffer Size</th>
<th>Io Mode</th>
<th>Max Files</th>
<th>Max File Size}</th>
<th>Version Number</th>
<th>Write Mode</th>
<th>Target</th>
<th>Table Names</th>
</tr>
 <%  var odd = false
     var clss = "awrc"
     for (evtMon in evtMons) {
       clss  =  odd ? "awrc"  : "awrnc"
       odd = ! odd;
 %>
     <tr class="${clss}">
     <td>${evtMon.Evmonname}</td>
<td>${evtMon.Type}</td>
<td>${evtMon.Autostart}</td>
<td>${evtMon.TargetType}</td>
<td>${evtMon.EvmonState == 1 ? "Active" : "Inactive"}</td>
<td>${evtMon.Definer}</td>
<td>${evtMon.Owner}</td>
<td>${evtMon.Ownertype}</td>
<td>${evtMon.Buffersize}</td>
<td>${evtMon.IoMode}</td>
<td>${evtMon.Maxfiles == null ? "" : evtMon.Maxfiles}</td>
<td>${evtMon.Maxfilesize == null ? "" : evtMon.Maxfilesize}</td>
<td>${evtMon.Versionnumber}</td>
<td>${evtMon.WriteMode == null ? "" : evtMon.WriteMode}</td>
<td>${evtMon.Target}</td>
<td>${evtMon.TableNames == null ? "" : evtMon.TableNames}</td>
 </tr>     
    <% } %>
    </table>

    </body>
 </html>
