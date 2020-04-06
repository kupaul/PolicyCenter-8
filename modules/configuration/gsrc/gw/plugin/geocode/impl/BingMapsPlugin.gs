package gw.plugin.geocode.impl

uses java.lang.Exception
uses java.lang.StringBuilder
uses java.util.Map
uses java.util.regex.Pattern

uses gw.api.contact.DrivingDirections
uses gw.api.contact.MapImageUrl
uses gw.api.geocode.AbstractGeocodePlugin
uses gw.api.system.PLLoggerCategory
uses gw.plugin.InitializablePlugin

uses wsi.remote.microsoft.bingmaps.geocodeservice.ports.GeocodeService_BasicHttpBinding_IGeocodeService
uses wsi.remote.microsoft.bingmaps.geocodeservice_xsd.anonymous.elements.Geocode_Request
uses wsi.remote.microsoft.bingmaps.geocodeservice_xsd.Geocode
uses wsi.remote.microsoft.bingmaps.geocodeservice1_xsd.GeocodeResult
uses wsi.remote.microsoft.bingmaps.routeservice.ports.RouteService_BasicHttpBinding_IRouteService
uses wsi.remote.microsoft.bingmaps.routeservice_xsd.UserProfile
uses wsi.remote.microsoft.bingmaps.routeservice_xsd.enums.DistanceUnit
uses wsi.remote.microsoft.bingmaps.routeservice2.anonymous.elements.CalculateRoute_Request
uses wsi.remote.microsoft.bingmaps.routeservice3.anonymous.elements.RouteRequest_Waypoints
uses wsi.remote.microsoft.bingmaps.routeservice2.CalculateRoute
uses wsi.remote.microsoft.bingmaps.routeservice2.CalculateRouteResponse
uses wsi.remote.microsoft.bingmaps.routeservice3.anonymous.elements.Waypoint_Location
uses wsi.remote.microsoft.bingmaps.routeservice3.Waypoint
uses wsi.remote.microsoft.CultureCodes
uses java.util.Locale
uses gw.api.database.spatial.SpatialPoint

@Export
class BingMapsPlugin extends AbstractGeocodePlugin implements InitializablePlugin {
  
  // application key
  private static final var APPLICATION_KEY = "applicationKey"
  private static var _applicationKey : String

  // culture
  private static final var GEOCODE_DIRECTIONS_CULTURE = "geocodeDirectionsCulture"
  private static var _mapping = new CultureCodes()
  private static var javaLocale = Locale.getDefault()
  private static final var IMAGERY_CULTURE = "imageryCulture"
  private static var _geocodeDirectionsCulture : String = _mapping.LocCodes.get(javaLocale)
  private static var _imageryCulture : String = _mapping.ImageCodes.get(javaLocale)
  
  // map url
  private static final var MAP_URL_WIDTH = "mapUrlWidth"
  private static var _mapUrlWidth : String = "500"
  private static final var MAP_URL_HEIGHT = "mapUrlHeight"
  private static var _mapUrlHeight : String = "500"
  
  // regex for markup tags
  private static final var REGEX_MARKUP_TAG = Pattern.compile( "<[^>]*>" )

  override public function setParameters( parameters : Map<Object,Object> ) {
    _applicationKey = initParameter( parameters, APPLICATION_KEY, _applicationKey, true )
    
    _geocodeDirectionsCulture = initParameter( parameters, GEOCODE_DIRECTIONS_CULTURE, 
      _geocodeDirectionsCulture == null ? "en-US" : _geocodeDirectionsCulture, false )
    _imageryCulture = initParameter( parameters, IMAGERY_CULTURE, 
      _imageryCulture == null ? "en-US" : _imageryCulture, false )
    
    _mapUrlWidth = initParameter( parameters, MAP_URL_WIDTH, _mapUrlWidth, false )
    _mapUrlHeight = initParameter( parameters, MAP_URL_HEIGHT, _mapUrlHeight, false )
  }

