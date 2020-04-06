package gw.lob.cp
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

@Export
class CPBlanketValidation extends PCValidationBase {
  var _blanket : CPBlanket as Blanket
  
  construct(valContext : PCValidationContext, blkt : CPBlanket) {
    super(valContext)
    _blanket = blkt
  }
  
  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    validateBlanketedCoverages()
  }
  
  function validateBlanketLimit(){
    Context.addToVisited(this, "validateBlanketLimit") 
    var buildingLimitSum = Blanket.BuildingCovLimitSum
    var blanketLimit = Blanket.CPBlanketCov.CPBlanketLimitTerm.Value
    if(Blanket.BuildingCoverages.HasElements){
      if (buildingLimitSum != blanketLimit) {
        Result.addWarning(Blanket, "default", displaykey.Web.Policy.CP.Validation.BlanketLimitDoesNotMatchBlanketedCovLimit)
      }
    }
  }
  
  function validateBlanketedCoverages(){
    Context.addToVisited(this, "validateBlanketCoverageTerms") 
    if (Context.isAtLeast("quotable")) {
      if (Blanket.BuildingCoverages.HasElements) {
        // Coverages in blanket must have same deductible and coinsurance as the blanket
        for (cov in Blanket.BuildingCoverages) {
          if (getCoinsuranceMismatch(cov) or getDeductibleMismatch(cov)) {
            Result.addError(Blanket, "default", displaykey.Web.Policy.CP.Validation.MustHaveMatchingDeductibleAndCoinsurance(Blanket.CPBlanketNum), "CPBlanket")
          }
        }
      }
    }
  }

  function validateAtleastTwoCoveragePerBlanket(){
    Context.addToVisited(this, "validateAtleastTwoCoveragePerBlanket") 
    if(Blanket.BuildingCoverages.Count < 2){
      Result.addWarning(Blanket, "default",displaykey.Web.Policy.CP.Validation.MustHaveAtLeastTwoCoverage)
    }
  }
  
  private function getCoinsuranceMismatch(cov : CPBuildingCov) : boolean {
    var coinsuranceDisplay = Blanket.getBuildingCovCoinsuranceDisplay(cov)
    return coinsuranceDisplay != null ? coinsuranceDisplay != Blanket.CPBlanketCov.CPBlanketCoinsuranceTerm.DisplayValue : false
  }  
  
  private function getDeductibleMismatch(cov : CPBuildingCov) : boolean {
    var deductibleDisplay = Blanket.getBuildingCovDeductDisplay(cov)
    return deductibleDisplay != null ? deductibleDisplay.remove(",") != Blanket.CPBlanketCov.CPBlanketDeductibleTerm.DisplayValue.remove(",") : false
  }
  
  static function validateBlanket(blanket : CPBlanket) {
    var context = ValidationUtil.createContext( "default" )
    var blanketValidation = new CPBlanketValidation(context, blanket)
    blanketValidation.validateBlanketLimit()
    blanketValidation.validateAtleastTwoCoveragePerBlanket()
    context.raiseExceptionIfProblemsFound()
  }
}
