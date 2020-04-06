package gw.policylocation

uses gw.api.database.Query
uses java.math.BigDecimal
uses gw.api.database.Relop
uses java.util.ArrayList
uses java.lang.IllegalArgumentException
uses gw.api.database.IQueryBeanResult
uses java.lang.Math
uses gw.search.EntitySearchCriteria
uses gw.api.database.spatial.SpatialPolygon
uses gw.api.database.spatial.SpatialPoint

@Export
class PolicyLocationBoundingBoxSearchCriteria extends EntitySearchCriteria<PolicyLocation> {

  var _topLeftLat : BigDecimal as TopLeftLatitude
  var _topLeftLong : BigDecimal as TopLeftLongtitude
  var _bottomRightLat : BigDecimal as BottomRightLatitude
  var _bottomRightLong : BigDecimal as BottomRightLongtitude
  var _effDate : DateTime as EffectiveDate
  var _productCodes : ArrayList as ProductCodes
  
  construct() {
    TopLeftLatitude = 0
    TopLeftLongtitude = 0
    BottomRightLatitude = 0
    BottomRightLongtitude = 0
    EffectiveDate = DateTime.CurrentDate
    ProductCodes = {"BusinessOwners", "PersonalAuto"}
  }

  function prepareQuery() : Query<PolicyLocation> {
    var query = Query.make(PolicyLocation)
    
    // Filter by effective date, array of product codes and bounded policies
    addPolicyAndPolicyPeriodRestrictions(query, this.EffectiveDate, this.ProductCodes)
    
    if (!checkLatLongPairIsValid(TopLeftLatitude, TopLeftLongtitude) 
            || !checkLatLongPairIsValid(BottomRightLatitude, BottomRightLongtitude)){
        throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.IncorrectLatLongValue)
    }

    if (!checkBoundingBoxValid(TopLeftLatitude, TopLeftLongtitude, BottomRightLatitude, BottomRightLongtitude)) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.IncorrectBoundingBox)
    }
    
    return query
  }
  

  override protected function doSearch() : IQueryBeanResult<PolicyLocation>  {
    // resolved conflict: next 2 lines are from the app team
    print("bounding box: ${TopLeftLatitude}, ${TopLeftLongtitude}, ${BottomRightLatitude}, ${BottomRightLongtitude}")
    var rectangle = SpatialPolygon.createRectangle(new SpatialPoint(TopLeftLongtitude, TopLeftLatitude), new SpatialPoint(BottomRightLongtitude, BottomRightLatitude))
    var q = prepareQuery()
    var accountLocation = q.join("AccountLocation")
    q.withinPolygon(accountLocation.getColumnRef("SpatialPoint"), "PolicyLocation.AccountLocation.SpatialPoint", true, rectangle)
    return q.select()
  }


  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  
  private function addPolicyAndPolicyPeriodRestrictions(query : Query<PolicyLocation>, effDate : DateTime, prodCodes : ArrayList) {
      var periodTable = query.join("BranchValue")
      periodTable.and(\ andRes -> {
        andRes.compare("PeriodStart", Relop.LessThanOrEquals, effDate.addMinutes(1)) // Must be effective
        andRes.compare("PeriodEnd", Relop.GreaterThan, effDate.addMinutes(1))
        andRes.compare("ModelNumber", Relop.NotEquals, null)  // Bound
        andRes.compare("MostRecentModel", Relop.Equals, true) // In Force
        andRes.or(\ orRes -> {
          orRes.compare("CancellationDate", Relop.Equals, null)
          orRes.compare("CancellationDate", Relop.GreaterThan, effDate.addMinutes(1))
        })
      })
    
      var policyTable = periodTable.join("Policy")
      policyTable.compareIn("ProductCode", prodCodes as java.lang.Object[]) 

  }
 
  private function checkLatLongPairIsValid(lat : BigDecimal, long : BigDecimal) : boolean {  
    if (lat < -90 || lat > 90 || long < -180 || long > 180){
      return false
    }
    
    return true
  }

  /**
   * Check to insure that the north latitude is greater than the south latitude.
   * Check that the size of the box is a reasonable size
   */
  private function checkBoundingBoxValid (lat1 : BigDecimal, long1 : BigDecimal,
                      lat2 : BigDecimal, long2 : BigDecimal) : boolean {
                        
    var result = true
    var earthRadius = 3958.75
    var quarterEarth = (earthRadius * 2 * Math.PI ) / 4   
    
    var sizeOfBox = distFrom(lat1, long1, lat2, long2)
    
    if (sizeOfBox > quarterEarth ) {
      result = false
    }
    
    if (lat1 < lat2) {
      result = false
    }
    
    return result
  }

  public function  distFrom( lat1 : BigDecimal,  lng1 : BigDecimal,  lat2 : BigDecimal,  lng2 : BigDecimal) : BigDecimal {

    var earthRadius = 3958.75;
    
    var dLat = Math.toRadians((lat2-lat1) as double);
    var dLng = Math.toRadians((lng2-lng1) as double);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(Math.toRadians(lat1 as double)) * Math.cos(Math.toRadians(lat2 as double)) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var dist = earthRadius * c;

    return dist;
  }


  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
