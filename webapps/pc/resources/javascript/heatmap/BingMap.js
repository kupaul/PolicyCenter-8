  // variables whose values are set in initMap()
  var mapName;
  var credential;
  var selectionMessageNodeID;
  var refreshUponSelection;
  var zoom;
  var autoScale;
  var centerLatLong;
  var _margin;
  var _boundingBoxWidth;
  var _boundingBoxHeight;
  var markerSize;
  var MAX_ZOOM;

  var useKilometers;
  var haveLegendImage;

  var popupMapWidth;
  var popupMapHeight;
  var popupMapElementName;

  var cantLoadMapMessage;

  var selectionColor;
  var selectionPoint1;
  var selectionPoint2;

  var areaOfInterestColor;

  var areaOfInterestPoint1;
  var areaOfInterestPoint2;

  initMap();

  var isIE = navigator.appName == "Microsoft Internet Explorer";
  var map;
  var selectLayer;
  var url = "./MapOverlay.do";
  var height;
  var width;
  var fillColor = new VEColor(0, 0, 0, 0);
  var messageElement;

  function HeatMap() { }

  // main method that sets up the map
  HeatMap.prototype.LoadMap = function () {
    messageElement = selectionMessageNodeID != null ? this.findByIDSuffix(selectionMessageNodeID) : null;
    var popupMapElement = this.findByIDSuffix(popupMapElementName);
    if (popupMapElement != null) {
      popupMapElement.onclick = function popupMap() {
        window.open("./MapOverlay.do?map.html=iframe&mapName=" + mapName, "popupMap",
                    "width=" + popupMapWidth + ",height=" + popupMapHeight + ",status=yes,menubar=yes,resizable=yes", true)
              .focus();
      }
    }
    if (window.parent.name == "") {
      window.parent.name = "plugh" // make sure there's a window name for jumping from a claim tooltip to a claim
    }

    var loading_msg = document.getElementById("loading_msg");
    if (typeof VEMap == "function") {
      loading_msg.parentNode.removeChild(loading_msg);
    } else {
      loading_msg.innerHTML = cantLoadMapMessage;
      return;
    }

    this.getMapSize();

    // adjust the zoom based on the actual window size only when first loaded
    if (autoScale) {
      zoom = this.computeZoom();
      this.updateZoom(zoom);
    }

    map = new VEMap("mapDiv");
    map.LoadMap(centerLatLong, zoom, VEMapStyle.Road, false, VEMapMode.Mode2D, /* no 3D control */ false);
    map.SetCredentials(credential);
    map.EnableShapeDisplayThreshold(false);
    var tileSourceSpec = new VETileSourceSpecification("lidar", url + "?tile=%4.png" + "&mapName=" + mapName);
    tileSourceSpec.NumServers = 1;
    tileSourceSpec.Opacity = 1.0;
    tileSourceSpec.ZIndex = 59;

    map.AddTileLayer(tileSourceSpec, true);

    if (areaOfInterestColor != null && areaOfInterestPoint1 != null) {
      this.drawRectangle(areaOfInterestPoint1, areaOfInterestPoint2, areaOfInterestColor, "areaOfInterestLayer");
    }

    if (selectionPoint1 != null) {
    // show the previous selected rectangle
      this.drawSelectionRectangle(selectionPoint1, selectionPoint2);
    }

    // set up mouse handler
    map.AttachEvent("onmousedown", this.mouseEventHandler);
    map.AttachEvent("onmouseup", this.mouseEventHandler);
    map.AttachEvent("onmousemove", this.mouseEventHandler);

    map.AttachEvent("onstartzoom", this.mapNKeyEventHandler);
    map.AttachEvent("onendzoom", this.mapNKeyEventHandler);
    map.AttachEvent("onstartpan", this.mapNKeyEventHandler);
    map.AttachEvent("onendpan", this.mapNKeyEventHandler);
    map.AttachEvent("onkeypress", this.mapNKeyEventHandler);

    // add resize listener
    if (window.addEventListener)
      window.addEventListener('resize', this.onResize, false);
    else if (window.attachEvent)
      window.attachEvent('onresize', this.onResize);

    this.onResize();  // do initial positioning
    if (useKilometers) {
      map.SetScaleBarDistanceUnit(VEDistanceUnit.Kilometers);
    }
  };
  
  HeatMap.prototype.UnloadMap = function () { };

  // clip value so that min <= value <= max
  HeatMap.prototype.clip = function (value, min, max) {
    if (value < min)
      value = min;
    else if (value > max)
      value = max;
    return value;
  };

  // get the lat long for the specified pixel position
  HeatMap.prototype.getLL = function (x, y) {
    var ll = map.PixelToLatLong(new VEPixel(this.clip(x, 0, width-1), this.clip(y, 0, height-1)));
    ll.Latitude = this.clip(ll.Latitude, -90, +90);
    ll.Longitude = this.clip(ll.Longitude, -180, +180);
    return ll
  };

  // remove the selection graphic (i.e., rectangle)
  HeatMap.prototype.removeSelectionGraphic = function() {
    if (selectLayer != null) {
      map.DeleteShapeLayer(selectLayer)
    }
  };
 
  HeatMap.prototype.drawSelectionRectangle = function (pointA, pointB) {
    selectLayer = this.drawRectangle(pointA, pointB, selectionColor, "selectLayer")
  };

  // draw a rectangle
  HeatMap.prototype.drawRectangle = function (pointA, pointB, color, layerName) {
     var rectPoints = new Array(
         pointA,
         new VELatLong(pointA.Latitude, pointB.Longitude),
         pointB,
         new VELatLong(pointB.Latitude, pointA.Longitude)
     );

     var layer = new VEShapeLayer();
     layer.SetTitle(layerName);
     map.AddShapeLayer(layer);

     var rectangle = new VEShape(VEShapeType.Polygon, rectPoints);
     rectangle.SetLineWidth(2);
     rectangle.SetLineColor(color);
     rectangle.SetFillColor(fillColor);
     rectangle.HideIcon();
     layer.AddShape(rectangle);
     return layer;
  };

  //----

  // set an element's opacity between 0 and 1
  HeatMap.prototype.setOpacity = function (el, opacity) {
    if (isIE) {
      el.style.filter = "alpha(opacity=" + (opacity*100.).toFixed(0) + ")";
    } else {
      el.style.opacity = opacity.toFixed(2);
    }
  };

  // computes the integer part of the log base 2 of the argument,
  // always rounding the log down.  Assume value is positive.
  HeatMap.prototype.logBase2 = function (value) {
    var rv = 0;
    value >>= 1;

    while (value > 0) {
      value >>= 1;
      rv++;
    }
    return rv;
  };
   
  // compute the zoom based on the bounding box and the actual window size
  HeatMap.prototype.computeZoom = function () {
    this.getMapSize();
    var _zoom;

    var minSize = -1;
    if (_boundingBoxHeight != 0) {
      minSize = ((height - _margin*2)<< MAX_ZOOM) / _boundingBoxHeight;
    }
    if (_boundingBoxWidth != 0) {
      var lngSize = ((width - _margin*2)<< MAX_ZOOM) / _boundingBoxWidth;
      minSize = (_boundingBoxHeight != 0) ? Math.min(minSize, lngSize) : lngSize;
    }
    _zoom = (minSize != -1) ? this.logBase2(minSize) : 0;
    if (_zoom > MAX_ZOOM)
      _zoom = MAX_ZOOM;

    return _zoom;
  };

  HeatMap.prototype.clearSelection = function () {
    this.setSelectionMessage(" ");
    this.removeSelectionGraphic();
  };

  // round a number to 5 decimal places
  HeatMap.prototype.digits5 = function (x) {
    return Math.round(x*100000)/100000;
  };

  // find a document element using a suffix of its id
  HeatMap.prototype.findByIDSuffix = function (idSuffix) {
    var elements = window.parent.document.getElementsByTagName("*");
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var index = element.id.indexOf(idSuffix);
      if (index != -1 && index + idSuffix.length == element.id.length) {
        return element;  // assume there's only one match
      }
    }
    return null;
  };

  // put the selection message text on the screen, refresh the page if not just clearing the field
  HeatMap.prototype.setSelectionMessage = function (responseText) {
    if (messageElement != null)
      messageElement.innerHTML = responseText;
    if (refreshUponSelection && responseText != " ")
      heatMap.refreshPage();
  };

  HeatMap.prototype.setCursor = function () {
    document.getElementById("mapDiv").style.cursor =
      (true) ? "default" : "url(http://ecn.dev.virtualearth.net/mapcontrol/v6.3/cursors/grab.cur), move"
  };

  var startLL;
  var currentLL;
  var selecting = false;
  var mouseDown;

  HeatMap.prototype.mouseEventHandler = function (e) { return heatMap.mouseEventHandler2(e); };
  
  HeatMap.prototype.mouseEventHandler2 = function (e) {
    var event = e.eventName;

    if (event == "onmousedown") {
      mouseDown = true;
      if (e.ctrlKey || e.altKey || e.rightMouseButton)
        return false;   // don't catch, ctrl-Click-drag in Bing is zoom

      this.setCursor();
      if (e.shiftKey) {
        // start a selection
        this.clearSelection();
        currentLL = startLL = this.getLL(e.mapX, e.mapY);
        selecting = true;
        return true;  // consume the event
      } else {
        // tooltip
        ttMouseDownPosition = e;
        this.clearToolTip();
        if (!fetchingTooltip && !e.shiftKey && !e.ctrlKey) {
          fetchingTooltip = true;
          this.fetchTip();
        }
      }
    } else if (event == "onmouseup") {
      mouseDown = false;
    }

    if (event == "onmousemove" && !(mouseDown || e.ctrlKey || e.altKey || e.shiftKey)) {
      this.setCursor();
      return true;  // consume the event
    }

    if (!selecting)
      return false;  // not selecting - don't catch

    if (event == "onmouseup") {
      var firstLat = startLL.Latitude
      var firstLong = startLL.Longitude
      var secondLat = currentLL.Latitude
      var secondLong = currentLL.Longitude

      // always send top left as the first point and bottom right as the second point no matter
      // which corners were entered or their order
      if (firstLat < secondLat) {
        firstLat = currentLL.Latitude;
        secondLat = startLL.Latitude;
      }
      if (firstLong > secondLong) {
        firstLong = currentLL.Longitude;
        secondLong = startLL.Longitude;
      }
      this.postToServer("?point1Lat=" + this.digits5(firstLat) + "&point1Lng=" + this.digits5(firstLong) +
                        "&point2Lat=" + this.digits5(secondLat) + "&point2Lng=" + this.digits5(secondLong),
                        this.setSelectionMessage);
      selecting = false;

    } else if (event == "onmousemove") {
      if (selecting) {
        currentLL = this.getLL(e.mapX, e.mapY);
        this.clearSelection();
        this.drawSelectionRectangle(startLL, currentLL);
      }

    }
    return true; // suppress further processing
  };

  HeatMap.prototype.mapNKeyEventHandler = function (e) { return heatMap.mapNKeyEventHandler2(e); };
    
  HeatMap.prototype.mapNKeyEventHandler2 = function (e) {
    var event = e.eventName;
    if (event == "onendzoom") {
      this.updateZoom(e.zoomLevel);
      this.updateCenter();  // needed to make control-click-drag work correctly (Bing doesn't report a pan event with the zoom
                       // even though the center may be changed)
    } else if (event == "onendpan") {
      this.updateCenter();
    } else if (event == "onstartzoom" || event == "onstartpan") {
      this.clearToolTip();
    } else if (event == "onkeypress") {
      if (e.keyCode == 27) { // Escape key
        this.clearToolTip();
        return true;
      }
    }
  };

  HeatMap.prototype.updateZoom = function (zoom) {
    this.postToServer("?zoomLevel=" + zoom);
  };

  HeatMap.prototype.updateCenter = function () {
    var center = map.GetCenter();
    this.postToServer("?centerLat=" + this.digits5(center.Latitude) + "&centerLng=" + this.digits5(center.Longitude));
  };

  HeatMap.prototype.getMapSize = function () {
    var bboxElement = window.parent.document.getElementById("mapFrame");
    if (bboxElement == null)
      bboxElement = window.document.documentElement;
    var bbox = bboxElement.getBoundingClientRect();
    height = bbox.bottom - bbox.top;
    width = bbox.right - bbox.left;

    if (haveLegendImage) {
      var legendBBox = document.getElementById("legendImg").getBoundingClientRect();
      width -= legendBBox.right - legendBBox.left;
    }
  };

  HeatMap.prototype.onResize = function () {
    heatMap.getMapSize();
    document.getElementById("mapDiv").style.height = height + "px";
  };
  
  // create and send new async POST
  HeatMap.prototype.postToServer = function (urlParmString, callback) {
    var request = new XMLHttpRequest(); // or use AJAXImpl_createXMLHttpRequest for IE6
    request.open("POST", url + urlParmString + "&mapName=" + mapName);

    // callback function
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        if (callback != null)
          callback(request.responseText);
//          console.log("got reply: " + request.responseText);
      }
    };

    request.send(".");
  };

  // refresh the page
  HeatMap.prototype.refreshPage = function () {
    window.parent.gw.app.refresh();
  };
  

  // Tooltip support
  var fetchingTooltip;
  var ttMouseDownPosition;
  var ttLatLong;
  var ttCursorAdj = 2; // cursor click point adjustment
  var ttControl, ttLine;
  var ttLineColor = new VEColor(0, 0, 0, 1);

  // request the tooltip
  HeatMap.prototype.fetchTip = function() {
    ttLatLong = map.PixelToLatLong(new VEPixel(this.clip(ttMouseDownPosition.mapX - ttCursorAdj, 0, width-1),
                                               this.clip(ttMouseDownPosition.mapY - ttCursorAdj, 0, height-1)));
    this.postToServer("?ttLat=" + this.digits5(ttLatLong.Latitude) + "&ttLng=" + this.digits5(ttLatLong.Longitude), this.showToolTip);
  };

  HeatMap.prototype.clearToolTip = function() {
    if (ttControl != null) {
      map.DeleteControl(ttControl);
      map.DeleteShape(ttLine);
      ttControl = null;
    }
  };

  // show the tooltip
  HeatMap.prototype.showToolTip = function(msg) {
    heatMap.setCursor();
    fetchingTooltip = false;
    if (msg != "") {
      var comma = msg.indexOf(","), bar = msg.indexOf("|");
      var positionLL;
      if (bar > 0) {
        var lat = msg.substring(0, comma);
        var lng = msg.substring(comma+1, bar);
        positionLL = new VELatLong(lat, lng);
      } else {
        positionLL = ttLatLong;
      }
      msg = msg.substring(bar+1);
      var el = document.createElement("div");
      el.style.background = "#fffec1";
      el.style.padding = "5px";
      el.style.fontFamily = "Verdana,Arial,Helvetica,sans-serif";  // todo: reference CSS
      el.style.fontSize = "12.8px";
      el.style.border = "1px solid #ababab";
      heatMap.setOpacity(el, 1);
      el.style.cursor = "default";
      el.innerHTML = msg;
      map.AddControl(el);
      heatMap.positionToolTip(el, positionLL);
      ttControl = el;
    }
  };

  // position the tooltip and draw a line to the point that was clicked
  HeatMap.prototype.positionToolTip = function(el, positionLL) {
    var pixelPos = map.LatLongToPixel(positionLL);
    var xPos = pixelPos.x, yPos = pixelPos.y;
    var delta = 20;
    var tipHeight = el.offsetHeight;
    var tipWidth = el.offsetWidth;
    var vertical;
    var xTipPos = pixelPos.x, yTipPos = pixelPos.y;
    var xMarker = xPos, yMarker = yPos;
    var markerAdj = markerSize/2;

    if (tipHeight + delta < yPos) {
      yTipPos -= tipHeight + delta;  // above
      yMarker -= markerAdj;
      vertical = true;
    } else if (yPos + tipHeight + delta < height) {
      yTipPos += delta;  // below
      yMarker += markerAdj;
      vertical = true;
    } else if (tipWidth + delta < xPos) {
      xTipPos -= tipWidth + delta;   // left
      xMarker -= markerAdj;
    } else if (xPos + tipHeight + delta < width) {
      xTipPos += delta;   // right
      yMarker += markerAdj;
    } else {
      yTipPos = 0;                   // give up, go for upper left corner
      vertical = true;
    }

    if (vertical) {
      xTipPos = this.tryToCenter(tipWidth, xPos, width);
    } else {
      yTipPos = this.tryToCenter(tipHeight, yPos, height);
    }
    el.style.left = xTipPos + "px";
    el.style.top = yTipPos + "px";

    // and draw a line from the point to the center
     var linePoints = [
       this.getLL(xMarker, yMarker),
       this.getLL(xTipPos + tipWidth/2, yTipPos + tipHeight/2)
     ];
     var line = new VEShape(VEShapeType.Polyline, linePoints);
     line.SetLineWidth(2);
     line.SetLineColor(ttLineColor);
     line.HideIcon();
     line.SetZIndex(null, 60);
     map.AddShape(line);
     ttLine = line;
  };

  // returns the left/top position for the tooltip for vertical/horizontal placement
  HeatMap.prototype.tryToCenter = function(tipSize, mousePos, mapSize)  {
    var okLeft = mousePos > tipSize/2;
    var okRight = mousePos + tipSize/2 < mapSize;

    if (tipSize > mapSize || !okLeft) {
      return 0;
    } else if (okRight) { // both OK
      return mousePos - tipSize/2;
    } else { // left OK
      return mapSize - tipSize;
    }
  };

  var heatMap = new HeatMap();
