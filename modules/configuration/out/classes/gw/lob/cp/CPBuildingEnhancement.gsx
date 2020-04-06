package gw.lob.cp

uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.NumberUtil
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.coverage.AllCoverageCopier


enhancement CPBuildingEnhancement : CPBuilding {

  /**
   * returns the sum of all building coverage limits as double
   */
  property get BusIncomeLimitSum() : double {
    var mfgLimitTerm =  this.CPBldgBusIncomeCov.BusIncomeMfgLimitTerm.Value as double
    var otherLimitTerm = this.CPBldgBusIncomeCov.BusIncomeOtherLimitTerm.Value as double
    var rentalLimitTerm = this.CPBldgBusIncomeCov.BusIncomeRentalLimitTerm.Value as double
    var sum = mfgLimitTerm + otherLimitTerm + rentalLimitTerm
    return sum
  }

  /**
   * returns the sum of building coverage limits as String
   */
  property get BusIncomeLimitSumDisplay() : String {
    var limit = BusIncomeLimitSum
    return limit != 0 ? NumberUtil.render(limit) : null
  }

  /**
   * Return a list of CP Blankets that have coverages
   * @return List<CPBlanket> - list of CPBlanket
   */
  property get CurrentCPBlankets() : List<CPBlanket> {
    return this.Coverages.where(\ c -> c.CPBlanket != null).map(\ c -> c.CPBlanket).toList()
  }

  function firstMatchingClassCode(code : String) : CPClassCode {
    var criteria = new CPClassCodeSearchCriteria()
    criteria.Code = code
    criteria.EffectiveAsOfDate = this.PolicyLine.getReferenceDateForCurrentJob(JurisdictionMappingUtil.getJurisdiction(this.CPLocation.Location))
    criteria.PreviousSelectedClassCode = (this.PolicyLine.Branch.Job.NewTerm) ? null : this.BasedOn.ClassCode.Code
    return criteria.performSearch().FirstResult
  }

  function firstMatchingClassCodeOrThrow(code : String) : CPClassCode {
    var retVal = firstMatchingClassCode(code)
    if (retVal == null){
      throw new gw.api.util.DisplayableException(displaykey.Java.ClassCodePickerWidget.InvalidCode( code ))
    }
    return retVal
  }

  function validateYearBuilt(year : int) : String {
    var nextYear = java.util.Date.Today.addYears(1).YearOfDate
    if ((year > 0 and year < 1700) or year > nextYear) {
      return displaykey.Web.Policy.CP.Validation.YearBuilt
    }
    return null
  }

  function validateYearLastUpdate(yearLastUpdate : int) : String {
    var nextYear = java.util.Date.Today.addYears(1).YearOfDate
    if (yearLastUpdate > 0 and yearLastUpdate < this.Building.YearBuilt) {
      return displaykey.Web.Policy.CP.Validation.YearLastUpdate
    }
    if (yearLastUpdate > nextYear) {
      return displaykey.Web.Policy.CP.Validation.YearLastUpdateMax
    }
    return null
  }

  function validateBasementArea(area : int) : String {
    if (this.Building.NumBasements > 0 and area <= 0) {
      return displaykey.Web.Policy.CP.Validation.BasementArea
    }
    return null
  }

  property get BuildingLocationDisplay() : String {
    return this.DisplayName + " (" + this.CPLocation.DisplayName + ")"
  }

  /**
   * Copies the complete coverage pattern from this building to the given target buildings.
   */
  function copyCoverages(toBuildings : CPBuilding[]) {
    var coverageCopier = new AllCoverageCopier(this)
    coverageCopier.ShouldCopyAll = true
    toBuildings.each(\ b -> coverageCopier.copyInto(b))
  }
  
  property get Jurisdiction() : Jurisdiction {
    return StateJurisdictionMappingUtil.getJurisdictionMappingForState(this.CPLocation.Location.State)
  }
}
