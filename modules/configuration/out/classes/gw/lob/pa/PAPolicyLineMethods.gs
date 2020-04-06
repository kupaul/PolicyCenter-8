package gw.lob.pa

uses java.util.ArrayList
uses java.util.Set
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.plugin.diff.impl.PADiffHelper
uses gw.api.productmodel.CoveragePattern
uses gw.api.copy.CompositeCopier
uses java.lang.Iterable
uses entity.windowed.PACostVersionList
uses java.math.BigDecimal
uses gw.api.tree.RowTreeRootNode
uses gw.rating.worksheet.treenode.WorksheetTreeNodeUtil
uses gw.rating.worksheet.treenode.WorksheetTreeNodeContainer
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.lob.common.UnderwriterEvaluator
uses gw.policy.PolicyEvalContext
uses gw.api.match.MatchableTreeTraverserConfig
uses gw.job.sxs.PersonalAutoSideBySideInitialConfig
uses gw.job.sxs.PersonalAutoSideBySideBaseDataConfig
uses gw.job.sxs.SideBySideInitialConfig
uses gw.rating.AbstractRatingEngine
uses gw.lob.pa.rating.PASysTableRatingEngine
uses gw.lob.pa.rating.PARatingEngine
uses java.util.Map
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.system.PCLoggerCategory

