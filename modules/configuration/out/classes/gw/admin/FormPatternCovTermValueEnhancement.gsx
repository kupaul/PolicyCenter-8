package gw.admin
uses gw.api.productmodel.CovTermPattern
uses gw.api.productmodel.PackageCovTermPattern
uses gw.api.productmodel.OptionCovTermPattern
uses gw.api.productmodel.TypekeyCovTermPattern
uses gw.api.productmodel.CovTermPatternLookup

enhancement FormPatternCovTermValueEnhancement : entity.FormPatternCovTermValue {
 
  property get Description() : String {
    var covTermPattern = CovTermPatternLookup.getByCode(this.FormPatternCovTerm.CovTermPatternCode)
    if (covTermPattern typeis PackageCovTermPattern) {
      var pack = covTermPattern.Packages.firstWhere(\ c -> c.PackageCode == this.Code)
      return pack.Description
    }
    if (covTermPattern typeis OptionCovTermPattern) {
      var opt = covTermPattern.Options.firstWhere(\ c -> c.OptionCode == this.Code)
      return opt.Description
    }
    if (covTermPattern typeis TypekeyCovTermPattern) {
      var typeKey = covTermPattern.OrderedAvailableValues.firstWhere(\ t -> t.Code == this.Code)
      return typeKey.Description
    }
    return null
  }
}