  override protected function _geocodeAddressBestMatch( address : Address ) : Address {
    // create request
    var geocode = new Geocode()    
    var geocodeRequest = createGeocodeRequest( address )
    logXmlForDebug( "Geocode Request", geocodeRequest.asUTFString() )
    
    // make request
    geocode.Request = geocodeRequest
    var geocodeService = new GeocodeService_BasicHttpBinding_IGeocodeService()
    var geocodeResponse = geocodeService.Geocode( geocode )
    logXmlForDebug( "Geocode Response", geocodeResponse.asUTFString() )
    
    // convert response into an address to return
    var returnAddress = new Address()
    var geocodeResultList = geocodeResponse.GeocodeResult.Results.GeocodeResult
    if ( geocodeResultList.Empty ) {
      returnAddress.GeocodeStatus = GeocodeStatus.TC_FAILURE;
    } else {
      returnAddress = extractAddressFromBingMapsGeocodeResult( geocodeResultList.get( 0 ) ) 
    }
    
    return returnAddress
  }
  
  override protected function _getDrivingDirections( startAddress : Address, finishAddress : Address, unit : UnitOfDistance ) : DrivingDirections {
    var startLatLong = getLatLongFromAddress( startAddress )
    var finishLatLong = getLatLongFromAddress( finishAddress )
    
    // create request
    var calculateRoute = new CalculateRoute()
    var calculateRouteRequest = createCalculateRouteRequest( startLatLong, finishLatLong, unit )
    logXmlForDebug( "Route Request", calculateRouteRequest.asUTFString() )
    
    // make request
    calculateRoute.Request = calculateRouteRequest
    var routeService = new RouteService_BasicHttpBinding_IRouteService()
    var calculateRouteResponse = routeService.CalculateRoute( calculateRoute )
    logXmlForDebug( "Route Response", calculateRouteResponse.asUTFString() )
    
    // convert response into driving directions to return
    var drivingDirections = extractDrivingDirectionsFromBingMapsCalculateRouteResponse( calculateRouteResponse, startAddress, finishAddress, unit )
    
    // set driving directions map overview url
    setMapOverviewUrlForDrivingDirections( drivingDirections, startLatLong, finishLatLong )
    
    return drivingDirections
  }
  
  override public function getMapForAddress( address : Address, unit : UnitOfDistance ) : MapImageUrl {
    address = tryGetValidAddress( address )
    if ( !isValidLatLong( address ) ) {
      return null
    }
    
    var centerPoint = getPoint( getLatLongFromAddress( address ) )
    // zoom level is required: 1 - 22 
    var zoomLevel = "15"
    var mapUrl = getBingMapsImageryRESTUrl( centerPoint + "/" + zoomLevel )
    
    // pushpin
    // syntax: pp=latitude,longitude;iconStyle;label
    var iconStyle = "15"
    mapUrl += "&pp=" + centerPoint + ";" + iconStyle
    
    var mapImageUrl = new MapImageUrl()
    mapImageUrl.MapImageUrl = mapUrl
     
    return mapImageUrl
  }
  
  private function initParameter( parameters : Map<Object,Object>, parameterKey : String, initialParameterValue : String, requiredParameter : boolean ) : String {
    var parameterValue = parameters.get( parameterKey ) as String

    if ( parameterValue == null || parameterValue.trim().Empty ) {
      if ( requiredParameter ) {
        throw new Exception( "You must supply a value for the \"" + parameterKey + "\" parameter in GeocodePlugin.xml" )
      } else {
        parameterValue = initialParameterValue
      }
    }

    return parameterValue    
  }
  
  private function createGeocodeRequest( address : Address ) : Geocode_Request {
    var geocodeRequest = new Geocode_Request()
    geocodeRequest.Credentials.ApplicationId = _applicationKey
    var localLocale = User.util.CurrentLocale.JavaLocale
    var localCulture = _mapping.LocCodes.get(localLocale)
    geocodeRequest.Culture = localCulture == null ? _geocodeDirectionsCulture : localCulture
    geocodeRequest.Query = createQuery( address )
    return geocodeRequest
  }

