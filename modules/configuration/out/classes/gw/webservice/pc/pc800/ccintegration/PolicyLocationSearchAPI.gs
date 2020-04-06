package gw.webservice.pc.pc800.ccintegration

uses com.google.common.base.Optional
uses com.google.common.base.Ticker
uses com.google.common.cache.CacheBuilder
uses com.google.common.cache.CacheLoader
uses com.google.common.cache.LoadingCache
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.policylocation.PolicyLocationBoundingBoxSearchCriteria
uses gw.util.concurrent.LockingLazyVar
uses gw.webservice.SOAPUtil
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.PolicyLocationInfo
uses gw.xml.ws.annotation.WsiWebService
uses java.lang.Math
uses java.math.BigDecimal
uses java.util.Arrays
uses java.util.Comparator
uses java.util.Date
uses java.util.concurrent.TimeUnit
uses gw.xml.ws.annotation.WsiPermissions

/**
 * External API for searching for policy locations within PolicyCenter using a geographic bounding box.
 *
 * Because there can be many results returned for a given bounding box, PolicyCenter maintains
 * an in-memory cache of search results accessed through this API, thus allowing API clients
 * to make repeated calls to retrieve blocks of data (within the same bounding box) without
 * triggering multiple expensive database transactions on the PolicyCenter server.
 *
 * Also, the search results will "time out" forom the cache after 20 minutes, so API clients
 * executing an expensive search should retrieve the results in a timely fashion after the
 * first call to findPolicyLocationsWithinBoundingBox().
 */
@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/ccintegration/PolicyLocationSearchAPI" )
@Export
class PolicyLocationSearchAPI {
  public final static var CACHE_TIMEOUT_IN_MINUTES : long = 20
  public final static var INITIAL_CAPACITY : int = 1000

  static var _ticker : Ticker = null

  // Create a results cache with a timeout. Lazy var to give tests a chance to change the Ticker implementation.
  final static var _lazyCache = new LockingLazyVar<LoadingCache<Object, Optional<PolicyLocationInfo[]>>>(){
    override function init() : LoadingCache<Object, Optional<PolicyLocationInfo[]>> {
      return CacheBuilder.newBuilder()
          .concurrencyLevel(1)
          .weakValues()
          .expireAfterWrite(CACHE_TIMEOUT_IN_MINUTES, TimeUnit.MINUTES)
          .initialCapacity(INITIAL_CAPACITY)
          .ticker(_ticker ?: Ticker.systemTicker())
          .build(new CacheLoader<Object, Optional<PolicyLocationInfo[]>>() {
            override function load(key : Object) : Optional<PolicyLocationInfo[]> {
              return Optional.fromNullable<PolicyLocationInfo[]>(null)
            }
          })
        }}

  static function overrideCacheTickerForTesting(t : Ticker) {
    _lazyCache.clear()
    _ticker = t
  }

