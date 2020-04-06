<%-- template for generating HTML for the heat map --%>

<% uses gw.api.heatmap.HeatMapGenerator %>
<% uses gw.api.heatmap.IHeatMapTemplate %>
<%@ params(heatMap : HeatMapGenerator, mapTemplate : IHeatMapTemplate, mapOption : String) %>
<%
  var popupMapHeight = 675
  var requestedHeight = mapOption == "popupMap" ? popupMapHeight : heatMap.InitialHeight
%>

<%  if (mapOption == "iframe") { /* frame for popupMap */ %>

<iframe id="mapFrame" src="./MapOverlay.do?map.html=popupMap&mapName=${ heatMap.MapName }" width="100%" height="${ popupMapHeight - 15 }" frameborder="0">
  <p>${ displaykey.Web.HeatMap.BrowserDoesntSupportIframes }</p>
</iframe>

<% } else { %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
   <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta http-equiv="Pragma" content="no-cache">
      ${ mapTemplate.MapScriptHTML }
      <script type="text/javascript">
        ${ mapTemplate.renderJavaScriptTemplate(heatMap, mapOption) }
      </script>
      <% for (jsFile in mapTemplate.javaScriptFileNames()) { %>
        <script type="text/javascript" src="${ jsFile }"></script>
      <% } %>
   </head>
   <body onload="heatMap.LoadMap()" onunload="heatMap.UnloadMap()" style="margin:0px;">
      <div id="loading_msg">${ mapTemplate.LoadingMessage }</div>
     <% if (not heatMap.haveLegendImage()) { %>
       <div id="mapDiv" style="position:relative; width:100%; height:${ requestedHeight }px;"></div>
     <% } else  { %>
       <table cellspacing="0">
         <tr>
           <td style="width:100%; padding-top: 0px; padding-bottom: 0px; padding-right: 0px; padding-left: 0px;">
             <div id="mapDiv" style="position:relative; width:100%; height:${ requestedHeight }px;"></div>
           </td>
           <td align="center" style="padding-top: 0px; padding-bottom: 0px; padding-right: 0px; padding-left: 0px;">
             <img id="legendImg" src="./MapOverlay.do?legend=&mapName=${ heatMap.MapName }">
           </td>
         </tr>
       </table>
     <% } %>
   </body>
</html>
<% } %>