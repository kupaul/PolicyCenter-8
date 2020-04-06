package gw.lob.pa.rating

uses gw.job.RenewalProcess
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses gw.rating.NoCostWorksheetContainer
uses gw.rating.RateFlowLogger

uses java.lang.IllegalArgumentException
uses java.lang.Iterable
uses java.math.RoundingMode
uses java.util.Date
uses java.util.Map
uses gw.rating.worksheet.domain.Worksheet

@Export
class PARatingEngine extends AbstractRatingEngine<PersonalAutoLine> {

  static var _rfLogger = RateFlowLogger.Logger

  var _ratingLevel : RateBookStatus
  var _rateBook : RateBook as readonly RateBook

  construct(line : PersonalAutoLine, minimumRatingLevel : RateBookStatus) {
    super(line)
    _ratingLevel = minimumRatingLevel

    // Get the ratebook only once; personal lines are rated with the same
    // ratebook throughout the policy term
    _rateBook = getRateBook(line.Branch.PeriodStart, line.Branch.Offering.Code)
  }

  override function createCostDataForCost(c : Cost) : CostData {
    switch (typeof c) {
      case PersonalAutoCovCost:     return new PersonalAutoCovCostData(c, RateCache)
      case PersonalVehicleCovCost:  return new PersonalVehicleCovCostData(c, RateCache)
      case PersonalAutoPIPCovCost : return new PersonalAutoPIPCovCostData(c, RateCache)
      default : throw "Unknown cost type ${(typeof c).Name}"
    }
  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.where(\ c -> c typeis PersonalVehicleCovCost
                                 or c typeis PersonalAutoCovCost
                                 or c typeis PersonalAutoPIPCovCost)
  }


  //===========================================================================
  // Rate Flow
  //===========================================================================

  override protected function rateSlice(lineVersion : PersonalAutoLine) {
    assertSliceMode(lineVersion)
    if (lineVersion.Branch.isCanceledSlice()) {
      // Do nothing if this is a canceled slice
      if (_rfLogger.DebugEnabled) {
        _rfLogger.debug("Skipping canceled slice ${lineVersion} ${lineVersion.SliceDate}")
      }
    } else {
      var logMsg = "Rating ${lineVersion} ${lineVersion.SliceDate} version..."
      _rfLogger.info(logMsg)

      var vehicles = lineVersion.Vehicles // all vehicles active in this slice

      // Rate line-level coverages per vehicle
      for (cov in lineVersion.PALineCoverages) {
        vehicles.each(\ veh -> rateLineCoverage(cov, veh))
      }

      // Rate all vehicle level coverages
      vehicles.each(\veh ->{
        var assignedDriver = getAssignedDriver(veh)
        veh.Coverages.each(\ cov -> {
          rateVehicleCoverage(cov, assignedDriver)
        })
      })
      _rfLogger.info(logMsg + " done")
    }
  }

  //---------------------------------------------------------------------------
  // Coverages rated in Window mode.
  //---------------------------------------------------------------------------

  override protected function rateWindow(line : PersonalAutoLine) {
    var logMsg = "Rating across policy term..."
    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug(logMsg)
    }
    assertSliceMode(line) // we need to be in slice mode to create costs, but we're creating costs for the whole window