  private function createQuery( address : Address ) : String {
    var query = new StringBuilder()
    
    appendtoQuery( query, address.AddressLine1, false )
    appendtoQuery( query, address.AddressLine2, true )
    appendtoQuery( query, address.AddressLine3, true )
    
    appendtoQuery( query, address.City, true )
    appendtoQuery( query, address.County, true )
    appendtoQuery( query, address.State.Code, true )
    appendtoQuery( query, address.PostalCode, false )
    appendtoQuery( query, address.Country.Code, true )
    
    return query.toString()
  }
  
  private function appendtoQuery( query : StringBuilder, addressAttribute : String, prependComma : boolean ) : void { 
    if ( addressAttribute != null ) {
      addressAttribute = addressAttribute.trim()
      if ( !addressAttribute.Empty ) {
        if ( query.length() > 0 && prependComma ) {
          query.append( "," )
        }
        addressAttribute = ( query.length() > 0 ? " " : "" ) + addressAttribute
        
        query.append( addressAttribute )
      }
    }
  }
  
  private function logXmlForDebug( label : String, xml : String ) {
    PLLoggerCategory.GEODATA.debug( "\n" + label + ":\n" + xml )
  }
  
  private function extractAddressFromBingMapsGeocodeResult( geocodeResult : GeocodeResult ) : Address {
    var address = new Address()
    
    var bingMapsAddress = geocodeResult.Address
    address.AddressLine1 = bingMapsAddress.AddressLine
    address.City = bingMapsAddress.Locality
    address.State = getStateByNameOrCode( bingMapsAddress.AdminDistrict )
    address.PostalCode = bingMapsAddress.PostalCode
    address.Country = getCountryTypeCodeByName( bingMapsAddress.CountryRegion )
    
    // get the first location from the list
    var location = geocodeResult.Locations.GeocodeLocation.get(0)
    
    address.SpatialPoint = new SpatialPoint(location.Longitude, location.Latitude)
    
    // confidence can be "High", "Medium". or "Low"
    var confidence = geocodeResult.Confidence.SerializedValue
    if ( confidence == "High" ) {
      address.GeocodeStatus = GeocodeStatus.TC_EXACT
    } else if ( confidence == "Medium" ) {
      address.GeocodeStatus = GeocodeStatus.TC_POSTALCODE
    } else {
      address.GeocodeStatus = GeocodeStatus.TC_CITY      
    }
    
    return address
  }
  
  private function createCalculateRouteRequest( startLatLong : AbstractGeocodePlugin.LatLong, finishLatLong : AbstractGeocodePlugin.LatLong, unit : UnitOfDistance ) : CalculateRoute_Request {
    var calculateRouteRequest = new CalculateRoute_Request()
    
    // set credentials
    calculateRouteRequest.Credentials.ApplicationId = _applicationKey  
    
    // set culture
    var localLocale = User.util.CurrentLocale.JavaLocale
    var localCulture = _mapping.LocCodes.get(localLocale)
    calculateRouteRequest.Culture = localCulture == null ? _geocodeDirectionsCulture : localCulture
    
    // set waypoints
    calculateRouteRequest.Waypoints = new RouteRequest_Waypoints()
    
    var startWaypoint = new Waypoint()    
    startWaypoint.Location = new Waypoint_Location()
    startWaypoint.Location.Latitude = startLatLong._latitude as double
    startWaypoint.Location.Longitude = startLatLong._longitude as double
    calculateRouteRequest.Waypoints.Waypoint.add( startWaypoint )
    
    var endWaypoint = new Waypoint()
    endWaypoint.Location = new Waypoint_Location()
    endWaypoint.Location.Latitude = finishLatLong._latitude as double
    endWaypoint.Location.Longitude = finishLatLong._longitude as double
    calculateRouteRequest.Waypoints.Waypoint.add( endWaypoint )
    
    // set options 
    calculateRouteRequest.UserProfile = createUserProfile( unit )
    
    return calculateRouteRequest
  }
  
