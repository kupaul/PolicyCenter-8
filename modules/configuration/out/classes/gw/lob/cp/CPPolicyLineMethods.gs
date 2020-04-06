package gw.lob.cp

uses entity.windowed.CPCostVersionList
uses entity.windowed.CPBuildingVersionList
uses entity.windowed.CPBuildingCovVersionList
uses entity.windowed.CPLocationCovVersionList
uses gw.api.domain.LineSpecificBuilding
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.api.tree.RowTreeRootNode
uses gw.api.util.JurisdictionMappingUtil
uses gw.lob.cp.rating.CPRatingEngine
uses gw.lob.cp.rating.CPSysTableRatingEngine
uses gw.plugin.diff.impl.CPDiffHelper
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.rating.AbstractRatingEngine
uses gw.rating.worksheet.treenode.WorksheetTreeNodeContainer
uses gw.rating.worksheet.treenode.WorksheetTreeNodeUtil

uses java.lang.Iterable
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Map
uses java.util.Set
uses java.util.TreeMap

@Export
class CPPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  var _line : entity.CommercialPropertyLine

  construct(line : entity.CommercialPropertyLine) {
    super(line)
    _line = line
  }

  override function initialize() {
    _line.createCoveragesConditionsAndExclusions()
    _line.syncModifiers()
    _line.initializeCPBlanketAutoNumberSequence(_line.Bundle)
  }

  override function onPrimaryLocationCreation(location : PolicyLocation) {
    _line.addToLineSpecificLocations(location.AccountLocation)
  }

  override property get Transactions() : Set<Transaction> {
    return _line.CPTransactions.toSet()
  }

  override property get CoveredStates() : Jurisdiction[] {
    var covStates : Set<Jurisdiction> = {}
    if (_line.BaseState != null) {
      covStates.add(_line.BaseState)
    }
    for (loc in _line.CPLocations) {
      covStates.add(JurisdictionMappingUtil.getJurisdiction(loc.Location))
    }
    return covStates.toTypedArray()
  }

  override property get AllCoverages() : Coverage[] {
    var locations = _line.CPLocations
    var coverages = (locations*.Buildings*.Coverages as Coverage[]).toList()
    coverages.addAll(locations*.Coverages.toList())
    coverages.addAll(_line.CPLineCoverages.toList())
    return coverages.toTypedArray()
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.CPLineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.CPLineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var locations = _line.CPLocations.toList()
    var coverables = (locations*.Buildings as Coverable[]).toList()
    coverables.addAll(locations)
    coverables.add(_line)
    return coverables.toTypedArray()
  }

  override property get AllModifiables() : Modifiable[] {
    var list : ArrayList<Modifiable> = {_line}
    return list.toTypedArray()
  }

  override property get SupportsRatingOverrides() : boolean {
    return true
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.CommercialPropertyLine> {
    return new CPLineValidation(validationContext, _line)
  }

  override function cloneAutoNumberSequences() {
    _line.CPLocations.each(\ location -> location.Location.cloneBuildingAutoNumberSequence())
    _line.cloneCPBlanketAutoNumberSequence()
  }

  override function resetAutoNumberSequences() {
    _line.CPLocations.each(\ location -> location.Location.resetBuildingAutoNumberSequence())
    _line.resetCPBlanketAutoNumberSequence()
  }

  override function bindAutoNumberSequences() {
    _line.CPLocations.each(\ location -> location.Location.bindBuildingAutoNumberSequence())
    _line.bindCPBlanketAutoNumberSequence()
  }

  override function renumberAutoNumberSequences() {
    _line.CPLocations.each(\ location -> location.Location.renumberBuildingAutoNumberSequence())
    _line.renumberNewCPBlankets()
  }

  /**
   * All CPCosts across the term, in window mode.
   */
  override property get CostVLs() : Iterable<CPCostVersionList> {
    return _line.VersionList.CPCosts
  }

  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    var allCPLocationsEverOnLocation = getAllCPLocationsEverForLocation(location)
    var currentOrFutureCPLocationsMap = allCPLocationsEverOnLocation
      .where(\ CPLoc -> CPLoc.ExpirationDate > location.SliceDate)
      .partition(\ CPLoc -> CPLoc.EffectiveDate <= location.SliceDate ? "current" : "future")
    if (not (currentOrFutureCPLocationsMap["current"] == null or currentOrFutureCPLocationsMap["current"].Empty)) {
      return displaykey.CommercialProperty.Location.CannotDelete.HasCPLocation(location)
    } else if (not (currentOrFutureCPLocationsMap["future"] == null or currentOrFutureCPLocationsMap["future"].Empty)) {
      var futureDatesStr = currentOrFutureCPLocationsMap["future"].map(\ bVeh -> bVeh.EffectiveDate).order().join(", ")
      return displaykey.CommercialProperty.Location.CannotDelete.HasFutureCPLocation(location, futureDatesStr)
    }
    return super.canSafelyDeleteLocation(location)
  }

  override function checkLocationInUse(location : PolicyLocation ) : boolean {
    var hasCurrentOrFutureCPLocationForLocation = getAllCPLocationsEverForLocation(location).hasMatch(\ CPLoc -> CPLoc.ExpirationDate > location.SliceDate)
    return hasCurrentOrFutureCPLocationForLocation or super.checkLocationInUse(location)
  }

  override function getAllLineBuildingsEver() : List<LineSpecificBuilding> {
    return _line.VersionList.CPLocations.arrays<CPBuildingVersionList>("Buildings").allVersionsFlat<CPBuilding>() as List<LineSpecificBuilding>
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : CPDiffHelper {
    return new CPDiffHelper(reason, this._line, policyLine as CommercialPropertyLine)
  }

  override function preLoadCoverages() {
    var oldLocations = _line.BasedOn.VersionList.CPLocations
    if (oldLocations <> null) {
      oldLocations.arrays<CPLocationCovVersionList>("Coverages")
      oldLocations.arrays<CPBuildingVersionList>("Buildings").arrays<CPBuildingCovVersionList>("Coverages")
    }
    var locations = _line.VersionList.CPLocations
    locations.arrays<CPLocationCovVersionList>("Coverages")
    locations.arrays<CPBuildingVersionList>("Buildings").arrays<CPBuildingCovVersionList>("Coverages")
  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch (cov.FixedId.Type) {
      //Commercial Property Line
      case CPBuildingCov.Type:  
        return getCPBuildingCovLimit(cov as CPBuildingCov)
      case entity.CPBlanketCov.Type:
      case CPLocationCov.Type:
      case CommercialPropertyCov.Type:
      // no TIV for these?
        break
    }
    return BigDecimal.ZERO
  }
  
  override property get EmergencyServiceFunding() : boolean {
    return true  
  }

  override protected function getCannotDeleteBuildingMessage(building : Building) : String {
    return displaykey.CommercialProperty.Building.CannotDelete.HasCPBuilding(building)
  }

  override protected function getCannotDeleteBuildingFutureMessage(building : Building, dates : String) : String {
    return displaykey.CommercialProperty.Building.CannotDelete.HasFutureCPBuilding(building, dates)
  }

  override property get ContainsBuildings() : boolean {
    return true
  }
  
  private function getCPBuildingCovLimit(cov : CPBuildingCov) : BigDecimal {
    var building = cov.CPBuilding
    switch (cov.PatternCode){
      case "CPBldgCov":
        return building.CPBldgCov.CPBldgCovLimitTerm.Value
      case "CPBldgBusIncomeCov":
        return {building.CPBldgBusIncomeCov.BusIncomeMfgLimitTerm.Value,
          building.CPBldgBusIncomeCov.BusIncomeOtherLimitTerm.Value,
          building.CPBldgBusIncomeCov.BusIncomeRentalLimitTerm.Value}
          .where(\ b -> b <> null ).sum()
      case "CPBldgExtraExpenseCov": 
        return building.CPBldgExtraExpenseCov.CPBldgExtraExpenseCovLimitTerm.Value
      case "CPBldgStockCov":
        return building.CPBldgStockCov.CPBldgStockCovLimitTerm.Value
      case "CPBPPCov":
        return building.CPBPPCov.CPBPPCovLimitTerm.Value
      default:
        return 0
    }
  }

  private function getAllCPLocationsEverForLocation(location : PolicyLocation) : List<CPLocation> {
    return _line.VersionList.CPLocations.allVersionsFlat<CPLocation>().where(\ cpLoc -> cpLoc.Location.FixedId == location.FixedId)
  }

  override function getWorksheetRootNode(showConditionals: boolean): RowTreeRootNode {
    var treeNodes: List <WorksheetTreeNodeContainer> = {}
    var allCosts = _line.Costs.cast(CPCost)
    var costsByLocation = allCosts.toSet().byFixedLocation()
    var locations = costsByLocation.Keys.where(\c -> c.Location != null).orderBy(\c -> c.DisplayName)
    locations.each(\location -> {
      var locationContainer = new WorksheetTreeNodeContainer(location.DisplayName)
      locationContainer.ExpandByDefault = true
      var costsByBuilding = costsByLocation.get(location).byFixedBuilding()
      var buildings = costsByBuilding.Keys.toTypedArray().orderBy(\c -> c.DisplayName)
      buildings.each(\building -> {
        var buildingContainer = new WorksheetTreeNodeContainer(building.DisplayName)
        buildingContainer.ExpandByDefault = true
        locationContainer.addChild(buildingContainer)
        var buildingCosts = costsByBuilding.get(building).orderBy(\cost -> cost.DisplayName)
        var sortedCostMap = new TreeMap <String, CPCost>()
        buildingCosts.each(\cost -> {
          var costWithWorksheet = cost
          while (costWithWorksheet.RatingWorksheet == null and costWithWorksheet.BasedOn != null) {
            costWithWorksheet = costWithWorksheet.BasedOn
          }
          var displayName = cost.DisplayName
          if (cost.Prorated) {
            displayName += " (${cost.EffectiveDate.ShortFormat} - ${cost.ExpirationDate.ShortFormat})"
          }
          sortedCostMap.put(displayName, costWithWorksheet)
        })
        sortedCostMap.eachKeyAndValue(\displayName, cost -> {
          var costContainer = new WorksheetTreeNodeContainer(displayName)
          buildingContainer.addChild(costContainer)
          costContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(cost, showConditionals))
        })
      })
      treeNodes.add(locationContainer)
    })
    // other charges
    var otherCharges = allCosts.where(\cost -> cost.Location == null).orderBy(\c -> c.DisplayName)
    otherCharges.each(\other -> {
      var otherContainer = new WorksheetTreeNodeContainer(other.DisplayName)
      otherContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(other, showConditionals))
      treeNodes.add(otherContainer)
    })
    
    // non-cost worksheets
    // Note that this is only worksheets created by the current branch.
    var nonCost = _line.Branch.AllBeansWithWorksheets.entrySet().where(\ e -> not (e.Key typeis CPCost))
    nonCost.each(\ nc -> {
      var container = new WorksheetTreeNodeContainer(nc.Key.DisplayName)
      nc.Value.each(\ ws -> container.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(ws, showConditionals)))
      treeNodes.add(container)
    })
    
    return WorksheetTreeNodeUtil.buildRootNode(treeNodes)
  }

  override function createRatingEngine(method: RateMethod, parameters: Map<RateEngineParameter, Object>): AbstractRatingEngine {
    if (RateMethod.TC_SYSTABLE == method) {
      return new CPSysTableRatingEngine(_line)
    }
    return new CPRatingEngine(_line as CPLine, parameters[RateEngineParameter.TC_RATEBOOKSTATUS] as RateBookStatus)
  }

  override property get BaseStateRequired(): boolean {
    return true
  }
}
