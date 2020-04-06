package gw.lob.bop

uses java.util.ArrayList
uses java.util.HashSet
uses java.util.Set
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.plugin.diff.impl.BOPDiffHelper
uses java.lang.Iterable
uses entity.windowed.BOPCostVersionList
uses gw.api.util.JurisdictionMappingUtil
uses java.math.BigDecimal
uses gw.api.domain.LineSpecificBuilding
uses entity.windowed.BOPBuildingVersionList
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.lob.bop.rating.BOPSysTableRatingEngine
uses gw.rating.AbstractRatingEngine
uses java.util.Map

/**
 * An implementation of PolicyLineMethods for {@link entity.BusinessOwnersLine BusinessOwnersLine}
 */
@Export
class BOPPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  var _line : entity.BusinessOwnersLine
  
  construct(line : entity.BusinessOwnersLine) {
    super(line)
    _line = line
  }
  
  override property get CoveredStates() : Jurisdiction[] {
    var covStates = new HashSet<Jurisdiction>()
    if (_line.BaseState != null) {
      covStates.add(_line.BaseState)
    }
    for (loc in _line.BOPLocations) {
      covStates.add(JurisdictionMappingUtil.getJurisdiction(loc.Location ))
    }
    return covStates as Jurisdiction[]
  }  

  override property get AllCoverages() : Coverage[] {
    var coverages = new ArrayList<Coverage>()
    coverages.addAll(_line.BOPLineCoverages.toList())
    coverages.addAll(_line.BOPLocations*.Coverages.toList())
    coverages.addAll(_line.BOPLocations*.Buildings*.Coverages.toList())
    return coverages as Coverage[]
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.BOPLineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.BOPLineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var list : ArrayList<Coverable> = {_line}
    _line.BOPLocations.each(\ location -> list.add(location))
    _line.BOPLocations.flatMap(\ location -> location.Buildings.toList()).each(\ building -> list.add(building))
    return list.toTypedArray()
  }

  override property get AllModifiables() : Modifiable[] {
    var list : ArrayList<Modifiable> = {_line}
    return list.toTypedArray()
  }
  
  override function initialize() {
    _line.syncModifiers()
    _line.initializeEquipmentAutoNumberSequence(_line.Bundle)
  }

  override function cloneAutoNumberSequences() {
    _line.cloneEquipmentAutoNumberSequence()
    for(var location in _line.BOPLocations) {
      location.Location.cloneBuildingAutoNumberSequence()
    }
  }
  
  override function resetAutoNumberSequences() {
    _line.resetEquipmentAutoNumberSequence()
    for(var location in _line.BOPLocations) {
      location.Location.resetBuildingAutoNumberSequence()
    }
  }
  
  override function bindAutoNumberSequences() {
    _line.bindEquipmentAutoNumberSequence()
    for(var location in _line.BOPLocations) {
      location.Location.bindBuildingAutoNumberSequence()
    }
  }

  override function renumberAutoNumberSequences() {
    _line.renumberNewScheduledEquipments()
    for(var location in _line.BOPLocations) {
      if(not location.New){ // if this is a new location, don't need to renumber
        location.Location.renumberBuildingAutoNumberSequence()
      }
    }
  }

  /**
  * All BOPCosts across the term, in window mode.
  */
  override property get CostVLs() : Iterable<BOPCostVersionList> {
    return _line.VersionList.BOPCosts
  }
  
  override property get Transactions() : Set<Transaction> {
    return _line.BOPTransactions.toSet()
  }
  
  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    var allBOPLocationsEverOnLocation = getAllBOPLocationsEverForLocation(location)
    var currentOrFutureBOPLocationsMap = allBOPLocationsEverOnLocation
      .where(\ bopLoc -> bopLoc.ExpirationDate > location.SliceDate)
      .partition(\ bopLoc -> bopLoc.EffectiveDate <= location.SliceDate ? "current" : "future")
    if (not (currentOrFutureBOPLocationsMap["current"] == null or currentOrFutureBOPLocationsMap["current"].Empty)) {
      return displaykey.BusinessOwners.Location.CannotDelete.HasBOPLocation(location)
    } else if (not (currentOrFutureBOPLocationsMap["future"] == null or currentOrFutureBOPLocationsMap["future"].Empty)) {
      var futureDatesStr = currentOrFutureBOPLocationsMap["future"].map(\ bVeh -> bVeh.EffectiveDate).order().join(", ")
      return displaykey.BusinessOwners.Location.CannotDelete.HasFutureBOPLocation(location, futureDatesStr)
    }
    return super.canSafelyDeleteLocation(location)
  }
  
  override function checkLocationInUse(location : PolicyLocation) : boolean {
    var hasCurrentOrFutureBOPLocationForLocation = getAllBOPLocationsEverForLocation(location).hasMatch(\ bopLoc -> bopLoc.ExpirationDate > location.SliceDate)
    return hasCurrentOrFutureBOPLocationForLocation or super.checkLocationInUse(location)
  }

  private function getAllBOPLocationsEverForLocation(location : PolicyLocation) : List<BOPLocation> {
   return _line.VersionList.BOPLocations.allVersionsFlat<BOPLocation>().where(\ cpLoc -> cpLoc.Location.FixedId == location.FixedId)
  }
  
  override function onPrimaryLocationCreation(location : PolicyLocation) {
    _line.addToLineSpecificLocations(location.AccountLocation)
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.BusinessOwnersLine> {
    return new BOPLineValidation(validationContext, _line )
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : BOPDiffHelper {
    return new BOPDiffHelper(reason, this._line, policyLine as BusinessOwnersLine)
  }
    
  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch(cov.FixedId.Type) {
      //BOP Line
      case entity.BOPBuildingCov.Type:  
        return getBOPBuildingCovLimit(cov as entity.BOPBuildingCov)
      case BusinessOwnersCov.Type:
        return getBusinessOwnersCovLimit(cov as BusinessOwnersCov)
      case BOPLocationCov.Type:
        return getBOPLocationCovLimit(cov as BOPLocationCov)
    }
    return BigDecimal.ZERO
  }

  override property get ContainsBuildings() : boolean {
    return true
  }

  override function getAllLineBuildingsEver() : List<LineSpecificBuilding> {
    return _line.VersionList.BOPLocations.arrays<BOPBuildingVersionList>("Buildings").allVersionsFlat<BOPBuilding>()
  }

  override protected function getCannotDeleteBuildingMessage(building : Building) : String {
    return displaykey.BusinessOwners.Building.CannotDelete.HasBOPBuilding(building)
  }

  override protected function getCannotDeleteBuildingFutureMessage(building : Building, dates : String) : String {
    return displaykey.BusinessOwners.Building.CannotDelete.HasFutureBOPBuilding(building, dates)
  }

  override property get EmergencyServiceFunding() : boolean {
    return true  
  }
  
  override function validateLocations(location : PolicyLocation) {
    BOPLocationValidation.validateBOPLocation(location)
  }
  
  override function validateSubmissionWizardPolicyInfo(period : PolicyPeriod) {
    BOPPolicyInfoValidation.validateFields(period.BOPLine)
  }

  private function getCurrentOrFutureBOPBuildingsForBuilding(building : Building) : List<BOPBuilding> {
    var allBOPLocationsEver = _line.VersionList.BOPLocations.flatMap(\l -> l.AllVersions)
    var allBOPBuildingsEver = allBOPLocationsEver.flatMap(\ l -> l.VersionList.Buildings.flatMap(\ bvl -> bvl.AllVersions))
    return allBOPBuildingsEver.where(\ bopb -> bopb.Building.FixedId == building.FixedId and bopb.ExpirationDate > building.SliceDate)
  }

  private function getBusinessOwnersCovLimit(cov : BusinessOwnersCov) : BigDecimal {
    switch(cov.PatternCode){
      case "BOPLiabilityCov": 
        return cov.BOPLine.BOPLiabilityCov.BOPLiabilityTerm.PackageValue.PackageTerms*.Value.max()
      case "BOPComputerFraudCov":
        return cov.BOPLine.BOPComputerFraudCov.BOPComputerFraudLimTerm.Value
      case "BOPToolsSchedCov":
        return cov.BOPLine.BOPToolsSchedCov.BOPToolsSchedLimTerm.Value
      case "BOPToolsInstallUnschedCov":
        return cov.BOPLine.BOPToolsInstallUnschedCov.BOPInstallationLimTerm.PackageValue.PackageTerms.singleWhere(\ p -> p.AggregationModel == CovTermModelAgg.TC_AG).Value
      case "BOPEmpBenefits":
        return cov.BOPLine.BOPEmpBenefits.BOPEmpBenAggLimTerm.Value
      case "BOPEmpDisCov":
        var employeeLimit = cov.BOPLine.BOPEmpDisCov.BOPEmpDisLimitTerm.Value
        var numEmployees = cov.BOPLine.BOPEmpDisCov.BOPEmpDisNumEmpTerm.Value
        var numLocations = cov.BOPLine.BOPEmpDisCov.BOPEmpDisNumLocTerm.Value
        return employeeLimit * numEmployees * numLocations
      case "BOPForgeAltCov":
        return cov.BOPLine.BOPForgeAltCov.BOPForgeAltLimitTerm.Value
      case "BOPGuestPropCov":
        return cov.BOPLine.BOPGuestPropCov.GuestPropOccLimTerm.Value
      case "BOPGuestSafeDepCov":
        return cov.BOPLine.BOPGuestSafeDepCov.BOPGuestSafeDepLimitTerm.Value
      case "BOPFungiPropCov":
        return cov.BOPLine.BOPFungiPropCov.BOPFungiPropLimTerm.Value
      case "BOPLiquorCov":  //probably needs some work
        return cov.BOPLine.BOPLiquorCov.BOPLiquorAggLimTerm.Value
      default:
        return 0
    }
  }
  
  private function getBOPLocationCovLimit(cov : BOPLocationCov) : BigDecimal {
    var tiv : BigDecimal = 0
    var location = cov.BOPLocation
    switch(cov.PatternCode){
      case "BOPBurgRobCov": 
        return location.BOPBurgRobCov.BOPBurgRobLimTerm.Value
      case "BOPY2KIncomeExpenseCov":
        return location.BOPY2KIncomeExpenseCov.BOPY2KIncomeExpenseLimTerm.Value
      case "BOPMoneySecCov":
        tiv = addNullSafe(tiv, location.BOPMoneySecCov.BOPMoneyOnPremLimTerm.Value)
        tiv = addNullSafe(tiv, location.BOPMoneySecCov.BOPMoneyOffPremLimTerm.Value)
        return tiv
      case "BOPOutdoorProp":
        return location.BOPOutdoorProp.BOPOutdoorPropLimTerm.PackageValue.PackageTerms.singleWhere(\ p -> p.AggregationModel == CovTermModelAgg.TC_AG).Value
      case "BOPOutSignCov":
        return location.BOPOutSignCov.BOPOutdoorSignLimTerm.Value
      case "BOPPersonalEffects":
        return location.BOPPersonalEffects.BOPPersEffectsLimTerm.Value
      default:
        return 0
    }
  }

  private function getBOPBuildingCovLimit(cov: entity.BOPBuildingCov): BigDecimal {
    var building = cov.BOPBuilding
    switch (cov.PatternCode) {
      case "BOPReceivablesCov":
          return building.BOPReceivablesCov.BOPARonPremLimTerm.Value
      case "BOPBuildingCov":
          return building.BOPBuildingCov.BOPBldgLimTerm.Value
      case "BOPPersonalPropCov":
          return building.BOPPersonalPropCov.BOPBPPBldgLimTerm.Value
      case "BOPCondoUnitOwnCov":
          return building.BOPCondoUnitOwnCov.CondoOwnerLimitTerm.Value
      case "BOPElectricalSchedCov":
          return building.BOPElectricalSchedCov.BOPElectricalSchedLimitTerm.Value
      case "BOPFuncPerPropCov":
          return building.BOPFuncPerPropCov.BOPFuncPerPropLimTerm.Value
      case "BOPMineSubCov":
          return building.BOPMineSubCov.BOPMineSubLimTerm.Value
      case "BOPOrdinanceCov":
          var tiv = BigDecimal.ZERO
          tiv = addNullSafe(tiv, building.BOPOrdinanceCov.BOPOrdLawCov23LimTerm.Value)
          tiv = addNullSafe(tiv, building.BOPOrdinanceCov.BOPOrdLawCov2LimTerm.Value)
          tiv = addNullSafe(tiv, building.BOPOrdinanceCov.BOPOrdLawCov3LimTerm.Value)
          return tiv
      case "BOPTenantsLiabilityCov":
          return building.BOPTenantsLiabilityCov.BOPTenantsLiabLimTerm.Value
      case "BOPValuablePapersCov":
          return building.BOPValuablePapersCov.BOPValPaperOnPremLimTerm.Value
        default:
        return 0
    }
  }

  override function createRatingEngine(method: RateMethod, parameters: Map<RateEngineParameter, Object>): AbstractRatingEngine<BOPLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new BOPSysTableRatingEngine(_line as BOPLine)
    }
    return null
  }

  override property get BaseStateRequired(): boolean {
    return true
  }
}
