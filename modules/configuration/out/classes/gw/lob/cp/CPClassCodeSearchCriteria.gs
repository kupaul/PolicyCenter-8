package gw.lob.cp

uses gw.api.database.Query
uses gw.lob.AbstractClassCodeSearchCriteria

/**
 * Defines the Commercial Property (CP) line building class code query
 * search criteria utility class.
 *
 * Used to construct queries for the CP line building class codes.
 */
@Export
class CPClassCodeSearchCriteria extends AbstractClassCodeSearchCriteria<CPClassCode> {
  /** The "contains" value of the classification description
   *    for the CP line building class codes.
   */
  var _classification : String as Classification
  /** The "contains" value of the class indicator
   *    for the CP line building class codes.
   */
  var _classIndicator : String as ClassIndicator

  override protected function constructBaseQuery() : Query<CPClassCode> {
    var q = new Query<CPClassCode>(CPClassCode)
    if (Classification != null) {
      addContainsClassificationRestrict(q)
    }
    if (ClassIndicator != null) {
      addContainsClassIndicatorRestrict(q)
    }
    return q
  }
  
  private function addContainsClassificationRestrict(qry : Query<CPClassCode>) {
    addContainsRestrict("Classification", Classification, qry)
  }

  private function addContainsClassIndicatorRestrict(qry : Query<CPClassCode>) {
    addContainsRestrict("ClassIndicator", ClassIndicator, qry)
  }

  override function equals(object : Object) : boolean {
    if (this === object) {
      return true
    }
    if (not super.equals(object)) {
      return false
    }
    
    var that = object as CPClassCodeSearchCriteria
    return Classification == that.Classification and ClassIndicator == that.ClassIndicator
  }

  override function hashCode() : int {
    return new org.apache.commons.lang.builder.HashCodeBuilder(7, 5)
      .append(super.hashCode())
      .append(Classification)
      .append(ClassIndicator)
      .toHashCode()
  }
}

