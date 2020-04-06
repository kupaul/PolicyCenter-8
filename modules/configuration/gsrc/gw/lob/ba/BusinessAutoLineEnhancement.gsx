package gw.lob.ba

uses gw.pl.util.ArgCheck
uses gw.api.util.AutoNumberUtil
uses java.util.HashSet
uses java.util.Set
uses java.lang.IllegalStateException
uses gw.pl.persistence.core.Bundle
uses java.util.Map
uses gw.api.util.StateJurisdictionMappingUtil
uses java.lang.Integer
uses gw.api.util.JurisdictionMappingUtil

/**
 * General enhancement methods for {@link entity.BusinessAutoLine}
 */
enhancement BusinessAutoLineEnhancement : entity.BusinessAutoLine {

  /**
   * This property gets the states that have not been selected as a hired auto state
   * @return List<Jurisdiction>
   */  
  property get UnusedHiredAutoStates() : List<Jurisdiction> {
    var states = typekey.Jurisdiction.getTypeKeys(false)
    var baStates = HiredAutoJurisdictions.map(\ j -> j.State)
    return states.where(\ s -> not baStates.contains(s))
  }  
   
  /**
   * This property gets the states that have not been selected as a non-owned state
   * @return List<Jurisdiction>
   */  
  property get UnusedNonOwnedStates() : List<Jurisdiction> {
    var states = typekey.Jurisdiction.getTypeKeys(false)
    var baStates = NonOwnedJurisdictions.map(\ j -> j.State)
    return states.where(\ s -> not baStates.contains(s))
  }

  /**
   * This property gets the BAJurisdictions that are hired auto jurisdictions. 
   * @return BAJurisdiction[]
   */    
  property get HiredAutoJurisdictions() : BAJurisdiction[] {
    return this.Jurisdictions.where(\ j -> j.HiredAutoCoverageSelected)
  }  

  /**
   * This property gets all of the hired auto basis
   * @return BAHiredAutoBasis[]
   */    
  property get HiredAutoBasis() : BAHiredAutoBasis[] {
    return HiredAutoJurisdictions.map(\ b -> b.HiredAutoBasis)
  }
    
  /**
   * This property gets the BAJurisdictions that are non-owned jurisdictions. 
   * @return BAJurisdiction[]
   */    
  property get NonOwnedJurisdictions() : BAJurisdiction[] {
    return this.Jurisdictions.where(\ j -> j.NonOwnedCoverageSelected)
  }  
  
  /**
   * This property gets all of the non-owned basis
   * @return BANonOwnedBasis[]
   */    
  property get NonOwnedBasis() : BANonOwnedBasis[] {
    return NonOwnedJurisdictions.map(\ b -> b.NonOwnedBasis)
  }

  /**
   * @return schedule rate modifiers
   */
  property get ScheduleRates() : BAModifier[] {
    return this.BAModifiers.where(\ mod -> mod.ScheduleRate)
  }

  /**
   * @return {@link entity.BATransaction BATransactions} for this branch.
   */
  property get BATransactions() : BATransaction[] {
    var branch = this.Branch
    return branch.getSlice(branch.PeriodStart).BATransactions
  }

  /**
   * This property returns a list of states that have vehicles
   * @return String[]
   */
  property get VehicleStateList() : String[] {
    // which states have vehicles
    var vehiclestates = this.Vehicles*.Location*.State*.Code
    // which states are on the policy
    var jurisstates = this.Jurisdictions*.State*.Code
    // only return the list of unique states that have vehicles
    return jurisstates.where(\ s -> vehiclestates.contains(s))
  }  

  /**
   * This property returns a list of the garaging jurisdictions as an array
   * @return BAJurisdiction[]
   */  
  property get GaragingJurisdictions() : BAJurisdiction[] {
    // which states have vehicles
    var vehicleStates = this.Vehicles*.Location*.State
    // only return the list of jurisdictions that have vehicles
    return this.Jurisdictions.where(\ j -> vehicleStates.contains(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(j.State)))
  }
  
  /**
   * This property returns a list of the garaging states as a set
   * @return Set<State>
   */
  property get GarageStatesAsSet() : Set<State> {
    var states = new HashSet<State>()
    for (vehicle in this.Vehicles) {
      if (vehicle.Location == null or vehicle.Location.State == null) {
        throw new IllegalStateException(displaykey.BusinessAuto.Vehicle.NoState)
      }
      states.add(vehicle.Location.State)
    }
    return states
  }

  /**
   * Create a new {@link entity.CommercialDriver} and add it to the line.
   * @return the newly created {@link entity.CommercialDriver}
   */
  function createAndAddDriverContact() : CommercialDriver {
    var driver = new CommercialDriver(this.Branch)
    this.addToDrivers(driver)
    AutoNumberUtil.autoNumber(driver,
                              CommercialDriver.Type.TypeInfo.getProperty("SeqNumber"),
                              this,
                              BusinessAutoLine.Type.TypeInfo.getProperty("Drivers"))
    return driver
  }

  /**
   * The default the {@link BusinessVehicle} that will serve as the default container for a new {@link PolicyAddlInterest}
   * <br/>
   * <br/>
   * e.g. In the user interface for creating a new additional interest, a default vehicle is provided.
   * The default vehicle is determined by this method.
   *
   * @return the default {@link BusinessVehicle}
   */
  property get DefaultContainerForAddlInterest() : BusinessVehicle {
    var baVehicles = this.Vehicles
    if (baVehicles.hasMatch( \ veh -> veh.Location == null )) {
      return baVehicles.orderBy(\ veh -> veh.VehicleNumber).first()
    }
    return baVehicles.orderBy(\ veh -> veh.Location.LocationNum).thenBy(\ veh -> veh.VehicleNumber).first()
  }
  
  /**
   * This method return the validation message for the required cost of hire field
   * @param value - The cost of hire value
   * @param anyExposure - boolean value of any exposure
   * @return String
   */
  function getCostOfHireValidation(value : Integer, anyExposure : boolean) : String {
    if (not anyExposure and value == null) {
      return displaykey.Web.Policy.BA.CostHireRequired
    }
    return null
  }

  /**************************************************************************************
   * Methods for Coverages
   **************************************************************************************/  

  /**
   * A map to get the state availabiltiy for various BA Liability Limit packages.
   */
  private static property get PACKAGECODE_TO_STATE_MAP() : Map<String, String[]> {
    return {
      "12.5/25/7.5"   ->  { "OH" },
      "15/30/5"       ->  {"CA", "NJ", "PA"},
      "15/30/10"      ->  {"AZ", "DE", "NV", "SC"},
      "20/40/0"       ->  {"CT"},
      "20/40/5"       ->  {"MA"},
      "20/40/10"      ->  {"AL", "HI", "MI", "WV"},
      "20/40/15"      ->  {"IL", "IA", "MD", "TX"},
      "25/50/0"       ->  {"ND"},
      "25/50/10"      ->  {"DC", "KS", "KY", "MO", "MT", "NY", "OR", "VT", "WA"},
      "25/50/15"      ->  {"ID", "UT"},
      "25/50/20"      ->  {"VA"},
      "25/50/25"      ->  {"AR", "CO", "GA", "IN", "NE", "NH", "RI", "SD", "WY"},
      "30/60/0"       ->  {"NC"},
      "30/60/10"      ->  {"MN"},
      "50/100/25"     ->  {"AK", "ME"},
      "40K"           ->  {"SC"},
      "50K"           ->  {"TN", "WI"},
      "0/0/10"        ->  {"TN"} 
    }
  }
       
  /**
   * BA Owned Liab Cov is line level, but the availability of its cov terms
   * depends on the location of the owned vehicles
   * Get an array of the vehicle states and subtract the array of states
   * where the Package is available. If that does not produce an empty 
   * array, then the Package is not available 
   * That is, there is a vehicle located in a state where thepackage is not allowed
   * @param thepackage - string representation of the package value
   * @return boolean 
   */
  function isPackageAvailable(thepackage : String) : boolean {
    var availableStates = PACKAGECODE_TO_STATE_MAP.get(thepackage)
    var vehicleStates = getVehicleStateList()
    if (availableStates == null) {
      return true
    }
    return (vehicleStates.subtract(availableStates).Empty)
  }
   
  /**
   * This methods gets all of the jurisdiction coverages that are not hired or nonowned coverage
   * @param state - jurisdiction typekey
   * @return Coverage[]
   */ 
  function getOtherthanHiredAndNonOwnedCoverages(state : Jurisdiction) : Coverage[] {
    var juris = getJurisdiction(state)
    return getCoverageThatExistOtherThan(juris.Coverages, {this.BAHiredLiabilityCov, this.BAHiredCollisionCov, this.BAHiredCompCov, 
                                                           this.BAHiredSpecPerilCov, this.BAHiredUMCov, this.BAHiredUIMCov,
                                                           this.BANonownedLiabCov, juris.BANonOwndSSExtendCov})                     
  }

  /**
   * @return a set of Coverage Category names associated with Business Auto Additional Coverages.
   */
  property get AdditionalCoverageCategories() : String[] {
    return new String[] {"BAPFellowEmpGrp", "BAPDOCGrp", "BAPLossOfUseGrp", "BAPPollutionGrp", "BAPTerrorismGrp", "BAPNonownedSSGrp"}
  }
  
  private function getCoverageThatExistOtherThan(allcovs : Coverage[], coverages : Coverage[]) : Coverage[] {
    var returncovs : Coverage[]
    if (allcovs <> null) {
      returncovs = allcovs.where(\ allcov -> !coverages.hasMatch(\ c -> c == allcov))
    }
    return returncovs
  }

  /**************************************************************************************
   * Methods for Covered Auto Symbols
   **************************************************************************************/

  /**
   * Synchronize the covered auto symbols
   * @see #setCoveredAutoSymbols()
   */
  function syncCoverageSymbolGroups() {
    if (this.AutoSymbolsManualEditDate==null) {
      setCoveredAutoSymbols()
    }
  }
  
  /**
   * This method builds the Covered Auto Symbol table for Comm Auto.
   *  First it gets the symbolGroup for each coverage group (table rows).
   *  Then for each symbolGroupl (table row) it determines if the coverage applies for vehicle type (columns) 
   *               and sets the corresponding value to true.  
   *  A vehicle type can be a real vehicle type (Truck, passenger, etc.) or a pseudo type (Hired Auto, Non-owned auto).
   */
  function setCoveredAutoSymbols() {
    var liabilitySymbol = this.getCoverageSymbolGroup("Liability")
    var collisionSymbol = this.getCoverageSymbolGroup("Collision")
    var comprehensiveSymbol = this.getCoverageSymbolGroup("Comprehensive")
    var specCauseSymbol = this.getCoverageSymbolGroup("SpecCause")
    var UMUIMSymbol = this.getCoverageSymbolGroup("UMUIM")
    var towingSymbol = this.getCoverageSymbolGroup("Towing")
  
    var privatePassenger = false
    var nonPrivatePassenger = false

    for(group in this.CoverageSymbolGroups) {
      for(symbol in group.CoverageSymbols) {
        group.removeFromCoverageSymbols(symbol)
      }
    }

    for(symbol in this.CoverageSymbolGroups) {
      if(symbol.ANYAvailable)
        symbol.ANYSelected = false
      if(symbol.OVOAvailable)
        symbol.OVOSelected = false
      if(symbol.OPVAvailable)
      	symbol.OPVSelected = false
      if(symbol.OCVAvailable)
        symbol.OCVSelected = false
      if(symbol.SRCAvailable)
        symbol.SRCSelected = false
      if(symbol.DVOAvailable)
        symbol.DVOSelected = false
      if(symbol.HVOAvailable)
        symbol.HVOSelected = false
      if(symbol.NOVAvailable)
        symbol.NOVSelected = false
      if(symbol.CUSAvailable)
        symbol.CUSSelected = false
    }

    //Hired Autos Only
    if(this.BAHiredLiabilityCovExists)
      liabilitySymbol.HVOSelected = true
    if(this.BAHiredCollisionCovExists)
      collisionSymbol.HVOSelected = true
    if(this.BAHiredCompCovExists)
      comprehensiveSymbol.HVOSelected = true
    if(this.BAHiredSpecPerilCovExists)
      specCauseSymbol.HVOSelected = true
    
    //Nonowned Autos Only
    if(this.BANonownedLiabCovExists) {
      liabilitySymbol.NOVSelected = true
    }

    //Check if there are private or non private passengers
    for (var vehicle in this.Vehicles) {
      if(vehicle.VehicleType == VehicleType.TC_PP) {
        privatePassenger = true
      } else {
        nonPrivatePassenger = true
      }
    }

    //Owned autos only
    // OVO checks - Owned vehicles
    if (privatePassenger and nonPrivatePassenger) {
      for (var vehicle in this.Vehicles) {
        if(vehicle.BALine.BAOwnedLiabilityCovExists)
          liabilitySymbol.OVOSelected = true
        if(vehicle.BAComprehensiveCovExists)
          comprehensiveSymbol.OVOSelected = true
        if(vehicle.BASpecCausesLossCovExists)
          specCauseSymbol.OVOSelected = true
        if(vehicle.BACollisionCovExists)
          collisionSymbol.OVOSelected = true
        if(vehicle.BAJurisdiction.BAOwnedUIMBICovExists and vehicle.BAJurisdiction.BAOwnedUMBICovExists)
          UMUIMSymbol.OVOSelected = true
        if(vehicle.BATowingLaborCovExists)
          // set the OPV symbol because towing is available only on passenger
          towingSymbol.OPVSelected = true
      }
    }  
    //  Next is OPV - Owned private passenger
    else if (privatePassenger) {
      for (var vehicle in this.Vehicles) {
        if(vehicle.BALine.BAOwnedLiabilityCovExists)
          liabilitySymbol.OPVSelected = true
        if(vehicle.BAComprehensiveCovExists)
          comprehensiveSymbol.OPVSelected = true
        if(vehicle.BASpecCausesLossCovExists)
          specCauseSymbol.OPVSelected = true
        if(vehicle.BACollisionCovExists)
          collisionSymbol.OPVSelected = true
        if(vehicle.BAJurisdiction.BAOwnedUIMBICovExists and vehicle.BAJurisdiction.BAOwnedUMBICovExists)
          UMUIMSymbol.OPVSelected = true
        if(vehicle.BATowingLaborCovExists)
          towingSymbol.OPVSelected = true
      }
    }
    // and finally - when there are only commercial vehicles
    else {
      for (var vehicle in this.Vehicles) {
        if(vehicle.BALine.BAOwnedLiabilityCovExists)
          liabilitySymbol.OCVSelected = true
        if(vehicle.BAComprehensiveCovExists)
          comprehensiveSymbol.OCVSelected = true
        if(vehicle.BASpecCausesLossCovExists)
          specCauseSymbol.OCVSelected = true
        if(vehicle.BACollisionCovExists)
          collisionSymbol.OCVSelected = true
        if(vehicle.BAJurisdiction.BAOwnedUIMBICovExists and vehicle.BAJurisdiction.BAOwnedUMBICovExists)
          UMUIMSymbol.OCVSelected = true
      }
    }
  }

  /**
   * Used to determine whether to enable custom description for ISymbol 10
   * and to clear the value when no symbol-10 checkboxes are checked.
   */
  function isCUSSelected() : Boolean {
    for (var group in this.CoverageSymbolGroups) {
      if (group.CUSSelected) {
        return true
      }
    }
    
    // clear custom description of symbol 10 if it's not selected
    this.CustomAutoSymbolDesc = null    
    return false
  }

  /**************************************************************************************
   * Methods for Jurisdictions
   **************************************************************************************/  

  /**
   * Remove any jurisdictions without a garaged location.
   * Add a new jurisdiction for any garaged locations missing a jurisdiction.
   */
  function syncJurisdictions() {
    var garagingStates = this.Vehicles.map(\ v -> JurisdictionMappingUtil.getJurisdiction(v.Location)).toSet()

    // Remove jurisdictions that are no longer used
    for (jurisdiction in this.Jurisdictions) {
      garagingStates.remove(jurisdiction.State)
      removeJurisdiction(jurisdiction)  // this should be called "maybeRemoveJurisdiction?"
    }  
    
    // Add in missing jurisdictions
    for (state in garagingStates) {
      if (state != null) { // merged auto w/missing PolicyLocation for GarageLocation will be null
        maybeAddJurisdiction(state)
      }
    }
  }
     
  /**
   * This method creates a new jurisdiction, or sets the existing jurisdiction as a hired auto jurisdiction. 
   * @param state - the jurisdiction to add
   * @return BAJurisdiction
   */
  function createOrAddHiredAutoJurisdiction(state : Jurisdiction) : BAJurisdiction {
    ArgCheck.nonNull(state, "state")
    var juris = maybeAddJurisdiction(state)
    juris.HiredAutoCoverageSelected = true
    return juris
  }  
  
  /**
   * This method creates a new jurisdiction, or sets the existing jurisdiction as a non-owned jurisdiction. 
   * @param state - the jurisdiction to add
   * @return BAJurisdiction
   */
  function createOrAddNonOwnedJurisdiction(state : Jurisdiction) : BAJurisdiction {
    ArgCheck.nonNull(state, "state")
    var juris = maybeAddJurisdiction(state)
    juris.NonOwnedCoverageSelected = true
    return juris
  }
  
  /**
   * This method removes the hired auto basis from the jurisdiction. It also removes
   * the jurisdiction if there are no vehicles garaged in that jurisdiction
   * @param juris - the jurisdiction to remove
   */    
  function removeAsHiredAutoJurisdiction(juris : BAJurisdiction) {    
    ArgCheck.nonNull(juris, "BA Jurisdiction")
    juris.HiredAutoCoverageSelected = false
    removeJurisdiction(juris)
  }  
  
  /**
   * This method removes the non-owned basis from the jurisdiction. It also removes
   * the jurisdiction if there are no vehicles garaged in that jurisdiction
   * @param juris - the jurisdiction to remove
   */    
  function removeAsNonOwnedJurisdiction(juris : BAJurisdiction) {    
    ArgCheck.nonNull(juris, "BA Jurisdiction")
    juris.NonOwnedCoverageSelected = false
    removeJurisdiction(juris)
  }

  /**
   * This method removes the jurisdiction if there are no vehicles garaged in that jurisdiction 
   * and hired auto/non-owned coverage is not selected.
   * The remove is only allowed if the Jurisdiction did not exist in a prior branch of the current term.
   *   or if the job creates a new policy term (sub, rewrite, renewal and issue).
   * The removal restriction is required because rating have costs for taxes associated with the juris
   *   in the prior branch
   * @param juris - the jurisdiction to remove
   */      
  function removeJurisdiction(juris : BAJurisdiction) {
    var canRemoveJurisdiction = {typekey.Job.TC_SUBMISSION, typekey.Job.TC_RENEWAL, typekey.Job.TC_REWRITE, typekey.Job.TC_ISSUANCE}
            .contains(juris.Branch.Job.Subtype) or juris.BasedOn == null
    if (juris.HiredAutoCoverageSelected == false and juris.NonOwnedCoverageSelected == false) {
      if (this.Vehicles.hasMatch(\ v -> v.Location.State == StateJurisdictionMappingUtil.getStateMappingForJurisdiction(juris.State)) == false and canRemoveJurisdiction) {
        this.removeFromJurisdictions(juris)
      }
    } 
  }
  
  /**
   * This method creates a new jurisdiction with clauses
   * @param state - the state to add
   * @return BAJurisdiction
   */  
  function addJurisdiction(state : Jurisdiction) : BAJurisdiction {
    ArgCheck.nonNull(state, "state")
    var jurisdiction = getJurisdiction(state)
    if (jurisdiction == null){
      jurisdiction = new BAJurisdiction(this.Branch)
      jurisdiction.State = state
      jurisdiction.BALine = this
      this.addToJurisdictions(jurisdiction)
      jurisdiction.createCoveragesConditionsAndExclusions()
    }
    return jurisdiction
  }
  
  /**
   * This method returns the jurisdictions that matches the given jurisdiction typekey
   * @param jurisdiction - The jurisdiction typekey
   * @return BAJurisdiction
   */
  function getJurisdiction(jurisdiction : Jurisdiction) : BAJurisdiction {
    return this.Jurisdictions.firstWhere(\ j -> j.State == jurisdiction)
  }
  
  /**
   * This method creates a new jurisdiction without clauses, or returns the existing jurisdiction
   * @param state - the jurisdiction to add
   * @return BAJurisdiction
   */
  function maybeAddJurisdiction(state : Jurisdiction) : BAJurisdiction {
    ArgCheck.nonNull(state, "state")
    var jurisdiction = getJurisdiction(state)
    if (jurisdiction == null){
      jurisdiction = new BAJurisdiction(this.Branch)
      jurisdiction.State = state
      jurisdiction.BALine = this
      this.addToJurisdictions(jurisdiction)
    }
    return jurisdiction
  }

  /**
   * Create a {@link entity.BAJurisdiction BAJurisdiction} for the {@link #BaseState} if none exists,
   * otherwise return the existing {@link entity.BAJurisdiction BAJurisdiction}
   * @return the base state  {@link entity.BAJurisdiction BAJurisdiction}
   * @link #addJurisdiction(typekey.Jurisdiction)
   */
  function baseJurisdiction() : BAJurisdiction {
    return addJurisdiction(this.BaseState)
  }
    
  /**
   * Determines if the given state contains vehicle
   *
   * @param state The state to which to test
   * @return true if the given state has vehicle, false otherwise
   */
  function isGarageState(state : State) : boolean {
    var states = getGarageStatesAsSet()
    return states.contains(state)
  } 
    
  /**************************************************************************************
   * Methods for Business Vehicles
   **************************************************************************************/ 

  /**
   * Returns an array containing Vehicles from current and future slices.
   * @returns an array of current and future {@link entity.BusinessVehicle vehicles}
   */
   property get CurrentAndFutureVehicles() : BusinessVehicle[] { 
    var vehicles = this.Vehicles.toList()
    this.Branch.OOSSlices.each(\p ->  p.BusinessAutoLine.Vehicles.each(\v -> {  if(!vehicles.contains(v)) vehicles.add(v) }));
    return vehicles.toTypedArray()
  }

  /**
   * Add the provided {@link entity.BusinessVehicle BusinesVehicle} to the line and set the {@link entity.BusinesVehicle#VehicleNumber VehicleNumber}
   * @param vehicle the vehicle to add
   */
  function addAndNumberVehicle(vehicle : BusinessVehicle) {
    this.addToVehicles(vehicle)
    this.BusinessVehicleAutoNumberSeq.number( vehicle, CurrentAndFutureVehicles, BusinessVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ) )
  }

  /**
   * Create and add a new {@link entity.BusinessVehicle BusinesVehicle}
   * @see #addAndNumberVehicle(entity.BusinessVehicle)
   */
  function createAndAddBusinessVehicle() : BusinessVehicle {
    var bv = new BusinessVehicle(this.Branch)
    addAndNumberVehicle(bv)
    bv.createCoveragesConditionsAndExclusions()
    return bv
  }

  /**
   * Remove the provided {@link entity.BusinessVehicle BusinesVehicle} and renumber the remaining vehicles.
   * @param vehicle to remove
   */
  function removeVehicle(vehicle : BusinessVehicle) {
    this.removeFromVehicles(vehicle)
    renumberVehicles()
  }

  /**
   * Renumber the vehicles
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumber(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberVehicles() {
    this.BusinessVehicleAutoNumberSeq.renumber(CurrentAndFutureVehicles, BusinessVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Renumber the new vehicles
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumberNewBeans(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberNewVehicles() {
    this.BusinessVehicleAutoNumberSeq.renumberNewBeans(CurrentAndFutureVehicles, BusinessVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Return a clone of the current auto-numbering sequence.  This is necessary whenever a new term is created.
   * @see com.guidewire.pc.domain.AutoNumberSequence#clone(gw.pl.persistence.core.Bundle)
   */
  function cloneVehicleAutoNumberSequence() {
    this.BusinessVehicleAutoNumberSeq = this.BusinessVehicleAutoNumberSeq.clone(this.Bundle)
  }

  /**
   * Reset the vehicle auto-number sequence
   * @see com.guidewire.pc.domain.AutoNumberSequence#reset()
   */
  function resetVehicleAutoNumberSequence() {
    this.BusinessVehicleAutoNumberSeq.reset()
    renumberVehicles()
  }

  /**
   * Reserve all used auto-numbers for vehicles
   * @see com.guidewire.pc.domain.AutoNumberSequence#bind(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function bindVehicleAutoNumberSequence() {
    renumberVehicles() 
    this.BusinessVehicleAutoNumberSeq.bind(CurrentAndFutureVehicles, BusinessVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Initialize a new vehicle auto number sequence
   * @param bundle the entity {@link gw.pl.persistence.core.Bundle Bundle} to initialize the sequence in.
   * @see com.guidewire.pc.domain.AutoNumberSequence
   */
  function initializeVehicleAutoNumberSequence(bundle : Bundle) {  
    this.BusinessVehicleAutoNumberSeq = new AutoNumberSequence(bundle)
  }
}