  /**
   * This method performs the search against policy locations stored
   * in PolicyCenter. It returns a list of summary objects found within the bounding box.
   *
   * Warning: There may be a potential performance drag with a large bounding box.
   * Warning: This class is not thread safe
   *
   * @param effDate A date on which the policy to find is in effect.
   * @param productCodes An array of policy product codes
   * @param topLeftLat A number representing the bounding box top left latitude coordinate
   * @param topLeftLong A number representing the bounding box top left longitude coordinate
   * @param bottomRightLat A number representing the bounding box bottom right latitude coordinate
   * @param bottomRightLong A number representing the bounding box bottom right longitude coordinate
   * @param refCon A string that uniquely identifies this search; can be used later to reset the cached version of this search.
   * @param start The first record returned = 0 is the first record
   * @param count The maximum number of records to return. If you pass 2, you get x[0], x[1]
   *
   * @return An array of PolicyLocationInfo objects, or null if no policy locations found.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("effDate", "A date on which the policy to find is in effect.")
  @Param("productCodes", "An array of policy product codes")
  @Param("topLeftLat", "A number representing the bounding box top left latitude coordinate")
  @Param("topLeftLong", "A number representing the bounding box top left longitude coordinate")
  @Param("bottomRightLat", "A number representing the bounding box bottom right latitude coordinate")
  @Param("bottomRightLong", "A number representing the bounding box bottom right longitude coordinate")
  @Param("refCon", "A string that uniquely identifies this search; can be used later to reset the cached version of this search.")
  @Param("start", "The first record returned = 0 is the first record")
  @Param("count", "The maximum number of records to return. If you pass 2, you get x[0], x[1]")
  @WsiPermissions({SystemPermissionType.TC_PFILEDETAILS})
  @Returns("An array of PolicyLocationInfo objects")
  function findPolicyLocationsWithinBoundingBox(effDate : Date, productCodes : String[],
                      topLeftLat : BigDecimal, topLeftLong : BigDecimal,
                      bottomRightLat : BigDecimal, bottomRightLong : BigDecimal,
                      refCon : String, start : int, count : int ) : PolicyLocationInfo[] {
    SOAPUtil.require(effDate, "effDate")
    SOAPUtil.require(productCodes, "productCodes")
    SOAPUtil.require(topLeftLat, "topLeftLat")
    SOAPUtil.require(topLeftLong, "topLeftLong")
    SOAPUtil.require(bottomRightLat, "bottomRightLat")
    SOAPUtil.require(bottomRightLong, "bottomRightLong")
    SOAPUtil.require(refCon, "reference")
    SOAPUtil.require(start, "start")
    SOAPUtil.require(count, "count")

    // Insure that the count and start are in bounds
    //  Must ask for 1 or more records
    //  Must ask for records starting at 0
    if ( ( count <= 0 ) || ( start < 0 ) ) {
      return null
    }

    var resultsCache = _lazyCache.get()
   // Check to see if we have already retreived these results
   var results = resultsCache.get(refCon).orNull()

   if (results == null) {
     var criteria = new PolicyLocationBoundingBoxSearchCriteria()
     criteria.EffectiveDate = effDate
     criteria.ProductCodes = productCodes as java.util.ArrayList<String>
     criteria.TopLeftLatitude = topLeftLat
     criteria.TopLeftLongtitude = topLeftLong
     criteria.BottomRightLatitude = bottomRightLat
     criteria.BottomRightLongtitude = bottomRightLong

     var queryResults = criteria.performSearch()

      if (queryResults.Empty) {
        return null
      }

      results = queryResults.map(\ p -> {
        var info = new PolicyLocationInfo()
        info.configure(p)
        return info
      }) as PolicyLocationInfo[]

      var comparator = new Comparator() {
        override function compare(obj1 : Object, obj2 : Object) : int {
          if (obj1 typeis PolicyLocationInfo and obj2 typeis PolicyLocationInfo) {
            var c1 = obj1.PolicyNumber.compareTo(obj2.PolicyNumber)
            return c1 != 0
                   ? c1
                   : obj1.PolicyLocationPolicySystemID.compareTo(obj2.PolicyLocationPolicySystemID)
          }
          return 0  //shouldn't happen
        }
      }

      Arrays.sort(results, comparator)

      resultsCache.asMap().put(refCon, Optional.of(results))
    }

    var sizedResultsArray : PolicyLocationInfo[]= null

    // Insure that we bounds restrict the result size
    var numberOfRecords = Math.max(0, Math.min(count, results.length-start))
    if (0 != numberOfRecords ) {
      sizedResultsArray = new PolicyLocationInfo[numberOfRecords]
      for (i in start..(start+sizedResultsArray.length-1)) {
        sizedResultsArray[i-start] = results[i]
      }
      // If we run out of results, must be returning the last little bit.
      //  remove the cache entry
      if (sizedResultsArray.length < count) {
        resultsCache.asMap().remove(refCon);
      }
    }

    return sizedResultsArray
  }

  /**
   * This method performs the search against policy locations stored
   * in PolicyCenter. It returns a list of all Policy Location objects found within the bounding box.
   * Warning: There may be a potential performance drag with a large bounding box.
   *
   * Warning: This method will return ALL results found in the bounding box. We recommend you use
   * the variant with "start" and "count" parameters in order to retrieve partial result sets.
   *
   * @param effDate A date on which the policy to find is in effect.
   * @param productCodes An array of policy product codes
   * @param topLeftLat A number representing the bounding box top left latitude coordinate
   * @param topLeftLong A number representing the bounding box top left longitude coordinate
   * @param bottomRightLat A number representing the bounding box bottom right latitude coordinate
   * @param bottomRightLong A number representing the bounding box bottom right longitude coordinate
   *
   * @return An array of PolicyLocationInfo object, or null if no results found
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_PFILEDETAILS})
  function findPolicyLocationByEffDateAndProductsWithinBoundingBox(effDate : Date, productCodes : String[],
                      topLeftLat : BigDecimal, topLeftLong : BigDecimal, bottomRightLat : BigDecimal, bottomRightLong : BigDecimal) : PolicyLocationInfo[] {
    SOAPUtil.require(effDate, "effDate")
    SOAPUtil.require(productCodes, "productCodes")
    SOAPUtil.require(topLeftLat, "topLeftLat")
    SOAPUtil.require(topLeftLong, "topLeftLong")
    SOAPUtil.require(bottomRightLat, "bottomRightLat")
    SOAPUtil.require(bottomRightLong, "bottomRightLong")

    return findPolicyLocationsWithinBoundingBox(effDate, productCodes
                        , topLeftLat, topLeftLong, bottomRightLat, bottomRightLong
                        , "all", 0, java.lang.Integer.MAX_VALUE)
  }

  /**
   * This method removes the Policy Location Search cache entry for the given reference.
   * Use this method to insure that there are no "leaked" entries in the cache.
   *
   * Warning: removing the cached entry will mean that a subsequent call to findPolicyLocationsWithinBoundingBox()
   * with the same bounding box will be very expensive in terms of performance.
   *
   * @param refCon A string that uniquely identifies the search to cancel
   */
  @Throws(RequiredFieldException, "If the search reference is null")
  @Param("refCon", "The identifier of the search to flush from the cache")
  function cancelFindPolicyLocations(refCon : String) {
    SOAPUtil.require(refCon, "refCon");
    if(isFindPolicyLocationsCached(refCon)) {
      _lazyCache.get().asMap().remove(refCon);
    }
  }

  /**
   * Determines whether the search identified by the supplied reference is still in the in-memory
   * search results cache.
   *
   * @param refCon A string that uniquely identifies these search results. This must match the string that
   * was passed to this API in the findPolicyLocationsWithinBoundingBox() method, or else it will return
   * a false negative.
   * @return True if there is a search in the in-memory cache whose reference ID matches the supplied reference ID.
   **/
  @Throws(RequiredFieldException, "If the search reference is null")
  @Param("refCon", "The identifier of the search result to check for in the cache")
  @Returns("True if there is a search result in the cache matching the supplied reference ID; false otherwise")
  function isFindPolicyLocationsCached(refCon : String) : boolean {
    SOAPUtil.require(refCon, "refCon");
    return (_lazyCache.get().get(refCon).orNull() != null)
  }
}