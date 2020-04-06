package gw.lob.bop
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

/**
 * Validation for {@link entity.BOPLocation BOPLocation}
 */
@Export
class BOPLocationValidation extends PCValidationBase {
  
  private var _location : BOPLocation

  construct(valContext : PCValidationContext, loc : BOPLocation) {
    super(valContext)
    _location = loc
  }

  /**
   * Validate the current {@link entity.BOPLocation BOPLocation}.
   *
   * Checks the following:
   * <ul>
   *   <li>Each location has at least one building</li>
   *   <li>Wind Hail has only one deductible</li>
   * </ul>
   */
  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl")
    checkHasAtLeastOneBuilding()
    checkWindHailHasOnlyOneDeductible()
  }

  /**
   * Validate the provided {@link entity.BOPLocation BOPLocation} to ensure wind/hail has only one deductible
   */
  static function validateBOPLocation(ploc : PolicyLocation) {
    var context = ValidationUtil.createContext("default")
    var loc = ploc.Branch.BOPLine.BOPLocations.firstWhere( \ bloc -> bloc.Location == ploc )
    new BOPLocationValidation(context, loc).checkWindHailHasOnlyOneDeductible()
    context.raiseExceptionIfProblemsFound()
  }
  
  private function checkHasAtLeastOneBuilding() {
    Context.addToVisited(this, "checkHasAtLeastOneBuilding")
    if (Context.isAtLeast("quotable")) {    
      if (_location.Buildings.IsEmpty) {
        Result.addError(_location, "quotable", 
          displaykey.Web.Policy.BOP.Validation.AtLeastOneBuildingPerLocation(_location.Location.DisplayName))
      }
    }
  }

  private function checkWindHailHasOnlyOneDeductible() {
    Context.addToVisited( this, "checkWindHailHasOnlyOneDeductible" )
    if (_location.BOPLocWindHailCovExists) {
      var cov = _location.BOPLocWindHailCov
      if (cov.BOPWindHailMoneyDedTerm.OptionValue.OptionCode != null
      and cov.BOPWindHailDedTerm.OptionValue.OptionCode != null) {
        Result.addError( cov, "default", displaykey.Web.Policy.BOP.Validation.WindHailOnlyOneDeductibleAllowed)
      }
    }
  }
}
