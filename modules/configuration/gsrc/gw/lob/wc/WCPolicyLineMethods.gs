package gw.lob.wc

uses java.util.ArrayList
uses java.util.Set
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.plugin.diff.impl.WCDiffHelper
uses java.util.Date
uses gw.api.util.StateJurisdictionMappingUtil
uses java.util.HashSet
uses java.lang.Iterable
uses entity.windowed.WCCostVersionList
uses gw.api.util.JurisdictionMappingUtil
uses java.math.BigDecimal
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.entity.IEntityType
uses gw.lob.common.SegmentEvaluator
uses gw.rating.AbstractRatingEngine
uses gw.lob.wc.rating.WCSysTableRatingEngine
uses java.util.Map

@Export
class WCPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  public var _line : entity.WorkersCompLine
  
  construct(line : entity.WorkersCompLine) {
    super(line)
    _line = line
  }

  override function initialize() {
    var state = JurisdictionMappingUtil.getJurisdiction(_line.Branch.Policy.Account.PrimaryLocation)
    _line.addJurisdiction(state )
  }
  
  override function syncComputedValues() {
    _line.recalculateGoverningClasscode()
    _line.updateWCExposuresAndModifiers() 
  }
  
  override property get CoveredStates() : Jurisdiction[] {
    return _line.WCCoveredEmployees.where(\ emp -> emp.Location != null)
                                   .map(\ emp -> JurisdictionMappingUtil.getJurisdiction(emp.Location))
  }

  override property get AllCoverages() : Coverage[] {
    var covs = new ArrayList<Coverage>()
    covs.addAll(_line.WCLineCoverages.toList())
    covs.addAll(_line.Jurisdictions*.Coverages.toList())
    return covs as Coverage[]
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.WCLineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.WCLineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var list : ArrayList<Coverable> = {_line}
    _line.Jurisdictions.each(\ jur -> list.add(jur))
    return list.toTypedArray()
  }
  
  override property get AllModifiables() : Modifiable[] {
    return _line.Jurisdictions
  }

  override property get SupportsRatingOverrides() : boolean {
    return true
  }

  override property get OfficialIDStates() : State[] {
    var jurisdictions = _line.Jurisdictions.map(\ juris -> juris.State)
    var states = new HashSet<State>()
    for(jurisdiction in jurisdictions){
      states.add(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(jurisdiction))
    }
    return states as State[]
  }

  override function onIssuanceBeginEditing() {
    initializeAnniversaryDates()     
  }
  
  override function onSubmissionBeginEditing() {
    initializeAnniversaryDates()
    var state = JurisdictionMappingUtil.getJurisdiction(_line.Branch.PrimaryLocation)
    if (_line.getJurisdiction( state ) == null) {
      _line.addJurisdiction( state ) 
    }
  }
  
  override property get Auditable() : boolean {
    return true  
  }

  override property get AllowsPremiumAudit() : boolean {
    return true
  }


  private function initializeAnniversaryDates() {
    for (jurisdiction in _line.Jurisdictions) {
      if (jurisdiction.AnniversaryDate == null) {
        jurisdiction.AnniversaryDate = _line.Branch.PeriodStart
      }
    }
  }

  /**
   * Indicates whether ChangeEditEffectiveDate (CEED) can be performed on this policy line.  If this returns
   * null or an empty string, that means the line thinks it's OK.   Otherwise, this method should returnan
   * error message indicating why ChangeEditEffectiveDate cannot be performed.
   * @return an error message if Edit Effective Date can't be changed, null or the empty String if it can
   */
  override function canSafelyCEED() : boolean {
    for (jurisdiction in _line.Jurisdictions) {
      if (jurisdiction.BasedOn != null and jurisdiction.SplitDates.toSet() != jurisdiction.BasedOn.SplitDates.toSet()) {
        return false
      }
    }
    return true
  }

  /**
   * All WCCosts across the term, in window mode.
   */
  override property get CostVLs() : Iterable<WCCostVersionList> {
    return _line.VersionList.WCCosts
  }
  
  override property get Transactions() : Set<Transaction> {
    return _line.WCTransactions.toSet()
  }
  
  override function prorateBasesFromCancellation() {
    for (jurisdiction in _line.Jurisdictions) {
      var cancellationDate = _line.Branch.CancellationDate
      if(jurisdiction.canAddRPSD(cancellationDate) == null){
        jurisdiction.addRatingPeriodStartDate(cancellationDate, "audit")
      }
    }
    _line.updateWCExposuresAndModifiers()
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.WorkersCompLine> {
    return new WCLineValidation(validationContext, _line)  
  }
  
  override function preLocationDelete(location : PolicyLocation) { 
    for (exposure in _line.getExistingOrFutureCoveredEmployeesRelatedToLocation(location)){
      exposure.endDateWM(location.SliceDate)
    }
  }

  override function checkLocationInUse(location : PolicyLocation) : boolean {
    // only time WC location should be removed automatically is when jurisdiction is removed - PC-13922
    return true
  }
  
  override function onBeginIssueJob() {
    super.onBeginIssueJob()
    // because we don't allow locations to be removed before quoting, clean them up before bind:
    _line.Branch.removeUnusedLocations()
  }
  
  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : WCDiffHelper {
    return new WCDiffHelper(reason, this._line, policyLine as WorkersCompLine)
  }
  
  
  override function postApplyChangesFromBranch(sourcePeriod : PolicyPeriod) {
    for(employee in this._line.WCCoveredEmployees){
      if(employee.Location == null){ // location has been deleted
        employee.removeWM()
      }
    }
    for(jurisdiction in _line.Jurisdictions){
      jurisdiction.updateRPSDsAfterPeriodChange(sourcePeriod.PeriodStart)
    }
    _line.updateWCExposuresAndModifiers()
  }
  
  override function postSetPeriodWindow( oldEffDate: Date, oldExpDate: Date) {
    for (jurisdiction in _line.Jurisdictions) {
      jurisdiction.adjustAnniversaryDate()
      jurisdiction.updateRPSDsAfterPeriodChange(oldEffDate)
    }
  }

  override function postCreateDraftBranchInNewPeriod() {
    var jurisdictions = this._line.Jurisdictions
    for (jurisdiction in jurisdictions) {
      jurisdiction.updateRPSDsInNewPeriod()
    }
  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch (cov.FixedId.Type) {
      //Workers Comp Line
      case WorkersCompCov.Type:  
        return getWorkersCompCovLimit(cov as WorkersCompCov)

      case WCStateCov.Type:
        break
    }
    return BigDecimal.ZERO
  }

  override function isUnlimited(cov : Coverage) : boolean {
    switch(cov.PatternCode) {
      case "WCOtherStatesInsurance":
      case "WCWorkersCompCov":
        return true
      default:
        return false
    }    
  }

  override function canDateSliceOnPropertyChange(bean : KeyableBean) : boolean {
    if (bean typeis WCCoveredEmployee or bean typeis WCFedCoveredEmployee) {
      // Apply property changes to the above objects in window mode
      return false
    }
    if (bean typeis WCModifier) {
      // Modifiers on Jurisdiction and (theoretically) RPSD should also be applied in window mode
      return not ((bean.OwningModifiable typeis WCJurisdiction) or (bean.OwningModifiable typeis RatingPeriodStartDate))
    }
    return true
  }

  override property get TypesToNotDateSliceOnApplyDiff() : Set<IEntityType> {
    return {WCJurisdiction}
  }
  
  override function createSegmentEvaluator(policyPeriod : PolicyPeriod) : SegmentEvaluator {
    return new WC_SegmentEvaluator(policyPeriod)
  }

  override property get AdditionalDaysInAnnualTerm() : int {
    return 16
  }

  override property get WorkersComp() : boolean {
    return true
  }

  override property get EmergencyServiceFunding() : boolean {
    return true  
  }

  override property get PolicyLocationCanBeRemovedWithoutRemovingAssociatedRisks() : boolean {
    return true
  }

  override property get SupportsNonSpecificLocations() : boolean {
    return true
  }

  override function validateSubmissionWizardPolicyInfo(period : PolicyPeriod) {
    WCPolicyInfoValidation.validateFields(period.WorkersCompLine)
  }

  private function getWorkersCompCovLimit(cov: WorkersCompCov): BigDecimal {
    var insuredValue = BigDecimal.ZERO
    switch (cov.PatternCode) {
      case "WCOtherStatesInsurance":
      case "WCWorkersCompCov":
          return null;
      case "WCFedEmpLiabCov":
          if (cov.WCLine.WCFedEmpLiabCov.HasWCFedEmpLiabLimitTerm) {
            insuredValue = addNullSafe(insuredValue, cov.WCLine.WCFedEmpLiabCov.WCFedEmpLiabLimitTerm.Value)
          }
          if (cov.WCLine.WCFedEmpLiabCov.HasFELADiseaseTerm) {
            insuredValue = addNullSafe(insuredValue, cov.WCLine.WCFedEmpLiabCov.FELADiseaseTerm.Value)
          }
          return insuredValue
      case "WCEmpLiabCov":
          // when there's a per-event and an aggregate for the same RestrictionModel, we want the aggregate
          // (which logically will be the higher value).
          var terms = cov.WCLine.WCEmpLiabCov.WCEmpLiabLimitTerm.PackageValue.PackageTerms.partition(\t -> t.RestrictionModel)
          for (t in terms.Values) {
            insuredValue = addNullSafe(insuredValue, t.maxBy(\p -> p.Value).Value)
          }
          return insuredValue
        default:
        return 0
    }
  }

  override function createRatingEngine(method : RateMethod, parameters : Map<RateEngineParameter, Object>) : AbstractRatingEngine<WorkersCompLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new WCSysTableRatingEngine(_line as WorkersCompLine)
    }
    return null
  }

  override property get BaseStateRequired() : boolean {
    return false
  }
}