@Export
class PAPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  var _line : entity.PersonalAutoLine

  construct(line : entity.PersonalAutoLine) {
    super(line)
    _line = line
  }

  override property get CoveredStates() : Jurisdiction[] {
    return new Jurisdiction[]{_line.BaseState}
  }

  override property get AllCoverages() : Coverage[] {
    var covs = new ArrayList<Coverage>()
    covs.addAll(_line.PALineCoverages.toList())
    covs.addAll(_line.Vehicles*.Coverages.toList())
    return covs as Coverage[]
  }

  override property get AllExclusions() : Exclusion[] {
    return _line.PALineExclusions
  }

  override property get AllConditions() : PolicyCondition[] {
    return _line.PALineConditions
  }

  override property get AllCoverables() : Coverable[] {
    var list : ArrayList<Coverable> = {_line}
    _line.Vehicles.each(\ v -> list.add(v))
    return list.toTypedArray()
  }

  override property get AllModifiables() : Modifiable[] {
    var list : ArrayList<Modifiable> = {_line}
    _line.Vehicles.each(\ v -> list.add(v))
    return list.toTypedArray()
  }

  override function initialize() {
    _line.syncModifiers()
    _line.initializeVehicleAutoNumberSequence(_line.Bundle)
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

  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    var allVehiclesEverGaragedAtLocation = getAllVehiclesEverGaragedAtLocation(location)
    var currentOrFutureVehiclesMap = allVehiclesEverGaragedAtLocation
      .where(\ pVeh -> pVeh.ExpirationDate > location.SliceDate)
      .partition(\ pVeh -> pVeh.EffectiveDate <= location.SliceDate ? "current" : "future")
    if (not (currentOrFutureVehiclesMap["current"] == null or currentOrFutureVehiclesMap["current"].Empty)) {
      var currentVehiclesStr = currentOrFutureVehiclesMap["current"].order().join(", ")
      return displaykey.PersonalAuto.Location.CannotDelete.HasVehicles(currentVehiclesStr)
    } else if (not (currentOrFutureVehiclesMap["future"] == null or currentOrFutureVehiclesMap["future"].Empty)) {
      var futureVehiclesStr = currentOrFutureVehiclesMap["future"].order().join(", ")
      var futureDatesStr = currentOrFutureVehiclesMap["future"].map(\ pVeh -> pVeh.EffectiveDate).order().join(", ")
      return displaykey.PersonalAuto.Location.CannotDelete.HasFutureVehicles(futureVehiclesStr, futureDatesStr)
    }
    return ""  // PA doesn't care about the primary location, so it won't chain to the super's impl the way the other lines do
  }

  override function checkLocationInUse(location : PolicyLocation) : boolean {
    var hasCurrentOrFutureVehiclesGaragedAtLocation = getAllVehiclesEverGaragedAtLocation(location).hasMatch(\ pVeh -> pVeh.ExpirationDate > location.SliceDate)
    return hasCurrentOrFutureVehiclesGaragedAtLocation // PA doesn't care about the primary location, so it won't chain to the super's impl the way the other lines do
  }

  private function getAllVehiclesEverGaragedAtLocation(location : PolicyLocation) : List<PersonalVehicle> {
    return _line.VersionList.Vehicles.flatMap(\ vl -> vl.AllVersions).where(\ veh -> veh.GarageLocation.FixedId == location.FixedId)
  }

  /**
   * All PACosts across the term, in window mode.
   */
  override property get CostVLs() : Iterable<PACostVersionList> {
    return _line.VersionList.PACosts
  }

  override property get Transactions() : Set<Transaction> {
    return _line.PATransactions.toSet()
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.PersonalAutoLine>  {
    if (ValidationLevel.TC_QUICKQUOTABLE == validationContext.Level) {
      return new PALineQuickQuoteValidation(validationContext, _line)
    } else {
      return new PALineValidation(validationContext, _line)
    }
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : PADiffHelper {
    return new PADiffHelper(reason, this._line, policyLine as entity.PersonalAutoLine)
  }

  override function getCostForCoverage(covered : Coverable, covPat : CoveragePattern) : Cost {
    return _line.Branch.AllCosts.firstWhere(\ cost -> {
      return cost typeis PACost and
             cost.Coverage != null and
             cost.Coverage.Pattern.Code == covPat.Code and
             cost.Coverage.OwningCoverable == covered
    }) as PACost
  }

  override function getAllCostsForCoverage(covered : Coverable, covPat : CoveragePattern) : List<Cost> {
    return _line.Branch.AllCosts.where(\ cost -> {
      return cost typeis PACost and
             cost.Coverage != null and
             cost.Coverage.Pattern.Code == covPat.Code and
             cost.Coverage.OwningCoverable == covered
    })
  }

  override function getQuoteValidationLevel(qType : QuoteType) : ValidationLevel {
    if (qType == QuoteType.TC_QUICK) {
      return ValidationLevel.TC_QUICKQUOTABLE
    } else {
      return ValidationLevel.TC_QUOTABLE
    }
  }

  override function getQuoteRatingStyle(qType : QuoteType) : RatingStyle {
    if (qType == QuoteType.TC_QUICK) {
      return RatingStyle.TC_QUICKQUOTE
    } else {
      return RatingStyle.TC_DEFAULT
    }
  }

  override property get Copier() : CompositeCopier<PolicyPeriod, PersonalAutoLine> {
    return new PAPolicyLineCopier(_line)
  }

  override function postCreateDraftBranchInNewPeriod() {
    this._line.initializeIncidentSummaries()
  }

  override function postCopyBranchIntoNewPolicy() {
    this._line.initializeIncidentSummaries()
  }

  override function onBeginIssueJob() {

    var period = _line.Branch
    var allDriversGoodToOrder = _line.PolicyDrivers.where(\ d -> not d.DoNotOrderMVR)

    //check if any drivers have a valid MVR and do not need to be ordered again
    var allDriversNeedingAnMVROrder = allDriversGoodToOrder.where(\ pD ->
      pD.PolicyDriverMVR == null or not pD.PolicyDriverMVR.isMVRValid(pD.PolicyDriverMVR.getMVRDetails()))

    var driversToOrder: PolicyDriver[]

    switch(typeof period.Job){
      case Submission:
      case Renewal:
      case Rewrite:
      case RewriteNewAccount:
        driversToOrder = allDriversNeedingAnMVROrder
        break
      case PolicyChange:
      case Reinstatement:
        driversToOrder = allDriversGoodToOrder.where(\ d -> d.PolicyDriverMVR.OrderStatus <> MVRStatus.TC_RECEIVED)
        break
    }

    // stop all the pending MVR workflows if we're not in automated renewal
    PCLoggerCategory.PRODUCT_MODEL.debug("Before cancelling wfs in PAPolicyLineMethods")
    period.Workflows.whereTypeIs(ProcessMVRsWF).where(\ w -> w.State == WorkflowState.TC_ACTIVE).each(\ w -> {
      w.cancelFromOutsideWF()
      w.Bundle.commit()
    })
    PCLoggerCategory.PRODUCT_MODEL.debug("After cancelling wfs in PAPolicyLineMethods")
    if(driversToOrder.HasElements) {
      // start MVR workflow if any drivers that have to have MVRs for bind
      var mvrWorkflow = new ProcessMVRsWF(_line.Bundle)
      mvrWorkflow.setupForMVRRequest(period, driversToOrder)
      mvrWorkflow.Bundle.commit()
    }

  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch (cov.FixedId.Type) {
      //Personal Auto Line
      case PersonalAutoCov.Type:
        return getPAAutoCovLimit(cov as PersonalAutoCov)
      case PersonalVehicleCov.Type:
        return getPAVehicleLimit(cov as PersonalVehicleCov)
    }
    return BigDecimal.ZERO
  }

  override function getWorksheetRootNode(showConditionals : boolean) : RowTreeRootNode {
    var treeNodes : List<WorksheetTreeNodeContainer> = {}
    _line.PolicyLocations.orderBy(\ loc -> loc.CompactName).each(\ garage -> {
      var garagedVehicles = _line.VersionList.Vehicles.map( \ vl -> vl.AllVersions.last() ).where(\v -> v.GarageLocation.FixedId == garage.FixedId).toTypedArray()
      if (garagedVehicles.Count > 0) {
        var garageContainer = new WorksheetTreeNodeContainer(garage.CompactName)
        garageContainer.ExpandByDefault = true
        garagedVehicles.each(\ vehicle -> {
          var vehicleContainer = new WorksheetTreeNodeContainer(vehicle.DisplayName)
          vehicleContainer.ExpandByDefault = true
          garageContainer.addChild(vehicleContainer)
          var vehicleCosts : List<PACost> = {}
          vehicleCosts.addAll(vehicle.VersionList.Costs.flatMap(\c -> c.AllVersions).toList())
          vehicleCosts.addAll(vehicle.VersionList.Coverages.flatMap(\c -> c.Costs).flatMap(\c -> c.AllVersions).toList())
          vehicleCosts
            .orderBy(\ c -> c.DisplayName)
            .each(\ cost -> {
              var costWithWorksheet = cost
              while (costWithWorksheet.RatingWorksheet == null and costWithWorksheet.BasedOn != null) {
                costWithWorksheet = costWithWorksheet.BasedOn
              }
              var displayName = costWithWorksheet.Coverage.DisplayName
              if (vehicleCosts.AnyProrated) {
                displayName += " (${cost.EffectiveDate.ShortFormat} - ${cost.ExpirationDate.ShortFormat})"
              }
              var costContainer = new WorksheetTreeNodeContainer(displayName)
              vehicleContainer.addChild(costContainer)
              costContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(costWithWorksheet, showConditionals))
            })
          var assignmentWorksheet = _line.Branch.getWorksheetFor(vehicle)
          if (assignmentWorksheet != null) {
            var driverContainer = new WorksheetTreeNodeContainer(displaykey.Web.Policy.RatingWorksheet.DriverAssignment)
            vehicleContainer.addChild(driverContainer)
            driverContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(assignmentWorksheet, showConditionals))
          } else for (drv in vehicle.Drivers) {
            assignmentWorksheet = _line.Branch.getWorksheetFor(vehicle, drv.PublicID)
            if (assignmentWorksheet != null) {
              var driverContainer = new WorksheetTreeNodeContainer(displaykey.Web.Policy.RatingWorksheet.DriverAssignmentForDriver(drv.DisplayName))
              vehicleContainer.addChild(driverContainer)
              driverContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(assignmentWorksheet, showConditionals))
            }
          }
        })
        treeNodes.add(garageContainer)
      }
    })

    var taxes = _line.Branch.AllCosts.TaxSurcharges.orderBy(\ c -> c.DisplayName).toList()
    taxes.each(\ tax -> {
      var taxContainer = new WorksheetTreeNodeContainer(tax.DisplayName)
      taxContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(tax, showConditionals))
      treeNodes.add(taxContainer)
    })

    var otherCosts = _line.PACosts.where(\ p -> p.Vehicle == null and p.RateAmountType != "TaxSurcharge")
    var allOtherCosts = otherCosts.flatMap(\oc -> oc.VersionList.AllVersions).toList()
    allOtherCosts
      .orderBy(\ otherCost -> otherCost.DisplayName)
      .each(\ otherCost -> {
        var otherContainer = new WorksheetTreeNodeContainer(otherCost.DisplayName)
        otherContainer.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(otherCost, showConditionals))
        treeNodes.add(otherContainer)
      })

    // non-cost worksheets.   
    // Note that this is only worksheets created by the current branch.
    var nonCost = _line.Branch.AllBeansWithWorksheets.entrySet().where(\ e -> not (e.Key typeis PACost) and not (e.Key typeis PersonalVehicle))
    nonCost.each(\ nc -> {
      var container = new WorksheetTreeNodeContainer(nc.Key.DisplayName)
      nc.Value.each(\ ws -> container.addChildren(WorksheetTreeNodeUtil.buildTreeNodes(ws, showConditionals)))
      treeNodes.add(container)
    })

    return WorksheetTreeNodeUtil.buildRootNode(treeNodes)
  }

  private function getPAAutoCovLimit(cov : PersonalAutoCov) : BigDecimal {
    switch(cov.PatternCode) {
      case "PALiabilityCov":
        return cov.PALine.PALiabilityCov.PALiabilityTerm.PackageValue.PackageTerms.where(\ p -> p.AggregationModel == CovTermModelAgg.TC_EA).sum(\ p -> p.Value)
      case "PAMedPayCov":
        return cov.PALine.PAMedPayCov.PAMedLimitTerm.Value
      case "PAPropProtectionCov":
        return cov.PALine.PAPropProtectionCov.PAPropProtectLimitTerm.Value
      case "PALossOfUseCov":
        return cov.PALine.PALossOfUseCov.PARentalLossOfUseLimitTerm.Value
      default:
        return 0
    }
  }

  private function getPAVehicleLimit(cov : PersonalVehicleCov) : BigDecimal {
    switch(cov.PatternCode) {
      case "PAExcessElectronicsCov":
        return cov.PersonalVehicle.PAExcessElectronicsCov.PAExcessElectronicsLimitTerm.Value
      default:
        return 0
    }
  }

  override function createUnderwriterEvaluator(context : PolicyEvalContext) : UnderwriterEvaluator {
    return new PA_UnderwriterEvaluator(context)
  }

  override property get SideBySideBaseDataConfig() : MatchableTreeTraverserConfig {
    return new PersonalAutoSideBySideBaseDataConfig()
  }

  override property get SideBySideInitialConfig(): SideBySideInitialConfig {
    return new PersonalAutoSideBySideInitialConfig()
  }

  override function createRatingEngine(method : RateMethod, parameters : Map<RateEngineParameter, Object>) : AbstractRatingEngine<PersonalAutoLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new PASysTableRatingEngine(_line as PersonalAutoLine)
    }
    return new PARatingEngine(_line as PersonalAutoLine, parameters[RateEngineParameter.TC_RATEBOOKSTATUS] as RateBookStatus)
  }

  override property get BaseStateRequired() : boolean {
    return false
  }
}
