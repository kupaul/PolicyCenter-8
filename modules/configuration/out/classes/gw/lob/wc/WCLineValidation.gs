package gw.lob.wc

uses gw.api.domain.StateSet
uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.lob.common.AnswerValidation
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext

uses java.lang.Integer
uses java.util.ArrayList
uses java.util.HashMap

@Export
class WCLineValidation extends PolicyLineValidation<entity.WorkersCompLine> {
  
  property get wcLine() : entity.WorkersCompLine { return Line }

  construct(valContext : PCValidationContext, polLine : entity.WorkersCompLine) {
    super(valContext, polLine)
  }

  /**
   * Validate the WC Line.
   *
   * Checks the following:
   * <ul>
   *   <li>Has at least one Jurisdiction</li>
   *   <li>Waiver of Subrogation valid</li>
   *   <li>Retrospective rating valid</li>
   *   <li>Exposures not in monopolistic states</li>
   *   <li>Anniversary and modifiers for interstate official IDs</li>
   *   <li>No split jurisdictions</li>
   *   <li>Answers valid</li>
   *   <li>Federal class codes are valid</li>
   *   <li>Industry code has value</li>
   *   <li>Excluded states contain monopolistic states</li>
   *   <li>Jurisdictions are each valid</li>
   *   <li>Payroll for all policy locations</li>
   * </ul>
   */
  override function doValidate() {
    atLeastOneJurisdiction()
    waiverOfSubrogation()
    retrospectiveRating()
    exposureInMonopolisticStates()    
    anniversaryAndModifiersForInterstateOfficialIDs()
    noSplitJurisdictions() 
    checkAnswers()
    federalClassCodesAreValid()
    industryCodeHasValue()
    excludedStatesContainMonopolisticStates()
    wcLine.Jurisdictions.each( \ jurisdiction -> new WCJurisdictionValidation(Context, jurisdiction).validate()  )
    payrollForAllPolicyLocations()
  }
  
  function payrollForAllPolicyLocations() {
    Context.addToVisited( this, "payrollForAllPolicyLocations" )    
    for (location in wcLine.PolicyLocations) {
      var coveredEmployees = wcLine.getExistingOrFutureCoveredEmployeesRelatedToLocation(location)
      if (coveredEmployees.Empty) {
        if (wcLine.checkLocationInUse(location)) {
          Result.addWarning(location, "quotable",
              displaykey.Web.Policy.WC.Validation.LocationWithoutPayroll({location}))
        } else {
          Result.addWarning(location, "quotable",
              displaykey.Web.Policy.WC.Validation.LocationForNonCoveredState({location}))
        }
      }
    }
  }

  override function validateLineForAudit() {
    allAuditAmountsShouldBeFilledIn()
    receivedDateFilledInPriorToSubmit()
  }
  
  function industryCodeHasValue() {
    Context.addToVisited( this, "industryCodeHasValue" )    
    if (Context.isAtLeast("quotable") and wcLine.Branch.PrimaryNamedInsured.IndustryCode == null) {
      Result.addError( wcLine, "default", displaykey.Web.Policy.WC.Validation.IndustryCode, "PolicyInfo")
    }
  }
  
  function atLeastOneJurisdiction() {
    Context.addToVisited(this, "atLeastOneJurisdiction")
    if (wcLine.Jurisdictions.IsEmpty and Context.isAtLeast("default")) {
      var msg = displaykey.Web.Policy.WC.Validation.AtLeastOneJurisdiction
      if (Context.isAtLeast("quotable")) {
        Result.addError(wcLine, "quotable", msg, "WorkersCompCoverageConfig")
      } else {
        Result.addWarning(wcLine, "default", msg, "WorkersCompCoverageConfig")
      }
    }
  }
  
