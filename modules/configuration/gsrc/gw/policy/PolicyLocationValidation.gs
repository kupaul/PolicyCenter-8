package gw.policy

uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.lob.common.AnswerValidation
uses gw.api.domain.FKLoader
uses java.util.Map

@Export
class PolicyLocationValidation extends PCValidationBase {
  var _validatedTerritoryCodes : Map<Map<String, Object>, String>
  var _location : PolicyLocation as Location

  construct(valContext : PCValidationContext, loc : PolicyLocation, validatedTerritoryCodes : Map<Map<String, Object>, String>) {
    super(valContext)
    _validatedTerritoryCodes = validatedTerritoryCodes
    _location = loc
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )

    allAccountLocationsAreActive()
    territoryCodeAgreesWithLocation()
    checkAnswers()
  }

  function allAccountLocationsAreActive() {
    Context.addToVisited(this, "allAccountLocationsAreActive")
    if (Context.isAtLeast("quotable")) {
      if (!Location.AccountLocation.Active) {
        Result.addError(Location.Branch, "quotable", displaykey.Web.Policy.LocationContainer.Location.Validation.NotActive(Location.DisplayName))
      }
    }
  }

  function territoryCodeAgreesWithLocation() {
    Context.addToVisited(this, "territoryCodeAgreesWithLocation")
    Location.TerritoryCodes.each(\ code -> {
      if (Context.isAtLeast("quotable")) {
        validateMismatchTerritoryCode(code)
      }
      if (Context.isAtLeast("default")) {
        validateRequiredTerritoryCode(code)
      }
    })
  }

  function validateMismatchTerritoryCode(code: TerritoryCode) {
    /* Don't validate null codes since required validation will catch that... */
    if ( code.Code != null ) {
      var matcher = code.MatchingCriteriaMap
      if (not _validatedTerritoryCodes.containsKey(matcher)) {
        _validatedTerritoryCodes[matcher] = code.prelimValidate()
      }
      if (_validatedTerritoryCodes[matcher].HasContent) {
        Result.addError(_location, "quotable",
                displaykey.Web.Policy.LocationContainer.Location.Validation.TerritoryCodeMismatchForLocation(
                        Location.LocationNum, _validatedTerritoryCodes[matcher]), "Locations")
      }
    }
  }

  function validateRequiredTerritoryCode(code : TerritoryCode) {
    if (Location.Country.UsesTerritoryCodes and code.Code == null) {
      var line = Location.Branch.Lines.singleWhere(\ p -> p.PatternCode == code.PolicyLinePatternCode)
      var locs = line.AllCoverables*.PolicyLocations
      
      if (locs.contains(Location)) {
        Result.addError(_location, "default", displaykey.Web.Policy.LocationContainer.Location.Validation.LocationRequiresTerritoryCode(
          Location.LocationNum, code.PolicyLinePattern.DisplayName))
      }
    }
  }

  function checkAnswers() {
    Context.addToVisited( this, "checkAnswers" )
    new AnswerValidation( Context, Location, Location.LocationAnswers, "Locations" ).validate()
  }

  static function validateLocationsStep(locs : PolicyLocation[]) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      if (not locs.first().Branch.Job.NewTerm) {
        FKLoader.preLoadFKs(locs*.TerritoryCodes.toList(), TerritoryCode)
      }
      var validatedTerritoryCodes : Map<Map<String, Object>, String> = {}
      locs.each(\ loc -> {
	var val = new PolicyLocationValidation(context, loc, validatedTerritoryCodes)
        val.territoryCodeAgreesWithLocation()
        val.checkAnswers()
      })
    })
  }
}