    // Need to write a rate routine for MultiPolicyDiscount.  (There is a corresponding table.)
    //    rateMultiPolicyDiscount(line)
    rateCancellationShortRatePenalty(line)
    rateTaxes(line)
    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug(logMsg + " done")
    }
  }

  //---------------------------------------------------------------------------
  // Coverages rated in Slice mode.
  //---------------------------------------------------------------------------

  // Vehicle coverages.   All of them use the same rate routine at the moment.
  private function rateVehicleCoverage(cov : PersonalVehicleCov, assignedDriver : VehicleDriver) {
    assertSliceMode(cov)
    if (cov == null or assignedDriver == null) {
      throw new IllegalArgumentException("Failed to rate.  The following parameter(s) were null:" +
            (cov == null ? " cov" : "") + (assignedDriver == null ? " assignedDriver" : ""))
    }

    // create an empty VehicleCostData -- amounts will be filled in by the rate routine
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var data = new PersonalVehicleCovCostData(start, end, cov.Currency, RateCache, cov.FixedId)
    data.RateBook = RateBook
    data.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    data.Basis = 1 // Assumes 1 vehicle year

    // If we are quoting a renewed term, find the cost on the prior term, and pass its ActualTermAmount
    // into the routine so it can do rate capping.
    var priorCov = cov.BasedOn
    while (priorCov != null and priorCov.Branch.PolicyTerm == cov.Branch.PolicyTerm) {
      priorCov = priorCov.BasedOn
    }
    var priorCost = priorCov.Costs?.first() // for PA, there should be only one cost per coverage

    // NOTE: a production implementation of renewal capping might have to do more work here.
    // If there is a prior coverage, but there has been a material change, the cap amount
    // from last term will not be correct.   A correct formulation might be to rate the
    // changed coverage using last term's ratebook, and cap based on that amount.

    var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
      {TC_POLICYLINE         ->PolicyLine,
       TC_VEHICLE            ->cov.PersonalVehicle,
       TC_COVERAGE           ->cov,
       TC_ASSIGNEDDRIVER     ->assignedDriver,
       TC_PREVIOUSTERMAMOUNT ->priorCost.ActualTermAmount.Amount} // May need to revisit whether we need to put Currency aware changes into the actual rate routine

    // call rate routine (which fills in BaseRate, AdjRate, and TermAmount
    RateBook.executeCalcRoutine("pa_veh_cov_premium_rr", data, data, rateRoutineParameterMap)

    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug("Rate Vehicle Coverage")
      _rfLogger.debug("   Standard Base Rate:     ${data.StandardBaseRate}")
      _rfLogger.debug("   Standard Adjusted Rate: ${data.StandardAdjRate}")
      _rfLogger.debug("   Standard Term Amount:   ${data.StandardTermAmount}")
    }

    // This is currently the ONLY use of override amounts in the Personal Auto line.
    // If we actually supported overrides (e.g. rerating) we would not want to copy
    // standard columns here (and in fact would set up the CostData in a different way).
    // Please refer to CPRatingEngine if you need an example of proper override support.

    // Overriding tends to be done on commercial lines and capping on personal lines.
    // There is no current example of doing capping and manual overrides simultaneously.
    // Theoretically it is possible, but you would have to deal with how to apply a cap
    // based on last term's override and/or based on a new override value.
    data.copyStandardColumnsToActualColumns()
    if (data.OverrideTermAmount != null and data.OverrideTermAmount != data.StandardTermAmount) {
      data.ActualTermAmount = data.OverrideTermAmount
    } else {
      data.OverrideTermAmount = null
      data.OverrideReason = null
      data.OverrideSource = TC_MANUAL // not allowed to be null
    }

    // call addCost() to add the new cost to the collection
    addCost(data)
  }

  private function getAssignedDriver(veh : PersonalVehicle) : VehicleDriver {

    return getAssignedDriverUsingStyle1(veh)

    /* Style 2 provided as an alternate example for selectin the assigned driver */
    // return getAssignedDriverUsingStyle2(veh)
  }

  // Determine assigned driver using rate routine
  private function getAssignedDriverUsingStyle1(veh : PersonalVehicle) : VehicleDriver {
    var driverAssignmentInfo = new DriverAssignmentInfo()
    var assignDriverParameterMap : Map<CalcRoutineParamName, Object>
          = {TC_POLICYLINE->PolicyLine,
             TC_DRIVERASSIGNMENTINFO -> driverAssignmentInfo,
             TC_CURRENTDRIVER ->null, // Place holder, used so param set can be shared with style 2
             TC_VEHICLE ->veh}

    var worksheetContainer = new NoCostWorksheetContainer()
    RateBook.executeCalcRoutine("pa_assign_driver_style1_rr", null, worksheetContainer, assignDriverParameterMap)
    var ws = new Worksheet() {:Description = "Driver assignment for vehicle ${veh.DisplayName}" ,
                              :WorksheetEntries = worksheetContainer.WorksheetEntries}
    (PolicyLine as PolicyLine).addRatingWorksheet(veh, ws)
    return driverAssignmentInfo.AssignedDriver
  }

  protected function getAssignedDriverUsingStyle2(veh : PersonalVehicle) : VehicleDriver {
    if (veh.Drivers.Count == 1) {
      return veh.Drivers.first()
    }

    var driverAssignmentInfo = new DriverAssignmentInfo()
    var assignDriverParameterMap : Map<CalcRoutineParamName, Object>
          = {TC_POLICYLINE->PolicyLine,
             TC_DRIVERASSIGNMENTINFO -> driverAssignmentInfo,
             TC_VEHICLE ->null} // // Place holder, used so param set can be shared with style 1

    veh.Drivers.each(\ currentDriver -> {
      assignDriverParameterMap.put(TC_CURRENTDRIVER, currentDriver)

      var worksheetContainer = new NoCostWorksheetContainer()
      RateBook.executeCalcRoutine("pa_assign_driver_style2_rr", null, worksheetContainer, assignDriverParameterMap)
      var ws = new Worksheet() {:Description = "Driver assignment for vehicle ${veh.DisplayName}, driver ${currentDriver.DisplayName}" ,
          :WorksheetEntries = worksheetContainer.WorksheetEntries}
      (PolicyLine as PolicyLine).addRatingWorksheet(veh, ws, currentDriver.PublicID)
    })

    if (driverAssignmentInfo.AssignedDriver == null) {
      _rfLogger.error("Unable to determine valid AssignedDriver")
    }

    return driverAssignmentInfo.AssignedDriver
  }

  // More than one rate routine is used for rating line coverages...select the right one.
  protected function rateLineCoverage(cov : PersonalAutoCov, vehicle : PersonalVehicle) {
    assertSliceMode(cov)
    switch (typeof cov) {
      case PALiabilityCov:
      case PAMedPayCov:
      case PAUIMBICov:
      case PAUMBICov:
      case PAUMPDCov:
      // case PAUIMPDCov:  // there are currently no rate table entries for this one so we shouldn't rate it
        rateLineCoverage(cov, vehicle, "pa_cov_premium_rr")
        break
      case PALimitedMexicoCov :
        rateLineCoverage(cov, vehicle, "pa_cov_flatrate_rr")
        break
      case PAPIP_NJ:
        ratePAPIP_NJBasic(cov, vehicle)
        break

      default:
         _rfLogger.debug("Not rating ${(typeof cov)}")
    }
  }

  // rate coverages that use the generic parameter set and PersonalAutoCovCost
  private function rateLineCoverage(cov : Coverage, vehicle : PersonalVehicle, routineCode : String) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var data = new PersonalAutoCovCostData(start, end, cov.Currency, RateCache, vehicle.FixedId, cov.FixedId)
    data.RateBook = RateBook

    data.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    data.Basis = 1 // Assumes 1 vehicle year

    var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
          {TC_POLICYLINE ->PolicyLine,
           TC_VEHICLE    ->vehicle,
           TC_COVERAGE   ->cov}

    // call rate routine (which fills in BaseRate, AdjRate, and TermAmount

    RateBook.executeCalcRoutine(routineCode, data, data, rateRoutineParameterMap)

    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug("Rate Line Coverage")
      _rfLogger.debug("   Standard Base Rate:     ${data.StandardBaseRate}")
      _rfLogger.debug("   Standard Adjusted Rate: ${data.StandardAdjRate}")
      _rfLogger.debug("   Standard Term Amount:   ${data.StandardTermAmount}")
    }

    data.copyStandardColumnsToActualColumns()

    // call addCost() to add the new cost to the collection
    addCost(data)

  }

  //---------------------------------------------------------------------------
  // Coverages with custom parameter sets and costs, e.g. PIP
  //---------------------------------------------------------------------------

  private function ratePAPIP_NJBasic(cov : PAPIP_NJ, vehicle : PersonalVehicle) {
    var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
          {TC_POLICYLINE ->PolicyLine,
           TC_VEHICLE    ->vehicle,
           TC_PAPIPNJ    ->cov}

    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var data = new PersonalAutoPIPCovCostData(start, end, cov.Currency, RateCache, vehicle.FixedId, cov.FixedId, PAPIPCovCostType.TC_BASIC)
    data.RateBook = RateBook
    data.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    data.Basis = 1 // Assumes 1 vehicle year

    RateBook.executeCalcRoutine("pa_pip_nj_basic_rr", data, data, rateRoutineParameterMap)

    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug("Rate PAPIP_NJ Coverage")
      _rfLogger.debug("   Standard Base Rate:     ${data.StandardBaseRate}")
      _rfLogger.debug("   Standard Adjusted Rate: ${data.StandardAdjRate}")
      _rfLogger.debug("   Standard Term Amount:   ${data.StandardTermAmount}")
    }
    data.copyStandardColumnsToActualColumns()

    // call addCost() to add the new cost to the collection
    addCost(data)
  }

  private function rateCancellationShortRatePenalty(line : PersonalAutoLine) {
    var subtotal = CostDatas.sum(\ c -> c.ActualAmount)
    if (line.Branch.RefundCalcMethod == "shortrate" and subtotal != 0) {
      var cost = new PAShortRatePenaltyCostData(line.Branch.PeriodStart, line.Branch.PeriodEnd, line.Branch.PreferredSettlementCurrency, RateCache)
      cost.NumDaysInRatedTerm = line.Branch.NumDaysInPeriod

      // Not used when calculating penalty amount
      cost.StandardBaseRate = 1.0
      cost.StandardAdjRate = 1.0

      var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
            {TC_POLICYLINE   ->PolicyLine,
             CalcRoutineParamName.TC_PRORATEDPREMIUMTOTAL -> subtotal}

      RateBook.executeCalcRoutine("pa_cancellation_short_rate_penalty",  cost, cost, rateRoutineParameterMap)

      cost.StandardAmount = cost.StandardTermAmount
      cost.copyStandardColumnsToActualColumns()
      addCost(cost)
    }
  }

  private function rateTaxes(line : PersonalAutoLine) {
    var subtotal = CostDatas.sum(\ c -> c.ActualAmountBilling.Amount)
    if (subtotal != 0) {
      var cost = new PersonalAutoTaxCostData(Branch.PeriodStart, Branch.PeriodEnd, TaxRatingCurrency, RateCache)
      cost.NumDaysInRatedTerm  = line.Branch.NumDaysInPeriod
      cost.ChargePattern       = ChargePattern.TC_TAXES
      cost.RateBook            = RateBook

      var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
            {TC_POLICYLINE   ->PolicyLine,
             TC_TAXABLEBASIS ->subtotal}

      RateBook.executeCalcRoutine("pa_state_tax_rr", cost, cost, rateRoutineParameterMap)
      cost.copyStandardColumnsToActualColumns()
      cost.updateAmountFields(this.RoundingMode, Branch.PeriodStart)
      addCost(cost)
    }
  }

  //===========================================================================
  // Utility functions
  //===========================================================================

  protected property get RoundingLevel() : int {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  protected property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  private function getRateBook(refDate : Date, offeringCode : String) : RateBook {
    return RateBook.selectRateBook(refDate, Branch.RateAsOfDate, PolicyLine.PolicyLine.PatternCode,
                                   PolicyLine.BaseState, _ratingLevel, Branch.JobProcess typeis RenewalProcess, offeringCode)
  }
}