  /**
   * Verify that all AuditedAmounts are filled in
   */
  function allAuditAmountsShouldBeFilledIn() {
    if (wcLine.Branch.Job typeis Audit) {
      // Verify that all WCCoveredEmployess Have An Audited Amount
      wcLine.WCCoveredEmployees.each(\ wcEmp -> {
          if (wcEmp.AuditedAmount == null) {
            Result.addError(wcLine,
                            "quotable",
                            displaykey.Web.AuditWizard.Details.NullAmountsError,
                            displaykey.Web.AuditWizardMenu.Details)
          }}
      )
    }
  }  
  
  /**
   * Verify that audit Received Date is filled in prior to submit
   */
  function receivedDateFilledInPriorToSubmit() {
    if (wcLine.Branch.Job typeis Audit) {
      if (wcLine.Branch.Audit.AuditInformation.ReceivedDate == null) {
        Result.addError(wcLine,
                            "quotable",
                            displaykey.Web.AuditWizard.Summary.NullReceivedDate,
                            displaykey.Web.AuditWizardMenu.Summary)
      }
    }
  }
  
  function waiverOfSubrogation() {
    Context.addToVisited(this, "waiverOfSubrogation")
    if (not Context.isAtLeast("default")) {
      return
    }

    var waiverAmountByClassCode = new HashMap<WCClassCode, Integer>()
    var exposureAmountByClassCode = new HashMap<WCClassCode, Integer>()

    // compute waiver amount by classcode
    for (exposure in wcLine.WCWaiverOfSubros) {
      if (exposure.Type == typekey.WaiverOfSubrogationType.TC_SPECIFIC) {
        var amount = waiverAmountByClassCode.get(exposure.ClassCode)
        if (amount == null) {
          amount = exposure.BasisAmount
        } else {
          amount = amount + exposure.BasisAmount
        }
        waiverAmountByClassCode.put(exposure.ClassCode, amount)
      }
    }

    // compute exposure amount by classcode
    for (eu in wcLine.AllWCExposuresWM) {
      var amount : int = exposureAmountByClassCode.get(eu.ClassCode)
      if (amount == null) {
        amount = eu.BasisAmount
      } else {
        amount = amount + ((eu.BasisAmount != null) ? eu.BasisAmount : 0)
      }
      exposureAmountByClassCode.put(eu.ClassCode, amount)
    }

    // verify that the waived amount is not more that the basis amount for each class code
    for (classCode in waiverAmountByClassCode.keySet()) {
      var waiverAmount = waiverAmountByClassCode.get(classCode)
      var basisAmount = exposureAmountByClassCode.get(classCode)
      if (waiverAmount > basisAmount) {
        Result.addError(wcLine, "default", 
            displaykey.Web.Policy.WC.Validation.WaivedAmountExceedsOverallBasis(classCode.Code, waiverAmount , basisAmount))
      }
    }

  }

  function retrospectiveRating() {
    Context.addToVisited(this, "retrospectiveRating")
    
    var policyPeriod = wcLine.Branch
    var plan = wcLine.RetrospectiveRatingPlan

    if (plan == null) {
      return
    }

    if (plan.FirstComputationDate.DayOfMonth != 1 
          or plan.LastComputationDate.DayOfMonth != 1) {
      Result.addError(wcLine, "default", 
                      displaykey.Web.Policy.WC.Validation.RetroRatingPlanComputationDateBeginningOfMonth)
    }

    var nMonth = (plan.LastComputationDate.MonthOfYear + 12 * plan.LastComputationDate.YearOfDate) -
          (plan.FirstComputationDate.MonthOfYear + 12 * plan.FirstComputationDate.YearOfDate)

    if (plan.ComputationInterval < 1) {
       Result.addError(wcLine,"default", displaykey.Web.Policy.WC.Validation.RetroRatingPlanComputationIntervalPositive)
    } else if (nMonth % plan.ComputationInterval != 0) {
       Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.RetroRatingPlanTimeSpan)
    }
 
    if (plan.FirstComputationDate < policyPeriod.PeriodEnd) {
      Result.addError(wcLine, "default",
                      displaykey.Web.Policy.WC.Validation.RetroRatingPlanComputationDateNotPriorExpiration(policyPeriod.PeriodEnd))
    }

