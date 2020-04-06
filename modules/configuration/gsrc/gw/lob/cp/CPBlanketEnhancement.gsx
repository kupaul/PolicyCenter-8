package gw.lob.cp
uses gw.api.productmodel.CoveragePattern
uses java.lang.Double
uses gw.api.productmodel.CoveragePattern

enhancement CPBlanketEnhancement : entity.CPBlanket {
  
  property get CovPatternNames() : List<String> {
    var covPatterns = this.CPLine.Pattern.CoverageCategories.flatMap(\ category -> 
                                                  category.CoveragePatterns.where(\ cp -> 
                                                      cp.BlanketGroupType != null and cp.BlanketGroupType == this.BlanketGroupType))
    return covPatterns.map(\ cov -> cov.DisplayName).sort()
  }
  
  property get BuildingCovLimitSum() : double {
    var sum : double = 0
    this.BuildingCoverages.each(\ cov -> {sum = sum + this.getBuildingCovLimit(cov)})
    return sum
  }
  
  property get MatchingBuildingCoverages() : CPBuildingCov[] {
    var cov = this.BuildingCoveragesByBlanketType
    return cov != null ? cov.where(\ c -> c.CPBlanket.CPBlanketNum == this.CPBlanketNum) : null       
  }
 
  property get BuildingCoveragesByBlanketType() : CPBuildingCov[] {
    var coverages = this.CPLine.CPLocations*.Buildings*.Coverages
    if (this.BlanketType == "singleloc" and this.CPLocation != null){
      var location = this.CPLine.CPLocations.singleWhere(\ c -> c.Location.AccountLocation == this.CPLocation.Location.AccountLocation)
      coverages = location.Buildings*.Coverages
    } else if(this.BlanketType == "singlecov"){
      coverages = coverages.where(\ cov -> cov.Pattern.Name == this.CPBuildingCovName )
    }
    return coverages.where(\ cov ->(cov.Pattern as CoveragePattern ).BlanketGroupType == this.BlanketGroupType)
  }
  
  function getBuildingCovLimitDisplay(cov : CPBuildingCov) : String {
    return cov typeis CPBldgBusIncomeCov ? cov.CPBuilding.BusIncomeLimitSumDisplay : 
           cov.CovTerms.firstWhere(\ term -> term.DisplayName.equals("Limit")).DisplayValue
  }
  
  function getBuildingCovLimit(cov : CPBuildingCov) : double {
    return Double.valueOf(getBuildingCovLimitDisplay(cov).remove(","))
  }
  
  function getBuildingCovDeductDisplay(cov : CPBuildingCov) : String {
    var deductible = cov.CovTerms.firstWhere(\ term -> term.DisplayName.equals("Deductible"))
    return deductible != null ? deductible.DisplayValue : null
  }  
  
  function getBuildingCovCoinsuranceDisplay(cov : CPBuildingCov) : String {
    var coinsurance = cov.CovTerms.firstWhere(\ term -> term.DisplayName.equals("Coinsurance"))
    return coinsurance != null ? coinsurance.DisplayValue : null
  }
  
  function getBlanketInclusion(cov : CPBuildingCov) : String {
    return cov.CPBlanket != null ? displaykey.Web.Policy.CP.Blanket.BlanketIncluded(cov.CPBlanket.CPBlanketNum) : 
                                   displaykey.Web.Policy.CP.Blanket.None
  }
  
  function addBuildingCoverages(coverages : CPBuildingCov[]) {
    this.removeNonMatchingCoverages()
    coverages.each(\ cov -> this.addToBuildingCoverages(cov))
    this.CPBlanketCov.CPBlanketLimitTerm.Value = this.BuildingCovLimitSum
  }  
  
  function removeNonMatchingCoverages() {
    var oldCoverages = this.BuildingCoverages
    var newCoverages = this.MatchingBuildingCoverages
    var removeBlanket = false
    for (oldCov in oldCoverages) {
      if (not newCoverages.hasMatch(\ c -> c == oldCov)) {
        oldCov.CPBlanket = null
        removeBlanket = true
      }
    }
    if (removeBlanket) {
      this.CPBlanketCov.CPBlanketLimitTerm.Value = this.BuildingCovLimitSum
    }
  }
  
  function recalculateLimit(){
    this.CPBlanketCov.CPBlanketLimitTerm.Value = this.BuildingCovLimitSum
  }
}