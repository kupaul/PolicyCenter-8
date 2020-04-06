package gw.reinsurance.agreement
uses gw.validation.PCValidationContext
uses gw.validation.PCValidationBase
uses com.guidewire.pl.system.bundle.validation.EntityValidationException
uses gw.api.reinsurance.RIUtil

@Export
class RIProgramValidation extends PCValidationBase {

  var _program : RIProgram

  construct(valContext : PCValidationContext, program : RIProgram) {
    super(valContext)
    _program = program
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")

    validateDates()
    
  /**
     • == DONE:
     
     •	Check that coverage ranges (attachment points to limits) do not overlap (error) 
     x  and do not have gaps between layers (warning)
     •	Validate that all Surplus agreements within the map have the same max gross retention
     •	Validation that the effective and expiration dates for agreements must be equal to or wider than the program map's dates.  
        Usually, the date ranges will be equal, but at least one customer told us that they have treaties that renew on different dates 
        and they will need to split the year up into 2 program periods to deal with the 2 renewal dates.  Each agreement will be for a 
        year and will be part of 2 different program periods.  It is only invalid if an agreement does not cover the entire program period.  
        We shouldn't care if it extends beyond the program period
     •	Check that all of the RICGs for the Program Map are also associated with all of the agreements attached to the map.   
     x	Check that all of the regions for the program map are also associated with all of the agreements attached to the map.   
     •	Check the intended Single Risk Maximum against limits in the connected per risk agreements for the program map.  
     •	Calc Net Retention (assuming that max risk size) and display for user to verify.  It should be possible to subtract out layers 
        covered by XOL agreements, then determine the carrier's proportional retention, and then subtract out any NXOL coverage to arrive at 
        the net retention.  Is _program what the user was expecting?  If not, it may indicate an error in setting up the treaties or the program map.
     x	Validate that <= 1 program applies to any 1 RI Coverage Group, date, and geography.  (Not sure how _program can be testable except 
        maybe by sampling using a date and a set of locations to test all the coverage groups.)
     •	Validate that if program is active, all treaties must be active
   */

    validateTreaties()
    validateProgram()
  }
  
  function validateDates() {
    // validate effDate and expDate -- they should be normalized
    if (_program.EffectiveDate != RIUtil.adjustEffectiveTimeForRI(_program.EffectiveDate)) {
        Result.addError(_program, "default", 
            displaykey.Web.Reinsurance.Program.Validation.EffectiveDateNormalization(_program))
        // should we fix this one so it doesn't generate anything spurious?
        // _program.setEffectiveDateWithDefaultTime(_program.EffectiveDate)
    }
    if (_program.ExpirationDate != RIUtil.adjustEffectiveTimeForRI(_program.ExpirationDate)) {
        Result.addError(_program, "default", 
            displaykey.Web.Reinsurance.Program.Validation.ExpirationDateNormalization(_program))
        // should we fix this one so it doesn't generate anything spurious?
        // _program.setExpirationDateWithDefaultTime(_program.ExpirationDate)
    }
    if (_program.ExpirationDate < _program.EffectiveDate) {
      Result.addError(_program, "default", 
          displaykey.Web.Reinsurance.Program.Validation.ExpiresBeforeEffective(_program))
    }
  }