    if (plan.LastComputationDate <=  plan.FirstComputationDate) {
      Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.RetroRatingPlanComputationDateLastAfterFirst)
    }

    for (letter in plan.LettersOfCredit) {
      if (letter.ValidTo <= letter.ValidFrom) {
        Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.LetterOfCreditExpirationDate(letter.IssuerName))
      }

      if (letter.ValidFrom > plan.FirstComputationDate or
          letter.ValidTo < plan.LastComputationDate) {
        Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.LetterOfCreditDoesNotCoverWholePeriod(letter.IssuerName))
      }
    }
  }

  function exposureInMonopolisticStates() {
   Context.addToVisited(this, "exposureInMonopolisticStates")
   var monopolisticStates = StateSet.get(StateSet.WC_MONOPOLISTIC)

    for (exposure in wcLine.WCCoveredEmployees) {
      if (monopolisticStates.contains(exposure.Location.State) 
            and (exposure.SpecialCov =="stat" or exposure.SpecialCov =="ltdm" or exposure.SpecialCov =="voco")) {
        Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.ExposuresNotForMonopolisticStates)
      }
    }
  
    for (exposure in wcLine.WCCoveredEmployees) {
      if (!monopolisticStates.contains(exposure.Location.State) and (exposure.SpecialCov =="stop")) {
        Result.addError(wcLine, "default", displaykey.Web.Policy.WC.Validation.StopGapOnlyForMonopolisticStates)
      }
    }
  }

  function atLeastOneFedLiabClass() {
    Context.addToVisited(this, "atLeastOneFedLiabClass")
    if (wcLine.WCFedEmpLiabCovExists and wcLine.WCFedCoveredEmployees.Count <= 0) {
      Result.addError(wcLine, "default", 
        displaykey.Web.Policy.WC.Validation.AtLeastOneFedLiabClass)
    }
  }

  function federalClassCodesAreValid() {
    Context.addToVisited(this, "classCodesAreValid")
   
    if (wcLine.WCFedEmpLiabCov != null) {
      for (employee in wcLine.WCFedCoveredEmployees) {
        var previousCode = wcLine.Branch.Job.NewTerm ? null : employee.BasedOn.ClassCode
        var classCode = employee.ClassCode.Code
        var classIndicator = employee.ClassCode.ClassIndicator
        var state = JurisdictionMappingUtil.getJurisdiction(employee.Location)
        var domain = (wcLine.WCFedEmpLiabCov.FedEmpLiabActTerm.Value.Code as WCClassCodeFederalDomains).Code
                
        if (!wcLine.doesClassCodeExist(classCode, state, domain, previousCode, classIndicator)) {
          Result.addError(wcLine, "default", 
              displaykey.Web.Policy.WC.Validation.UnavailableClassCode(classCode),
              "WorkersCompOptions")
        }        
      }
    }
  }
  
  static function validateWorkersCompOptionsStep(wcLine : WorkersCompLine) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var val = new WCLineValidation(context, wcLine)
      val.waiverOfSubrogation()
      val.retrospectiveRating()
      val.atLeastOneFedLiabClass()
      val.federalClassCodesAreValid()
    })
  }

  static function validateWCCoveragesStep(wcLine : WorkersCompLine) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var val = new WCLineValidation(context, wcLine)
      val.atLeastOneJurisdiction()
      wcLine.Jurisdictions.each( \ jurisdiction -> new WCJurisdictionValidation(context, jurisdiction).validate()  )
    })
  }
  
  static function validateWCSupplementalStep(wcLine : WorkersCompLine) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var val = new WCLineValidation(context, wcLine)
      val.checkAnswers()
    })
  }

  function excludedStatesContainMonopolisticStates() {
    Context.addToVisited(this, "excludedStatesContainMonopolisticStates")
    var cov = wcLine.WCOtherStatesInsurance
    if (Context.isAtLeast("default") and cov.WCOtherStatesOptTerm.Value == "AllExcept") {
      var monopolisticStates = StateSet.get(StateSet.WC_MONOPOLISTIC)
      var exclStates =  StateSet.get(cov.WCExcludedStatesTerm.Value)
      var notExclStates = new ArrayList()
      for (state in monopolisticStates.toArray()) {
        if (!exclStates.contains(state)) {
          notExclStates.add(state.DisplayName)
        }
      }
      if (notExclStates.Count > 0) {
        Result.addError(wcLine, "default", 
              displaykey.WorkersComp.InsuredStates.MustExcludeMonopolisticState(notExclStates.join(", ")))
      }
    }
  }  
  
  function anniversaryAndModifiersForInterstateOfficialIDs() {
    var emptyIntraStates = new ArrayList<State>()
    var interStateIDs = wcLine.InterstateNamedInsuredOfficialIDs
    for (interStateID in interStateIDs) {
      var applicableStates = (interStateID as PCOfficialID).Pattern.ApplicableStatesAsArray 
      var jurisdictions = wcLine.Jurisdictions.where(\s -> applicableStates.contains(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(s.State)))
      jurisdictions.sortBy(\ j -> j.State.Code)
      
      // ARD validation
      var anniversaries = jurisdictions.map( \j -> j.AnniversaryDate ).toSet()
      if (anniversaries.Count > 1 and interStateID.OfficialIDValue != null) {
        for (jur in jurisdictions) {
          var intraStateIDs = wcLine.Branch.getNamedInsuredOfficialIDsForState(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(jur.State))
          if (intraStateIDs.allMatch(\ intraStateID -> intraStateID.OfficialIDValue == null)) {
            emptyIntraStates.add(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(jur.State))
          }
        }        
        if (emptyIntraStates.Count > 1) {
          Result.addError(wcLine, "default", 
            displaykey.Web.Policy.WC.Validation.DifferentAnniversaryDates(emptyIntraStates.join(","), interStateID.OfficialIDType.Description, interStateID.OfficialIDValue))
        }
      }

      // modifier validation
      var modifiers = jurisdictions.map(\j -> j.getModifier("ExpMod").RateModifier).toSet()
      if (modifiers.Count > 1) {
        Result.addError(wcLine, "default", 
          displaykey.Web.Policy.WC.Validation.DifferentExpModValues(jurisdictions*.State.join(","), interStateID.OfficialIDType.Description, interStateID.OfficialIDValue))
      }
    }
  }
  /**
   * Validates that jurisdictions have not been split and that their effective and expiration dates are set to the period boundaries.
   */
  function noSplitJurisdictions() {
    for (jVL in wcLine.VersionList.Jurisdictions) {
      if (jVL.AllVersions.size() > 1) {
        Result.addInvariantError(wcLine, displaykey.Web.Policy.WC.Validation.SplitJurisdiction( jVL.AllVersions.first().State ))
      } else {
        var jurisdiction = jVL.AllVersions.first()
        if (jurisdiction.EffectiveDate != jurisdiction.Branch.PeriodStart) {
          Result.addInvariantError(wcLine, displaykey.Web.Policy.WC.Validation.JurisdictionEffectiveDate( jurisdiction, jurisdiction.EffectiveDate, jurisdiction.Branch.PeriodStart ))
        } else if (jurisdiction.ExpirationDate != jurisdiction.Branch.PeriodEnd) {
          Result.addInvariantError(wcLine, displaykey.Web.Policy.WC.Validation.JurisdictionExpirationDate( jurisdiction, jurisdiction.ExpirationDate, jurisdiction.Branch.PeriodEnd ))
        }
      }
    }
  }
  
  function checkAnswers() {
    Context.addToVisited( this, "checkAnswers" )
    new AnswerValidation( Context, Line, Line.Answers, "WorkersCompSupplemental" ).validate()
  }
  
}
