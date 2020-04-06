package gw.lob.pa

uses java.util.ArrayList
uses gw.pl.persistence.core.Bundle
uses gw.api.util.*
uses gw.api.web.document.*
uses gw.document.*

enhancement PersonalAutoLineEnhancement : entity.PersonalAutoLine {

  /**
   * Returns an array containing Vehicles from current and future slices.
   * @return PersonalVehicle[] - an array of {@link entity.PersonalVehicle}
   */
   property get CurrentAndFutureVehicles() : PersonalVehicle[] { 
    var vehicles = this.Vehicles.toList()
    this.Branch.OOSSlices.each(\p ->  p.PersonalAutoLine.Vehicles.each(\v -> {  if(!vehicles.contains(v)) vehicles.add(v) }));
    return vehicles.toTypedArray()
  }

  /**
   * Adds a {@link entity.PersonalVehicle} to the line and renumbers the vehicles after the addition
   * @param vehicle - the {@link PersonalVehicle} entity to add
   */
  public function addAndNumberVehicle(vehicle : PersonalVehicle) {
    this.addToVehicles(vehicle)
    this.PersonalVehicleAutoNumberSeq.number(vehicle, CurrentAndFutureVehicles, entity.PersonalVehicle.Type.TypeInfo.getProperty( "VehicleNumber" )) 
  }
  
  /**
   * Creates a new {@link entity.PersonalVehicle} and sets the following data on the vehicle
   * <ul>
   *   <li>Vehicle type is set to Passenger/Light Truck</li>
   *   <li>Garage location is set to the first available {@link entity.PolicyLocation}</li>
   * </ul>
   * The vehicle is added to the line and numbered and the modifiers and coverages are synched
   * @see #addAndNumberVehicle(entity.PersonalVehicle)
   *
   */
  function createAndAddVehicle() : PersonalVehicle {
    var vehicle = new PersonalVehicle(this.Branch)
    addAndNumberVehicle(vehicle)
    vehicle.VehicleType = VehicleType.TC_AUTO
    if (not this.Branch.PolicyLocations.IsEmpty) {
      vehicle.GarageLocation = this.Branch.PolicyLocations.first()
    }
    vehicle.syncModifiers()
    vehicle.syncCoverages()
    return vehicle
  }

  /**
   * Removes a {@link entity.PersonalVehicle} from the line and renumbers the vehicles
   * @param vehicle - the {@link entity.PersonalVehicle} to remove
   * @see #renumberVehicles()
   */
  function removeVehicle(vehicle : PersonalVehicle) {
    this.removeFromVehicles( vehicle )
    renumberVehicles()
  }

  /**
   * Renumbers the vehicles and taking into consideration future vehicles by calling AutoNumberSequence.renumberVehicles()
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumber(com.guidewire.commons.entity.KeyableBean[] arrayToNumber, gw.lang.reflect.IPropertyInfo indexProperty)
   */
  function renumberVehicles() {
    this.PersonalVehicleAutoNumberSeq.renumber(CurrentAndFutureVehicles, PersonalVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Renumbers new vehicles and taking into consideration future vehicles by calling AutoNumberSequence.renumberNewBeans()
   * This is mostly used after creating a new vehicle
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumberNewBeans(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberNewVehicles() {
    this.PersonalVehicleAutoNumberSeq.renumberNewBeans(CurrentAndFutureVehicles, PersonalVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Clones a vehicle's auto number sequence by calling AutoNumberSequence.clone()
   * @see com.guidewire.pc.domain.AutoNumberSequence#clone(gw.pl.persistence.core.Bundle)
   */
  function cloneVehicleAutoNumberSequence() {
    this.PersonalVehicleAutoNumberSeq =  this.PersonalVehicleAutoNumberSeq.clone(this.Bundle)
  }

  /**
   * Resets a vehicle's auto number sequence by calling AutoNumberSequence.reset()
   * @see com.guidewire.pc.domain.AutoNumberSequence#reset()
   */
  function resetVehicleAutoNumberSequence() {
    this.PersonalVehicleAutoNumberSeq.reset()
    renumberVehicles()
  }

  /**
   * Renumbers the vehicles and then binds the auto number sequence of the vehicles by calling AutoNumberSequence.bind()
   * @see com.guidewire.pc.domain.AutoNumberSequence#bind(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function bindVehicleAutoNumberSequence() {
    renumberVehicles() 
    this.PersonalVehicleAutoNumberSeq.bind(CurrentAndFutureVehicles, PersonalVehicle.Type.TypeInfo.getProperty( "VehicleNumber" ))
  }

  /**
   * Initialize the auto number sequence of the vehicles
   * @param bundle - the {@link gw.pl.persistence.core.Bundle} that is used to initialize the {@link com.guidewire.pc.domain.AutoNumberSequence}
   */
  function initializeVehicleAutoNumberSequence(bundle : Bundle) {  
    this.PersonalVehicleAutoNumberSeq = new AutoNumberSequence(bundle)
  }
  
  /**
   * Gets an array of garage locations for all of the vehicles on the policy.
   * @return PolicyLocation[] the garage locations of all vehicles on the policy
   */
  property get GarageLocations() : PolicyLocation[] {
    var garages = this.Vehicles.map( \ vehicle -> vehicle.GarageLocation ).toSet()
    return garages.toTypedArray()
  }
  
 /**
  * Sets Base State to the state of the garage locations and updates coverages.
  */
  function setBaseStateToGarageLocation() {
    //all garages are in the same state, so set to the state of the first garage location
    if(this.GarageLocations != null and this.GarageLocations.Count > 0) {
      this.setBaseState(JurisdictionMappingUtil.getJurisdiction(this.GarageLocations[0]))
    }
  }

 /**
  * Sets primary location to the garage location of the vehicle with the lowest vehicle number.
  */
  function setPrimaryLocation() {
    if (this.GarageLocations != null and this.GarageLocations.Count > 0 and this.Vehicles.length > 0) {
      this.Branch.PrimaryLocation =  this.Vehicles.minBy(\ p -> p.VehicleNumber).GarageLocation
    }
  }
  
  /**
   * Removes all coverages from the line.
   */
  function removeCoverages() {
    for (coverage in this.getCoveragesFromCoverable()) {
      this.removeCoverageFromCoverable(coverage)
    }
  }
   
  /**
   * Sets base state.
   * @param jurisdiction
   */
  function setBaseState(state : Jurisdiction) {
    this.Branch.BaseState = state
  }

  /**
   * Adds a new policy driver to the {@link entity.PersonalAutoLine} as well as the PolicyDriver role to the passed in {@link entity.Contact}
   * @param contact - the contact to have the driver role added
   * @return PolicyDriver - the newly added {@link entity.PolicyDriver}
   */
  function addNewPolicyDriverForContact(contact : Contact) : PolicyDriver {
    if (this.PolicyDrivers.hasMatch(\ driver -> driver.AccountContactRole.AccountContact.Contact == contact)) {
      throw new DisplayableException(displaykey.Web.PolicyDriver.Error.AlreadyExists(contact))
    }
    var policyDriver = this.Branch.addNewPolicyContactRoleForContact(contact, "PolicyDriver") as PolicyDriver
    policyDriver.Excluded = false
    policyDriver.initializeIncidentSummary()
    this.addToPolicyDrivers(policyDriver)
    return policyDriver
  }

  /**
   * Adds a new {@link entity.AccountContact} with type {@link typekey.ContactType} and adds the Driver role to the {@link entity.AccountContact}
   * returns a newly created {@link entity.PolicyDriver}
   * @param contactType - uses the {@link typekey.ContactType} to add a new account contact
   * @return PolicyDriver - the newly added {@link entity.PolicyDriver}
   */
  function addNewPolicyDriverOfContactType(contactType : typekey.ContactType) : PolicyDriver {
    var acctContact = this.Branch.Policy.Account.addNewAccountContactOfType(contactType)
    acctContact.addNewRole( "Driver" )
    return addNewPolicyDriverForContact(acctContact.Contact)
  }

  /**
   * Removes the passed in {@link entity.PolicyDriver} from the line as well as the {@link entity.PolicyDriverMVR} from the driver
   * @param driver - the {@link entity.PolicyDriver} to remove
   */
  function removePolicyDriver(driver: PolicyDriver){
    if(driver.PolicyDriverMVR != null){
      driver.PolicyDriverMVR.remove()
    }
    this.removeFromPolicyDrivers(driver)
  }

  /**
   * For each AccountContact returned by the UnassignedDriver property, add that AccountContact as a Driver to the PALine
   * @return PolicyDriver[] - a list of {@link entity.PolicyDriver} that were added
   */
  function addAllExistingDrivers() : PolicyDriver[] {
    var newDrivers = new ArrayList<PolicyDriver>()
    for(ac in UnassignedDrivers) {
      newDrivers.add(this.addNewPolicyDriverForContact(ac.Contact))
    }
    return newDrivers.toTypedArray()
  }

  /**
   * Gets a list of the drivers that are not added as a {@link entity.PolicyDriver} on the personal auto line
   * @return AccountContact[] - a list of account contacts that have not been added as a {@link entity.PolicyDriver}
   */
  property get UnassignedDrivers() : AccountContact[] {
    var plugin = gw.plugin.Plugins.get(gw.plugin.contact.IContactConfigPlugin)
    var assignedDriverContacts = this.PolicyDrivers.map(\ pd -> pd.AccountContactRole.AccountContact ).toSet()
    var candidates = this.Branch.Policy.Account.getAccountContactsWithAnyRole({"Driver", "AccountHolder", "NamedInsured", "SecondaryContact"})
      .where(\ ac -> plugin.canBeRole(ac.ContactType, "Driver"))
      .toSet()
    return candidates.subtract( assignedDriverContacts ).toTypedArray()
  }

  /**
   * Gets the first valid {@link PersonalVehicle} with vehicle number 1 from the vehicles on the line
   * This is used to get the default container for an additional interest
   * @return PersonalVehicle
   */
  function getDefaultContainerForAddlInterest() : PersonalVehicle {
    var paVehicles = this.Vehicles
    return paVehicles.orderBy( \ c -> c.GarageLocation.LocationNum).thenBy(\ b -> b.VehicleNumber).first()
  }

  /**
   * Gets a list of {@link entity.PATransaction}
   * @return PATransaction[]
   */
  property get PATransactions() : PATransaction[] {
    var branch = this.Branch
    return branch.getSlice(branch.PeriodStart).PATransactions
  }

  /**
   * Initializes the incident summary for each {@link entity.PolicyDriver} on the line
   * @see gw.lob.pa.contact.PolicyDriverEnhancement#initializeIncidentSummary()
   */
  function initializeIncidentSummaries(){
    this.PolicyDrivers.each(\ p -> p.initializeIncidentSummary())
  }
}
