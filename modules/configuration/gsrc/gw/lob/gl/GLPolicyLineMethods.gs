package gw.lob.gl

uses gw.api.web.util.PCDateUtil
uses gw.plugin.diff.impl.GLDiffHelper
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.lang.Math
uses java.util.Date
uses java.util.HashSet
uses java.util.Set
uses java.util.ArrayList
uses java.lang.Iterable
uses entity.windowed.GLCostVersionList
uses gw.api.util.JurisdictionMappingUtil
uses java.math.BigDecimal
uses gw.api.productmodel.Schedule
uses gw.lob.gl.schedule.GLScheduleHelper
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.rating.AbstractRatingEngine
uses gw.lob.gl.rating.GLSysTableRatingEngine
uses java.util.Map

@Export
class GLPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  var _line : entity.GeneralLiabilityLine
  
  construct(line : entity.GeneralLiabilityLine) {
    super(line)
    _line = line
  }

  override property get CoveredStates() : Jurisdiction[] {
    var covStates = new HashSet<Jurisdiction>()
    if (_line.BaseState != null) {
      covStates.add(_line.BaseState)
    }
    for (exp in _line.Exposures) {
      if (exp.Location != null) {
        covStates.add(JurisdictionMappingUtil.getJurisdiction(exp.Location))
      }
    }
    return covStates as Jurisdiction[]
  }

  override property get AllCoverages() : Coverage[] {
    return _line.GLLineCoverages
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.GLLineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.GLLineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var list : ArrayList<Coverable> = {_line}
    return list.toTypedArray()
  }
  
  override property get AllModifiables() : Modifiable[] {
    var list : ArrayList<Modifiable> = {_line}
    return list.toTypedArray()
  }

  override property get AllSchedules() : Schedule[] {
    return _line.CoveragesConditionsAndExclusionsFromCoverable.whereTypeIs(Schedule)
  }
  
  override property get Auditable() : boolean {
    return true  
  }

  /**
   * All GLCosts across the term, in window mode.
   */
  override property get CostVLs() : Iterable<GLCostVersionList> {
    return _line.VersionList.GLCosts
  }
  
  override property get Transactions() : Set<Transaction> {
    return _line.GLTransactions.toSet()
  }
  
  override function initialize() {
    _line.createCoveragesConditionsAndExclusions()
    _line.syncModifiers()
    _line.ClaimsMadeOrigEffDate = _line.Branch.PeriodStart
    _line.RetroactiveDate = _line.Branch.PeriodStart
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.GeneralLiabilityLine> {
    return new GLLineValidation(validationContext, _line)
  }

  /**
   * Indicates whether ChangeEditEffectiveDate (CEED) can be performed on this policy line.  If this returns
   * null or an empty string, that means the line thinks it's OK.   Otherwise, this method should returnan
   * error message indicating why ChangeEditEffectiveDate cannot be performed.
   * @return an error message if Edit Effective Date can't be changed, null or the empty String if it can
   */
  override function canSafelyCEED() : boolean {
    for (e in _line.Exposures) {
      if (e.BasedOn != null and (e.EventDates != e.BasedOn.EventDates)) {
        return false
      }
    }
    return true
  }
  
  override function preLocationDelete(location : PolicyLocation) { 
    for(exposure in getExistingOrFutureExposuresRelatedTo(location)) {
      if (exposure.EffectiveDate < location.SliceDate) {
        exposure.ExpirationDate = location.SliceDate
      } else {
        exposure.ExpirationDate = exposure.EffectiveDate  
      }
    }
  }
  
  override function checkLocationInUse(location : PolicyLocation) : boolean {
    return (not (getExistingOrFutureExposuresRelatedTo(location).Empty and getExistingOrFutureSchedulesRelatedTo(location).Empty)) or super.checkLocationInUse(location)
  }

  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    // Checking for schedules on the location
    var currentOrFutureSchedulesMap = getExistingOrFutureSchedulesRelatedTo(location)
        .partition(\ item -> (item as EffDated).EffectiveDate <= location.SliceDate ? SliceType.CURRENT : SliceType.FUTURE)
   
    var errorMsgForCurrentItems = currentOrFutureSchedulesMap.get(SliceType.CURRENT) != null ? getErrorMsgForScheduleItems(currentOrFutureSchedulesMap.get(SliceType.CURRENT)) : ""
    var errorMsgForFutureItems = currentOrFutureSchedulesMap.get(SliceType.FUTURE) != null ? getErrorMsgForScheduleItemsWithEffDate(currentOrFutureSchedulesMap.get(SliceType.FUTURE)) : ""

    if (isCurrentAndFutureItemExistInScheduledItemMap(currentOrFutureSchedulesMap)){
        return displaykey.Web.Policy.Schedule.Location.CannotDelete.HasCurrentAndFutureSchedules(location, errorMsgForCurrentItems, errorMsgForFutureItems)
    } else if (isCurrentItemExistsInScheduledItemMap(currentOrFutureSchedulesMap)){
        return displaykey.Web.Policy.Schedule.Location.CannotDelete.HasSchedules(location, errorMsgForCurrentItems)
    } else if (isFutureItemExistsInScheduledItemMap(currentOrFutureSchedulesMap)){
        return displaykey.Web.Policy.Schedule.Location.CannotDelete.HasFutureSchedules(location, errorMsgForFutureItems)
    }
    return super.canSafelyDeleteLocation(location)
  }
  
  private function getExistingOrFutureExposuresRelatedTo(location : PolicyLocation) : List<GLExposure> {
    return _line.VersionList.Exposures.flatMap(\ vl -> vl.AllVersions)
              .where(\ g -> g.Location.FixedId == location.FixedId and g.ExpirationDate > location.SliceDate)
  }
  
  private function getExistingOrFutureSchedulesRelatedTo(location : PolicyLocation) : List<ScheduledItem> {
    var glScheduleHelper = new GLScheduleHelper()
    return glScheduleHelper.getCurrentAndFutureScheduledItemsForPolicyLine(_line)
           .where(\ item -> (item as GLScheduledItem).PolicyLocation.FixedId == location.FixedId and (item as EffDated).ExpirationDate > location.SliceDate)
      
  }
  
  override function prorateBasesFromCancellation() {
    _line.Exposures.each(\ exposure -> {
        if (exposure.IsBasisScalable) {
          prorate(exposure)
        }
      })
  }
  
  override function prePeriodStartChanged(newDate : Date) {
    if (PCDateUtil.equalsIgnoreTime(_line.ClaimsMadeOrigEffDate, _line.Branch.PeriodStart)) {
      _line.ClaimsMadeOrigEffDate = newDate
    }
    if (PCDateUtil.equalsIgnoreTime(_line.RetroactiveDate, _line.Branch.PeriodStart)) {
      _line.RetroactiveDate = newDate
    }
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : GLDiffHelper {
    return new GLDiffHelper(reason, this._line, policyLine as GeneralLiabilityLine)
  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    if (cov.FixedId.Type == GeneralLiabilityCov.Type) {  
      return getGeneralLiabilityCovLimit(cov as GeneralLiabilityCov)
    }
    
    return BigDecimal.ZERO
  }

  override function cloneAutoNumberSequences() {
    _line.AllSchedules*.cloneAutoNumberSequence()
  }
  
  override function resetAutoNumberSequences() {
    _line.AllSchedules*.resetAutoNumberSequence()
  }
  
  override function bindAutoNumberSequences() {
    _line.AllSchedules*.bindAutoNumberSequence()
  }

  override function renumberAutoNumberSequences() {
    _line.AllSchedules*.renumberNewScheduledItems()
  }
  
  override property get AllCurrentAndFutureScheduledItems() : List<ScheduledItem> {
    return new GLScheduleHelper().getCurrentAndFutureScheduledItemsForPolicyLine(_line)
  }

  override function canDateSliceOnPropertyChange(bean : KeyableBean) : boolean {
    if (bean typeis GLExposure) {
      // Apply property changes to the above objects in window mode
      return false
    }
    return true
  }

  override property get PolicyLocationCanBeRemovedWithoutRemovingAssociatedRisks() : boolean {
    return true
  }

  override property get SupportsNonSpecificLocations() : boolean {
    return true
  }
  
  private function getGeneralLiabilityCovLimit(cov : GeneralLiabilityCov) : BigDecimal {
    switch (cov.PatternCode) {
      case "GLEmpBenefitsLiabilityCov":
        return cov.GLLine.GLEmpBenefitsLiabilityCov.GLEmpBenefitsAggLimitTerm.Value
      case "GLCGLCov":
        return cov.GLLine.GLCGLCov.GLCGLOccLimitTerm.Value
      case "GLUndergroundResourceCov":
        return cov.GLLine.GLUndergroundResourceCov.GLUndergroundResourceLimitTerm.Value
      default:
        return 0 
    }
  }
    
  //
  // PRIVATE SUPPORT FUNCTIONS
  //

  private function prorate(exposure: GLExposure) {
    var start = exposure.EffectiveDate
    var effDays = start.differenceInDays(exposure.ExpirationDate) as double
    var cancDays = start.differenceInDays(_line.Branch.CancellationDate) as double
    var ratio = cancDays / effDays
    exposure.BasisAmount = Math.round((exposure.BasisAmount.doubleValue() * ratio)) as int
  }

  override function createRatingEngine(method: RateMethod, parameters: Map<RateEngineParameter, Object>): AbstractRatingEngine<GLLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new GLSysTableRatingEngine(_line as GLLine)
    }
    return null
  }

  override property get BaseStateRequired(): boolean {
    return true
  }
}
