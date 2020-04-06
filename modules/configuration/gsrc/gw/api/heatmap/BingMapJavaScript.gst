<%-- template for using Bing Maps for a heat map --%>

<% uses gw.api.heatmap.HeatMapGenerator
   uses gw.api.heatmap.IHeatMapTemplate
%>
<%@ params(heatMap : HeatMapGenerator, template : IHeatMapTemplate, mapOption : String) %>
  function initMap() {
    // set template-substituted variables
    mapName = "${ heatMap.MapName }";
    credential = "${ HeatMapGenerator.getHeatMapCredential() }";
    <% if (heatMap.SelectionMessageID != null) { %>
      selectionMessageNodeID = ":${ heatMap.SelectionMessageID }";
    <% } %>
    refreshUponSelection = ${ heatMap.RefreshUponSelection };

    zoom = ${ heatMap.Zoom };
    autoScale = ${ heatMap.AutoScale };
    centerLatLong = new VELatLong( ${ heatMap.CenterLat }, ${ heatMap.CenterLng });
    _margin = ${ heatMap.Margin };
    _boundingBoxWidth = ${ heatMap.BoundingBoxWidth };
    _boundingBoxHeight = ${ heatMap.BoundingBoxHeight };
    markerSize = ${ heatMap.MarkerSize };

    MAX_ZOOM = ${ HeatMapGenerator.MAX_ZOOM };

    useKilometers = ${ heatMap.useKilometers };
    haveLegendImage = ${ heatMap.haveLegendImage() };

    popupMapWidth = ${ heatMap.popupMapWidth };
    popupMapHeight = ${ heatMap.popupMapHeight };
    popupMapElementName = ":${ heatMap.popupMapElementName }";

    cantLoadMapMessage = "${ displaykey.Web.HeatMap.CantLoadBingMaps }";

    selectionColor = new VEColor( ${ heatMap.SelectionColor.Red },
                                    ${ heatMap.SelectionColor.Green },
                                    ${ heatMap.SelectionColor.Blue },
                                    ${ heatMap.SelectionColor.Alpha/255. });
    <% if (heatMap.SelectionPoint1 != null) { %>
      selectionPoint1 = new VELatLong( ${ heatMap.SelectionPoint1.getLat() },
                                       ${ heatMap.SelectionPoint1.getLong() });
      selectionPoint2 = new VELatLong( ${ heatMap.SelectionPoint2.getLat() },
                                       ${ heatMap.SelectionPoint2.getLong() });
    <% } %>
    <% if (heatMap.AreaOfInterestColor != null) { %>
      areaOfInterestColor = new VEColor( ${ heatMap.AreaOfInterestColor.Red },
                                         ${ heatMap.AreaOfInterestColor.Green },
                                         ${ heatMap.AreaOfInterestColor.Blue },
                                         ${ heatMap.AreaOfInterestColor.Alpha/255. });
    <% } %>

    <% if (heatMap.AreaOfInterestPoint1 != null) { %>
      areaOfInterestPoint1 = new VELatLong( ${ heatMap.AreaOfInterestPoint1.getLat() },
                                            ${ heatMap.AreaOfInterestPoint1.getLong() });
      areaOfInterestPoint2 = new VELatLong( ${ heatMap.AreaOfInterestPoint2.getLat() },
                                            ${ heatMap.AreaOfInterestPoint2.getLong() });
    <% } %>
  }
