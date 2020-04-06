package gw.rating

uses org.apache.commons.lang.ObjectUtils

/**
 * The CostDataKey automatically includes the ChargePattern, ChargeGroup, and RateAmountType fields from the CostData.
 * The key also is based upon the actual type of the cost data.  In addition, all user-supplied fields are part
 * of the key.
 */
@Export
class CostDataKey {
  
  var _keyValues : List<Object>
  var _cd : CostData
  
  construct(cd : CostData, keyValues : List<Object>) {
    _cd = cd
    _keyValues = {cd.ChargePattern, cd.ChargeGroup, cd.RateAmountType}
    _keyValues.addAll(keyValues)
  }
  
  override function hashCode() : int {
    var hash = ObjectUtils.hashCode(typeof(_cd))
    for (v in _keyValues) {
      hash ^= ObjectUtils.hashCode(v)    
    }
    return hash
  }
  
  override function equals(o : Object) : boolean {
    if (this === o) {
      return true
    }
    if (o typeis CostDataKey) {
      return (_cd == o._cd) or (typeof(_cd) == typeof(o._cd) and compareKeyValues(_keyValues, o._keyValues))
    } else {
      return false  
    }
  }
  
  override function toString() : String {
    return _keyValues.join( ", " )  
  }
  
  private function compareKeyValues(keyValues1 : List<Object>, keyValues2 : List<Object>) : boolean {
    if (keyValues1.size() != keyValues2.size()) {
      return false  
    }
    
    for (i in 0..|keyValues1.size()) {
      if (keyValues1.get(i) != keyValues2.get(i)) {
        return false  
      }
    }
    
    return true
  }
}
