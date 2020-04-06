package gw.coverage

uses gw.api.productmodel.CoverageCategory
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

enhancement CoverageEnhancement : Coverage {
  
  /**
   * @return the Coverage Category associated with this Coverage
   */
  property get CoverageCategory() : CoverageCategory {
    return this.Pattern.CoverageCategory
  }
  
  @Deprecated("Deprecated in PC 7.0.3. The CoverageSymbolGroup is available from the PolicyLine.")
  property get CoverageSymbolGroup() : CoverageSymbolGroup {
    var line = this.PolicyLine
    if (line typeis CoverageSymbolGroupOwner) {
      var csgPattern = (this.Pattern as CoveragePattern ).CoverageSymbolGroupPattern
      return line.getCoverageSymbolGroup(csgPattern)
    } else {
      return null
    }
  }

  /**
   * @return the Reinsurance Coverage Group associated with this Coverage
   */
  property get RICoverageGroupType() : RICoverageGroupType {
    var covPattern = this.Pattern as CoveragePattern
    if (covPattern.RICoverageGroupScript.NotBlank) {
      var scriptResult = covPattern.evaluateRICoverageGroupScript(this)
      return scriptResult != null ? scriptResult : covPattern.RICoverageGroupType
    } else {
      return covPattern.RICoverageGroupType
    }
  }
}
