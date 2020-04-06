package gw.policylocation
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class PolicyLocationEffDatedCopier extends AbstractEffDatedCopyable<PolicyLocation> {

  construct(loc : PolicyLocation) {
    super(loc)
  }


  override function copyBasicFieldsFromBean(loc : PolicyLocation) {
    // nothing to do for base fields
  }
  
  /**
   * Seperate implementation for CopyFromBean
   */
  override function copyFromBean(loc : PolicyLocation) {
    var codes = _bean.TerritoryCodes.partitionUniquely(\ t -> t.PolicyLinePatternCode)
    for (code in loc.TerritoryCodes) {
      var targetCode = codes[code.PolicyLinePatternCode]
      if (targetCode != null) {
        targetCode.copyFromBeanUntyped(code)
      }
    }
    _bean.FireProtectClass = loc.FireProtectClass
    _bean.TaxLocation = loc.TaxLocation
  }
}
