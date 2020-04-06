package gw.lob.ba
uses entity.windowed.BACostVersionList
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.api.util.JurisdictionMappingUtil
uses gw.lob.ba.rating.BASysTableRatingEngine
uses gw.plugin.diff.impl.BADiffHelper
uses gw.policy.PolicyLineValidation
uses gw.rating.AbstractRatingEngine
uses gw.validation.PCValidationContext

uses java.lang.IllegalStateException
uses java.lang.Iterable
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.HashSet
uses java.util.Map
uses java.util.Set

@Export    
class BAPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  
  var _line : entity.BusinessAutoLine
  
  construct(line : entity.BusinessAutoLine) {
    super(line)
    _line = line
  }
  
  override function syncComputedValues() {
    syncAllScheduleRateModifiers()
    _line.syncJurisdictions()
    _line.syncCoverageSymbolGroups()
  }

  override property get CoveredStates() : Jurisdiction[] {
    // includes states with one or more vehicles or state-level coverage
    var covStates = garageStatesAsSet()
    for (juris in _line.Jurisdictions) {
      covStates.add(juris.State)
    }
    return covStates.toArray(new Jurisdiction[covStates.size()])
  }

  override property get AllCoverages() : Coverage[] {
    var covs = new ArrayList<Coverage>()
    covs.addAll(_line.Vehicles*.Coverages.toList())
    covs.addAll(_line.Jurisdictions*.Coverages.toList())
    covs.addAll(_line.BALineCoverages.toList())
    return covs as Coverage[]
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.BALineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.BALineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var list : ArrayList<Coverable> = {_line}
    _line.Vehicles.each(\ v -> list.add(v))
    _line.Jurisdictions.each(\ j -> list.add(j))
    return list.toTypedArray()
  }
  
  override property get AllModifiables() : Modifiable[] {
    var list : ArrayList<Modifiable> = {_line}
    return list.toTypedArray()
  }
  
  private function garageStatesAsSet() : Set<Jurisdiction> {
    var states = new HashSet<Jurisdiction>()

    for (vehicle in _line.Vehicles) {
      if (vehicle.Location.State == null) {
        throw new IllegalStateException(displaykey.BusinessAuto.Vehicle.NoState)
      }
      states.add(JurisdictionMappingUtil.getJurisdiction(vehicle.Location))
    }
    return states
  }

  override function initialize() {
    _line.syncModifiers()
    _line.initializeVehicleAutoNumberSequence(_line.Bundle)
    _line.createCoveragesConditionsAndExclusions()
  }

  override function cloneAutoNumberSequences() {
    _line.cloneVehicleAutoNumberSequence()
  }
  
  override function resetAutoNumberSequences() {
    _line.resetVehicleAutoNumberSequence()
  }
  
  override function bindAutoNumberSequences() {
    _line.bindVehicleAutoNumberSequence()
  }
  
  override function renumberAutoNumberSequences() {
    _line.renumberNewVehicles()
  }

  /**
   * All BACosts across the term, in window mode.
   */
  override property get CostVLs() : Iterable<BACostVersionList> {
    return _line.VersionList.BACosts
  }
  
  override property get Transactions() : Set<Transaction> {
    return _line.BATransactions.toSet()
  }
  
  override function canSafelyDeleteLocation( location : PolicyLocation ) : String {
    var allVehiclesEverGaragedAtLocation = getAllVehiclesEverGaragedAtLocation(location)
    var currentOrFutureVehiclesMap = allVehiclesEverGaragedAtLocation
      .where(\ bVeh -> bVeh.ExpirationDate > location.SliceDate)
      .partition(\ bVeh -> bVeh.EffectiveDate <= location.SliceDate ? "current" : "future")
    if (not (currentOrFutureVehiclesMap["current"] == null or currentOrFutureVehiclesMap["current"].Empty)) {
      var currentVehiclesStr = currentOrFutureVehiclesMap["current"].order().join(", ")
      return displaykey.BusinessAuto.Location.CannotDelete.HasVehicles(currentVehiclesStr)
    } else if (not (currentOrFutureVehiclesMap["future"] == null or currentOrFutureVehiclesMap["future"].Empty)) {
      var futureVehiclesStr = currentOrFutureVehiclesMap["future"].order().join(", ")
      var futureDatesStr = currentOrFutureVehiclesMap["future"].map(\ bVeh -> bVeh.EffectiveDate).order().join(", ")
      return displaykey.BusinessAuto.Location.CannotDelete.HasFutureVehicles(futureVehiclesStr, futureDatesStr)
    }
    return super.canSafelyDeleteLocation(location)
  }

  override function checkLocationInUse(location : PolicyLocation) : boolean {
    var hasCurrentOrFutureVehiclesGaragedAtLocation = getAllVehiclesEverGaragedAtLocation(location).hasMatch(\ bVeh -> bVeh.ExpirationDate > location.SliceDate)
    return hasCurrentOrFutureVehiclesGaragedAtLocation or super.checkLocationInUse(location)
  }
  
  private function getAllVehiclesEverGaragedAtLocation(location : PolicyLocation) : List<BusinessVehicle> {
    return _line.VersionList.Vehicles.flatMap(\ vl -> vl.AllVersions).where(\ veh -> veh.Location.FixedId == location.FixedId)
  }
  
  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.BusinessAutoLine> {
    return new BALineValidation(validationContext, _line)
  }
  
  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : BADiffHelper {
    return new BADiffHelper(reason, this._line, policyLine as BusinessAutoLine)
  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch (cov.FixedId.Type) {
      case BAStateCov.Type:
        return getBAStateCovLimit(cov as BAStateCov)
      case BusinessAutoCov.Type:
        return getBAAutoCovLimit(cov as BusinessAutoCov)
      case BusinessVehicleCov.Type:
        return getBAVehicleLimit(cov as BusinessVehicleCov)
    }
    return BigDecimal.ZERO
  }

  override function validateSubmissionWizardPolicyInfo(period : PolicyPeriod) {
    BALineValidation.validatePolicyContacts(period.BusinessAutoLine)
  }

  private function getBAStateCovLimit(cov : BAStateCov) : BigDecimal {
    var jurisdiction = cov.BAJurisdiction
    switch (cov.PatternCode) {
      case "BAPropProtectionCov":
        return jurisdiction.BAPropProtectionCov.BAPropProtectLimitTerm.Value
      default:
        return 0 
    }
  }

  private function getBAAutoCovLimit(cov : BusinessAutoCov) : BigDecimal {
    switch (cov.PatternCode) {
      case "BADealerLimitLiabCov":
        return cov.BALine.BADealerLimitLiabCov.BADealerLimitLiabLimitTerm.PackageValue.PackageTerms.sum(\ p -> p.Value)
      case "BAHiredLiabilityCov":
        return cov.BALine.BAHiredLiabilityCov.BAHiredLiabilityBITerm.PackageValue.PackageTerms.singleWhere(\ p -> p.AggregationModel == CovTermModelAgg.TC_PO).Value
      case "BAOwnedLiabilityCov":
        return cov.BALine.BAOwnedLiabilityCov.BAOwnedLiabilityLimitTerm.PackageValue.PackageTerms.where(\ p -> p.AggregationModel == CovTermModelAgg.TC_PO or p.AggregationModel == CovTermModelAgg.TC_EA).sum(\ p -> p.Value)
      case "BAOwnedMedPayCov":
        return cov.BALine.BAOwnedMedPayCov.BAOwnedMedPayLimitTerm.Value  
      case "BANonownedLiabCov":
        return cov.BALine.BANonownedLiabCov.BANonownedLiabBITerm.PackageValue.PackageTerms.where(\ p -> p.AggregationModel == CovTermModelAgg.TC_PO or p.AggregationModel == CovTermModelAgg.TC_EA).sum(\ p -> p.Value)
      case "BADOCLiabilityCov":
        return cov.BALine.BADOCLiabilityCov.BADOCLiabilityLiabTerm.PackageValue.PackageTerms*.Value.sum()
      case "BASeasonTrailerLiabCov":
        return cov.BALine.BASeasonTrailerLiabCov.BASeasonTrailerLiabLimitTerm.Value
      default:
        return 0 
    }
  }

  private function getBAVehicleLimit(cov: BusinessVehicleCov): BigDecimal {
    switch (cov.PatternCode) {
      case "BAAudVisDataEqip2Cov":
          return cov.Vehicle.BAAudVisDataEqip2Cov.BAAudVisDataEquipLimTerm.Value
      case "BATapeDiscRecordCov":
          return cov.Vehicle.BATapeDiscRecordCov.BATapeDiscLimitTerm.Value
      case "BATowingLaborCov":
          return cov.Vehicle.BATowingLaborCov.BATowTerm.Value
      case "BARentalCov":
          var days = cov.Vehicle.BARentalCov.BARentalTerm.PackageValue.PackageTerms.singleWhere(\p -> p.Name == "Num Days").Value
          var perDayLimit = cov.Vehicle.BARentalCov.BARentalTerm.PackageValue.PackageTerms.singleWhere(\p -> p.Name == "Per Day Limit").Value
          return days * perDayLimit
        default:
        return 0
    }
  }

  override function createRatingEngine(method: RateMethod, parameters: Map<RateEngineParameter, Object>): AbstractRatingEngine<entity.BusinessAutoLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new BASysTableRatingEngine(_line as BusinessAutoLine)
    }
    return null
  }

  override property get BaseStateRequired(): boolean {
    return true
  }
}
