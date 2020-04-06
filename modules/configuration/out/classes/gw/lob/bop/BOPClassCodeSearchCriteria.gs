package gw.lob.bop

uses gw.api.database.Query
uses gw.lob.AbstractClassCodeSearchCriteria

/**
 * Defines the Business Owners Policy (BOP) line building class code query
 * search criteria utility class.
 *
 * Used to construct queries for the BOP line building class codes.
 */
@Export
class BOPClassCodeSearchCriteria extends AbstractClassCodeSearchCriteria<BOPClassCode> {
  /** The "startsWith" value of the BOP rating engine class group
   *    for the building class codes.
   */
  var _bopLiabClassGrp : String as BOPLiabilityClassGroup
  /** The "startsWith" value of the BOP rating engine number
   *    for the building class codes.
   */
  var _bopPropRateNum : String as BOPPropertyRateNumber
  /** The "contains" value of the classification description
   *    for the BOP line building class codes.
   */
  var _classification : String as Classification
  /** The "contains" value of the class indicator
   *    for the BOP line building class codes.
   */
  var _classIndicator : String as ClassIndicator

  override protected function constructBaseQuery() : Query<BOPClassCode> {
    var query = new Query<BOPClassCode>(BOPClassCode)
    if (Classification != null) {
      addContainsClassificationRestrict(query)
    }
    if (BOPLiabilityClassGroup != null) {
      addStartsWithLiabilityClassGroupRestrict(query)
    }
    if (BOPPropertyRateNumber != null) {
      addStartsWithPropertyRateNumberRestrict(query)
    }
    if (ClassIndicator != null) {
      addContainsClassIndicatorRestrict(query)
    }
    return query
  }

  private function addContainsClassificationRestrict(qry : Query<BOPClassCode>) {
    addContainsRestrict("Classification", Classification, qry)
  }

  private function addContainsClassIndicatorRestrict(qry : Query<BOPClassCode>) {
    addContainsRestrict("ClassIndicator", ClassIndicator, qry)
  }

  private function addStartsWithLiabilityClassGroupRestrict(qry : Query<BOPClassCode>) {
    addStartsWithRestrict("BOPLiabilityClassGroup", BOPLiabilityClassGroup, qry)
  }

  private function addStartsWithPropertyRateNumberRestrict(qry : Query<BOPClassCode>) {
    addStartsWithRestrict("BOPPRopertyRateNumber", BOPPropertyRateNumber, qry)
  }

  override function equals(object : Object) : boolean {
    if (this === object) {
      return true
    }
    if (not super.equals(object)) {
      return false
    }
    
    var that = object as BOPClassCodeSearchCriteria
    return Classification == that.Classification and ClassIndicator == that.ClassIndicator
  }

  override function hashCode() : int {
    return new org.apache.commons.lang.builder.HashCodeBuilder(7, 5)
      .append(super.hashCode())
      .append(BOPLiabilityClassGroup)
      .append(BOPPropertyRateNumber)
      .append(Classification)
      .append(ClassIndicator)
      .toHashCode()
  }
}
