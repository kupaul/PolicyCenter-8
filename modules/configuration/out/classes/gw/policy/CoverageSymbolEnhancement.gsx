package gw.policy
uses gw.api.productmodel.CoverageSymbolPattern
uses gw.api.productmodel.CoverageSymbolPatternLookup

enhancement CoverageSymbolEnhancement : entity.CoverageSymbol {
  
  property get CoverageSymbol() : CoverageSymbolPattern {
    return CoverageSymbolPatternLookup.getByCode(this.PatternCode)
  }
  
  function getCoverageSymbolDiffDisplay() : String {
    var symbol =  CoverageSymbolPatternLookup.getByCode(this.PatternCode)
    var groupName = symbol.CoverageSymbolGroupPattern.Name
    var symbolTypeDesc = symbol.CoverageSymbolType.Description
    return displaykey.Web.Differences.LOB.Common.CoverageSymbol(symbolTypeDesc, groupName)
  }
}