  public function validateProgram(){
    var consistencCurrencies = true
    for(treaty in _program.Treaties){
      //check for consistent currency
      if (treaty.Currency != _program.Currency) {
        Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.InconsistentCurrency(treaty.Name, _program.Name))
        consistencCurrencies = false
        continue
      }

      //check agreement date ranges
      if (treaty.EffectiveDate.after(_program.EffectiveDate) or treaty.ExpirationDate.before(_program.ExpirationDate)){
        Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.InvalidTreatyEffectiveDates(treaty.Name))
      }
      //check single risk max
      if(treaty typeis PerRisk){
        if (_program.SingleRiskMaximum <> null and (!(treaty typeis NetExcessOfLossRITreaty))
            and treaty.CountTowardTotalLimit
            and treaty.CoverageLimit > _program.SingleRiskMaximum){
          Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.LimitTooHigh(treaty.Name))
        }
      }
      //check all treaties active if program is active
      if (_program.Active and not treaty.Active) {
        Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.ActiveProgramDraftTreaty(_program.Name, treaty.Name))
      }
    }

    // validate ri coverage groups
    for(covGroup in _program.CoverageGroups){
      if(not _program.Treaties.allMatch(\ r -> r.CoverageGroups.contains(covGroup) )){
        Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.InvalidCovGroup(covGroup))
      }
    }

    if(_program.CoverageGroups.Empty){
      Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.MissingCoverageGroup)
    }

    if (not consistencCurrencies) {
      return // If the currencies are not consistent, stop the validation.
    }

    //validate coverage ranges
    validateCoverageRanges()

    //validate surplus max retentions
    var surplusTreaties = _program.Treaties.where(\ r -> r.Subtype == TC_SURPLUSRITREATY).cast(SurplusRITreaty)
    validateSurplusMaxRetentionsAreEqual(surplusTreaties.toList())
    var quotaShareTreaties = _program.Treaties.where(\ r -> r.Subtype == TC_QUOTASHARERITREATY).cast(QuotaShareRITreaty)
    validateMaxRetentionsAreEqualToCoverageLimits(surplusTreaties.toList(), quotaShareTreaties.toList())

    //validate net retention <= target net retention
    var impliedNetRetention = _program.calculateImpliedNetRetention()
    if (impliedNetRetention != null && _program.TargetMaxRetention != null &&
        impliedNetRetention.compareTo(_program.TargetMaxRetention) == 1) {
       Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.NetRetentionGreaterThanTargetNetRetention)
    }
  }

  private function validateTreaties(){
    for(treaty in _program.Treaties){
      try {
        PCValidationContext.doPageLevelValidation( \ ctx -> new RIAgreementValidation(ctx, treaty).validateAgreementItself())
      } catch (e : EntityValidationException) {
        Result.addError(_program, "default", displaykey.Web.Reinsurance.Program.Validation.InvalidTreaty(treaty.Name))
      }
    }
  }

  /*
  * Returns true if the Program and Treaties have the same currency
  */
  private function validateTreatyCurrencies() : boolean {
    var currenciesAreConsistent = true
    for(treaty in _program.agreementsHavingDifferentCurrency()){
      Result.addError(_program, "default",displaykey.Web.Reinsurance.Program.Validation.InconsistentCurrency(treaty.Name, _program.Name))
      currenciesAreConsistent = false
    }
    return currenciesAreConsistent
  }
  
  /**
   * @param isError - if isError == true, overlaps are set as errors, otherwise they are set as warnings
   */
  private function checkForOverlaps(treaties : RIAgreement[], asErrors : boolean) {

     var errors = treaties.getCoverageOverlapErrors(null, null, null)
     errors.each(\ e -> {
         if (asErrors) {
           Result.addError(_program, "default", e)
         } else {
           Result.addWarning(_program, "default", e)             
         }
     })
  }
  
  /**
   * Check that coverage ranges (attachment points to limits) do not overlap (error) and do not have gaps between layers (warning)
   */
  function validateCoverageRanges() {     
     //checking for overlaps
     checkForOverlaps(_program.Treaties.GrossPerRiskAgreementsForCalc, true)
     checkForOverlaps(_program.Treaties.NXOLAgreementsForCalc, true)
     
     //checking for overlap warnings in per event and annual aggregate
     var perEvents = _program.Treaties.where(\ r -> r.Subtype == TC_PEREVENTRITREATY)
     var annualAggregates = _program.Treaties.where(\ r -> r.Subtype == TC_ANNUALAGGREGATERITREATY)
     checkForOverlaps(perEvents, false)
     checkForOverlaps(annualAggregates, false)
     
     //checking for gaps
     
  }

  /**
   * Validate that all Surplus agreements within the map have the same max gross retention
   */
  function validateSurplusMaxRetentionsAreEqual(treatyList : List<SurplusRITreaty>) {
    
    while (treatyList.Count > 1) {
      var compareToTreaty = treatyList.remove(0)
      for (treaty in treatyList) {
        if (treaty.MaxRetention != compareToTreaty.MaxRetention) {
          Result.addError(_program, "default",displaykey.Web.Reinsurance.Agreement.Verify.SurplusMaxRetentionNotEqual(treaty.Name, compareToTreaty.Name)) 
        }
      }
    }
  }

  function validateMaxRetentionsAreEqualToCoverageLimits(surplusList : List<SurplusRITreaty>, quotaShareList : List<QuotaShareRITreaty>) {
    for (quotaShare in quotaShareList) {
      for (surplus in surplusList) {
        if (!quotaShare.CoverageLimit.equals(surplus.MaxRetention)) {
          Result.addWarning(_program, "default", displaykey.Web.Reinsurance.Agreement.Verify.SurplusMaxRetNotEqualToQuotaShareLimit(surplus.Name, quotaShare.Name))
        }
      }
    }
  }

  static function validateUI(program : RIProgram) {
    PCValidationContext.doPageLevelValidation( \ context -> new RIProgramValidation(context, program).validate())
  }

  static function validateCurrencyUI(program : RIProgram) {
    PCValidationContext.doPageLevelValidation( \ context -> new RIProgramValidation(context, program).validateTreatyCurrencies())
  }

}