  private function createUserProfile( unit : UnitOfDistance ) : UserProfile {
    var userProfile = new UserProfile()
    userProfile.DistanceUnit = unit == UnitOfDistance.TC_MILE ? DistanceUnit.Mile : DistanceUnit.Kilometer
    
    return userProfile
  }
  
  private function extractDrivingDirectionsFromBingMapsCalculateRouteResponse( calculateRouteResponse : CalculateRouteResponse, startAddress : Address, finishAddress : Address, unit : UnitOfDistance ) : DrivingDirections {
    var drivingDirections = DrivingDirections.createPreparedDrivingDirections( startAddress, finishAddress, unit )
    var result = calculateRouteResponse.CalculateRouteResult.Result
    var calcTotalTime : java.math.BigDecimal = 0
    var calcTotalDistance : java.math.BigDecimal = 0

    var routeLegs = result.Legs.RouteLeg
    for ( var routeLeg in routeLegs ) {
      var itineraryItems = routeLeg.Itinerary.ItineraryItem
      for ( var itineraryItem in itineraryItems ) {
        var itineraryItemSummary = itineraryItem.Summary
        calcTotalTime += itineraryItemSummary.TimeInSeconds
        calcTotalDistance += itineraryItemSummary.Distance
        var instruction = removeVirtualEarthMarkupTags( itineraryItem.Text )
        drivingDirections.addNewElement( formatDrivingInstruction( instruction ), itineraryItemSummary.Distance, itineraryItemSummary.TimeInSeconds as java.lang.Integer )
      }
    }
    drivingDirections.TotalDistance = calcTotalDistance
    drivingDirections.TotalTime = calcTotalTime
    return drivingDirections
  }
  
  private function removeVirtualEarthMarkupTags( itineraryItemText : String ) : String {
    final var matcher = REGEX_MARKUP_TAG.matcher( itineraryItemText )
    return matcher.replaceAll("")
  }
  
  private function setMapOverviewUrlForDrivingDirections( drivingDirections : DrivingDirections, startLatLong : AbstractGeocodePlugin.LatLong, finishLatLong : AbstractGeocodePlugin.LatLong ) : void {
    var mapOverviewUrl = getBingMapsImageryRESTUrl( "Routes" )
    
    // set waypoint params
    mapOverviewUrl += "&wp.0=" + getPoint( startLatLong )
    mapOverviewUrl += "&wp.1=" + getPoint( finishLatLong )
    
    drivingDirections.setMapOverviewUrl( mapOverviewUrl )
  }
  
  private function getBingMapsImageryRESTUrl( RESTEntryPoint : String ) : String {
    var bingMapsImageryRESTUrl = "http://dev.virtualearth.net/REST/v1/Imagery/Map/Road/" + RESTEntryPoint
    
    // set application key
    bingMapsImageryRESTUrl += "?key=" + _applicationKey
    // set culture
    var localLocale = User.util.CurrentLocale.JavaLocale
    var localCulture = _mapping.ImageCodes.get(localLocale)
    bingMapsImageryRESTUrl += "&c=" + (localCulture == null ? _imageryCulture : localCulture)
    // set map size in pixels
     bingMapsImageryRESTUrl += "&mapSize=" + _mapUrlWidth + "," + _mapUrlHeight
    
    return bingMapsImageryRESTUrl
  }
  
  private function getPoint( latLong : AbstractGeocodePlugin.LatLong ) : String {
    return latLong._latitude + "," + latLong._longitude
  }
  
  override public function pluginSupportsDrivingDirections() : boolean {
    return true
  }

  override public function pluginReturnsOverviewMapWithDrivingDirections() : boolean {
    return true
  }

}
