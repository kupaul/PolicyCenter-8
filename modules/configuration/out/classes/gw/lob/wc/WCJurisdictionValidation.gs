package gw.lob.wc

uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.api.util.DateUtil

@Export
class WCJurisdictionValidation extends PCValidationBase {

  var _jurisdiction: WCJurisdiction

  construct(valContext : PCValidationContext, jurisdiction: WCJurisdiction) {
    super(valContext)
    _jurisdiction = jurisdiction
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )
    anniversaryDateWithinBounds()
    atLeastOneClass()
    classCodesAreValid()
    ratingPeriodStartDatesAreValid() 
  }

  function anniversaryDateWithinBounds() {
    Context.addToVisited( this, "anniversaryDateWithinBounds" )
    var effDateLess1Year = _jurisdiction.WCLine.Branch.PeriodStart.addYears(-1)

    if (_jurisdiction.AnniversaryDate != null) {
      if (DateUtil.compareIgnoreTime(_jurisdiction.AnniversaryDate, effDateLess1Year) <= 0 or
          DateUtil.compareIgnoreTime(_jurisdiction.AnniversaryDate, _jurisdiction.WCLine.Branch.PeriodStart) > 0) {
        Result.addError(_jurisdiction, "default", displaykey.Web.Policy.WC.Validation.AnniversaryDateBeforeEffectiveDate)
      }
    }
  }  

  function classCodesAreValid() {
    Context.addToVisited(this, "classCodesAreValid")
    
    if (Context.isAtLeast("default")) {
      var line = _jurisdiction.WCLine
      var state = _jurisdiction.State
      var employees = line.getWCCoveredEmployeesWM(state)
      for (employee in employees) {
        var previousCode = line.Branch.Job.NewTerm ? null : employee.BasedOn.ClassCode
        var classCode = employee.ClassCode.Code
        if (!line.doesClassCodeExist(classCode, state, state.Code, previousCode, null)) {
          Result.addError(_jurisdiction.WCLine, "default", 
              displaykey.Web.Policy.WC.Validation.UnavailableClassCode(classCode),
              "WorkersCompCoverageConfig")
        }        
      }
    }
  }

  function atLeastOneClass() {
    Context.addToVisited(this, "atLeastOneClass")
    if (Context.isAtLeast("default")) {
      if( _jurisdiction.WCLine.getWCCoveredEmployeesWM(_jurisdiction.State).Count == 0){
        Result.addError(_jurisdiction.WCLine, "default", 
            displaykey.Web.Policy.WC.Validation.CoveredStateMissingClass(_jurisdiction.State.DisplayName),
            "WorkersCompCoverageConfig")
      }
    }
  }
  
  function ratingPeriodStartDatesAreValid(){
    
    Context.addToVisited(this, "ratingPeriodStartDatesAreValid")
    if(Context.isAtLeast("default")){
      // Ensure there are no RatingPeriodStartDates with a duplicate type and start-date
     _jurisdiction.RatingPeriodStartDates
       .partition(\ rpsd -> "${rpsd.StartDate.YearOfDate}${rpsd.StartDate.DayOfYear}${rpsd.Type}")  
       .filterByValues(\ l -> l.Count > 1 )
       .eachValue(\ l -> { 
          Result.addError(_jurisdiction.WCLine, "default",
            displaykey.Web.Policy.WC.Validation.DuplicateRatingPeriodStartDate(_jurisdiction.State.DisplayName, l.first().StartDate ), 
            "WorkersCompCoverageConfig")                           
        })
    }
  }
  
}
