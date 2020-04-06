package gw.web.policy

@Export
class LocationDisplayUtil {

  private construct() {
  }

  static function getLimitedNumberOfSortedLocations(locs : AccountLocation[], line : PolicyLine, numberOfLocations : int) : AccountLocation[] {
    var sortedLocs = locs.toList()
    if (not line.SupportsNonSpecificLocations) {
      sortedLocs = sortedLocs.where(\ l -> not l.NonSpecific)
    }
    sortedLocs = sortedLocs.sortBy(\ acctLoc -> acctLoc.LocationNum)
    if (sortedLocs.Count > numberOfLocations) {
      sortedLocs = sortedLocs.subList(0, numberOfLocations)
    }
    return sortedLocs.toTypedArray()
  }
}