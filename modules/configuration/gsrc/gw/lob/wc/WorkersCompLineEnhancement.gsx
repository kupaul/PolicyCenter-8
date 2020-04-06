package gw.lob.wc

uses java.util.Set
uses entity.windowed.WCCoveredEmployeeVersionList
uses entity.windowed.WCFedCoveredEmployeeVersionList
uses java.lang.Integer
uses java.util.HashMap
uses java.lang.NullPointerException
uses gw.api.domain.StateSet
uses java.util.ArrayList
uses gw.api.util.DisplayableException
uses gw.lob.wc.options.WCOption
uses gw.plugin.Plugins
uses gw.plugin.contact.IContactConfigPlugin
uses java.util.Date
uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.api.util.StateJurisdictionMappingUtil

enhancement WorkersCompLineEnhancement : entity.WorkersCompLine {

  property get SettlementCurrency() : Currency {
    return this.Branch.PreferredSettlementCurrency    
  }

  property get AllWCExposuresWM() : java.util.List<entity.WCCoveredEmployee> {
    return this.VersionList.WCCoveredEmployees.flatMap(\e -> e.AllVersions)
  }

  property get HasRetrospectiveRatingPlan() : boolean {
    return this.RetrospectiveRatingPlan != null
  }

  property set HasRetrospectiveRatingPlan(hasPlan : boolean) {
    if (HasRetrospectiveRatingPlan == hasPlan) {
      return
    }
    if (hasPlan) {
      var plan = new WCRetrospectiveRatingPlan(this.Branch)
      this.RetrospectiveRatingPlan = plan
    } else {
      var oldPlan = this.RetrospectiveRatingPlan
      if (oldPlan != null) {
        this.Bundle.delete(oldPlan)
        oldPlan.LettersOfCredit.each(\loc -> this.Bundle.delete(loc))
        oldPlan.StateMultipliers.each(\mult -> this.Bundle.delete(mult))
      }
      this.RetrospectiveRatingPlan = null
    }
  }

  property get WCCoveredEmployeeVLs(): List<WCCoveredEmployeeVersionList> {
    var a = this.VersionList.WCCoveredEmployees
    return a
  }

  property get WCFedCoveredEmployeeVLs(): List<WCFedCoveredEmployeeVersionList> {
    var a = this.VersionList.WCFedCoveredEmployees
    return a
  }

  property get HasWCWaiverofSubro() : Boolean {
    return this.WCWaiverOfSubros.Count > 0
  }

  property get HasOwnerOfficer(): boolean {
    return this.Branch.WorkersCompLine.PolicyOwnerOfficers.Count > 0
  }

  property get HasEmployeeLeasing(): boolean {
    return this.Branch.WorkersCompLine.PolicyLaborClients.Count > 0 or
           this.Branch.WorkersCompLine.PolicyLaborContractors.Count > 0
  }

  property get HasInclExclIndividuals(): boolean {
    return this.InclusionPersons.Count > 0
  }

  property set HasInclExclIndividuals(hasInclPerson : boolean) {
    // do nothing if same selection
    if (HasInclExclIndividuals == hasInclPerson) {
      return
    }

    if (hasInclPerson == false) {
      for (person in this.InclusionPersons) {
        this.removeFromInclusionPersons(person)
      }
    } else {
      this.createAndAddInclusionPerson()
    }
  }

  property get HasWCAircraftSeats(): boolean {
    return this.WCAircraftSeats.Count > 0
  }

  property set HasWCAircraftSeats(hasAircraftSeat : boolean) {
    // do nothing if same selection
    if (HasWCAircraftSeats == hasAircraftSeat) {
      return
    }

    if (hasAircraftSeat == false) {
      for (aircraftSeat in this.WCAircraftSeats) {
        this.removeFromWCAircraftSeats(aircraftSeat)
      }
    } else {
      this.addToWCAircraftSeats(new WCAircraftSeat(this.Branch))
    }
  }

  property get HasWCExcludedWorkplace(): boolean {
    return this.WCExcludedWorkplaces.Count > 0
  }

  property set HasWCExcludedWorkplace(has: boolean) {
    if (HasWCExcludedWorkplace == has) {
      return
    } else if (has == false) {
      for (exclusion in this.WCExcludedWorkplaces) {
        this.removeFromWCExcludedWorkplaces(exclusion)
      }
    } else if (has == true) {
      createAndAddWCExcludedWorkplace()
    }
  }

  property get InterstateNamedInsuredOfficialIDs(): OfficialID[] {
    var jurisdictionStates = this.Jurisdictions.map(\j -> j.State)
    return this.Branch.getNamedInsuredOfficialIDsForState(null)
        .where(\ id -> id.OfficialIDType != "SSN" and id.OfficialIDType != "FEIN" and
                   (id as PCOfficialID).Pattern.ApplicableStatesAsArray.countWhere(\s ->jurisdictionStates.contains(StateJurisdictionMappingUtil.getJurisdictionMappingForState(s))) > 0)
  }

  property get HasParticipatingPlan() : boolean {
    return this.getParticipatingPlan() != null
  }

  property set HasParticipatingPlan(hasPlan : boolean) {
    if (HasParticipatingPlan == hasPlan) {
      return
    }
    if (hasPlan) {
      var plan = new WCParticipatingPlan(this.Branch)
      this.ParticipatingPlan = plan
    } else {
      var oldPlan = this.ParticipatingPlan
      if (oldPlan != null) {
        this.Bundle.delete(oldPlan)
      }
      this.ParticipatingPlan = null
    }
  }

  function getExistingOrFutureCoveredEmployeesRelatedToLocation(location : PolicyLocation)  : List<WCCoveredEmployee> {
    return this.VersionList.WCCoveredEmployees.flatMap(\ wcCovEmpVL -> wcCovEmpVL.AllVersions)
      .where(\ wcCovEmp -> wcCovEmp.Location.FixedId == location.FixedId and wcCovEmp.ExpirationDate > location.SliceDate)
  }

  function getExistingOrFutureCoveredEmployeesRelatedToJurisdiction(jurisdiction : WCJurisdiction)  : List<WCCoveredEmployee> {
    return this.VersionList.WCCoveredEmployees.flatMap(\ wcCovEmpVL -> wcCovEmpVL.AllVersions)
      .where(\ wcCovEmp -> wcCovEmp.Jurisdiction.FixedId == jurisdiction.FixedId
         and wcCovEmp.ExpirationDate > jurisdiction.SliceDate)
  }
    
  function getWCCoveredEmployeesWM(state : Jurisdiction) : WCCoveredEmployee[]{
    var versionLists = this.VersionList.WCCoveredEmployees
    var employees = new ArrayList<WCCoveredEmployee>()
    for(v in versionLists){
      var first = v.AllVersions.first()
      if(first.Location.State == StateJurisdictionMappingUtil.getStateMappingForJurisdiction(state)){
        employees.add(first)
      }
    }
    return employees.toTypedArray()
  }

  function getWCFedCoveredEmployeesWM(state : Jurisdiction) : WCFedCoveredEmployee[]{
    var versionLists = this.VersionList.WCFedCoveredEmployees
    var employees = new ArrayList<WCFedCoveredEmployee>()
    for(v in versionLists){
      var first = v.AllVersions.first()
      if(first.Location.State == StateJurisdictionMappingUtil.getStateMappingForJurisdiction(state)){
        employees.add(first)
      }
    }
    return employees.toTypedArray()
  }

  function addCoveredEmployeeWM(state : State) : WCCoveredEmployee {
    var eu = createAndAddWCCoveredEmployee()
    var monopolisticStates = gw.api.domain.StateSet.get(gw.api.domain.StateSet.WC_MONOPOLISTIC)
    if (monopolisticStates.contains(state)) {
      eu.SpecialCov = SpecialCov.TC_STOP
    }
    return eu.VersionList.AllVersions.single()
  }

  function addJurisdiction(state : Jurisdiction) : WCJurisdiction {
    if (state == null) throw new NullPointerException("state")
    var jurisdiction = getJurisdiction(state)
    if (jurisdiction == null and not this.Bundle.ReadOnly) {
      jurisdiction = new WCJurisdiction(this.Branch)
      jurisdiction.State = state
      jurisdiction.WCLine = this
      this.addToJurisdictions(jurisdiction)
      this.Branch.updateOfficialIDs()
      jurisdiction.AnniversaryDate = this.Branch.getPeriodStart()

      var windowModeJurisdiction = jurisdiction.Unsliced
      windowModeJurisdiction.setEffectiveWindow(this.Branch.PeriodStart, this.Branch.PeriodEnd)
      jurisdiction = windowModeJurisdiction.getSlice(jurisdiction.EffectiveDate)
      jurisdiction.syncModifiers()
      jurisdiction.createCoveragesConditionsAndExclusions()
      jurisdiction = jurisdiction.getSlice(this.SliceDate)
    }
    return jurisdiction
  }

  function getAvailableParticipatingPlanIDs() : WCParticipatingPlanID[] {
    var allIDs = WCParticipatingPlanID.getTypeKeys(false)
    var jurisdictions = this.Branch.getLocationStates()
    var selected = new ArrayList<WCParticipatingPlanID>()
    for (allID in allIDs) {
      var id = allID
      for (jurisdiction in jurisdictions) {
        var state = StateJurisdictionMappingUtil.getStateMappingForJurisdiction(jurisdiction)
        if (id.hasCategory(state)) {
          if (!selected.contains(id)) {
            selected.add(id)
          }
        }
      }
    }
    return selected.toTypedArray()
  }

  function createAndAddWCCoveredEmployee() : WCCoveredEmployee {
    var eu = new WCCoveredEmployee(this.Branch)
    eu.SpecialCov = SpecialCov.TC_STAT
    this.addToWCCoveredEmployees(eu)
    return eu
  }

  function createAndAddWCFedCoveredEmployee() : WCFedCoveredEmployee {
    var eu = new WCFedCoveredEmployee(this.Branch)
    eu.SpecialCov = "mari"
    this.addToWCFedCoveredEmployees(eu)
    return eu
  }

  function updateWCExposuresAndModifiers() {
    this.getJurisdictions().each(\j -> {
      j.updateExposures()
      j.splitModifiers()
      j.splitCoverages()
    })
  }

  function removeJurisdiction(jurisdiction : WCJurisdiction) {
    if (not jurisdiction.CanRemove) {
      throw new DisplayableException(displaykey.WorkersComp.Jurisdiction.CannotRemove(jurisdiction))
    }

    //also remove any locations used by jurisdiction
    var locationsToRemove = this.PolicyLocations.where(\ p -> p.State.Code == jurisdiction.State.Code)
    locationsToRemove.each(\ l -> this.Branch.removeLocation(l))
    
    jurisdiction.getSlice(jurisdiction.EffectiveDate).remove()
  }

  function getWCCoveredEmployees(state : State) : WCCoveredEmployee[] {
    var wcCoveredEmployees = this.getWCCoveredEmployees()
    var emps = new ArrayList<WCCoveredEmployee>()
    for (wcCoveredEmployee in wcCoveredEmployees) {
      if (wcCoveredEmployee.getLocation().getState() == state) {
        emps.add(wcCoveredEmployee)
      }
    }
    return emps.toArray(new WCCoveredEmployee[emps.size()])
  }

  function getWCFedCoveredEmployees(state : State) : WCFedCoveredEmployee[] {
    var wcFedCoveredEmployees = this.getWCFedCoveredEmployees()
    var emps = new ArrayList<WCFedCoveredEmployee>()
    for (wcFedCoveredEmployee in wcFedCoveredEmployees) {
      if (wcFedCoveredEmployee.getLocation().getState() == state) {
        emps.add(wcFedCoveredEmployee)
      }
    }
    return emps.toArray(new WCFedCoveredEmployee[emps.size()])
  }

  function getJurisdiction(state : Jurisdiction) : WCJurisdiction {
    return this.Jurisdictions.firstWhere(\j -> j.State == state)
  }

  function getClassCodesForWCCoveredEmployees(state: State): WCClassCode[] {
    return this.WCCoveredEmployees.where(\e -> e.Location.State == state).map(\e -> e.ClassCode).toSet().toTypedArray()
  }

  /**
   * Createa and adds a new WCFedCoveredEmployee to this policy line.
   */
  function createAndAddWCWaiverOfSubro(waiverType : typekey.WaiverOfSubrogationType): WCWaiverOfSubro {
    var eu = new WCWaiverOfSubro(this.Branch)
    eu.SpecialCov = SpecialCov.TC_STAT
    eu.Type = waiverType
    this.addToWCWaiverOfSubros(eu)
    return eu
  }

    /*  Add Aircraft seat */
  function createAndAddWCAircraftSeat() : WCAircraftSeat {
    var seat = new WCAircraftSeat(this.Branch)
    this.addToWCAircraftSeats(seat)
    return seat
  }

  function createAndAddInclusionPerson() : InclusionPerson {
    var inclusionPerson = new InclusionPerson(this.Branch)
    this.addToInclusionPersons(inclusionPerson)
    return inclusionPerson
  }

  function validateIncludedStates(includedStates : String): String {
    var coveredStates: Set<String> = this.Jurisdictions*.State*.Code as Set<String>
    var monopolisticStates = StateSet.get(StateSet.WC_MONOPOLISTIC)
    var incStates =  StateSet.get(includedStates)

    if (incStates != null) {
      for (state in incStates.toArray()) {
        if (monopolisticStates.contains(state)) {
          return displaykey.WorkersComp.InsuredStates.CannotInsureMonopolisticState(state.Description)
        }
        if (coveredStates.contains(state.Code)) {
          return displaykey.WorkersComp.InsuredStates.CannotInsureCoveredState(state.Description)
        }
      }
    } else {
      return displaykey.WorkersComp.InsuredStates.ListRequired
    }
    return null
  }

  function validateExcludedStatesContainMonopolisticStates(excludedStates : String) : String {
    if (this.WCOtherStatesInsurance.WCOtherStatesOptTerm.Value == "AllExcept") {
      var monopolisticStates = StateSet.get(StateSet.WC_MONOPOLISTIC)
      var exclStates =  StateSet.get(excludedStates)
      var notExclStates = new ArrayList()
      for (state in monopolisticStates.toArray()) {
        if (!exclStates.contains(state)) {
          notExclStates.add(state.DisplayName)
        }
      }
      if (notExclStates.Count > 0) {
        return displaykey.WorkersComp.InsuredStates.MustExcludeMonopolisticState(notExclStates.join(", "))
      }
    }
    return null
  }

  function validateIncludedMonopolisticStates(includedStates : String): String {
    var nonMonopolisticStates = StateSet.get(StateSet.WC_NOTMONOPOLISTIC)
    var inclStates =  StateSet.get(includedStates)

    if (inclStates != null) {
      for (state in inclStates.toArray()) {
        if (nonMonopolisticStates.contains(state)) {
          return displaykey.WorkersComp.InsuredStates.CannotIncludeNonMonopolisticState(state.Description)
        }
      }
    }
    return null
  }

  function recalculateGoverningClasscode() {
    var classCodes = new HashMap<WCClassCode, Integer>()
    var employees = this.VersionList.WCCoveredEmployees
    for (employee in employees) {
      for (version in employee.AllVersions) {
        var oldBasis = classCodes[version.ClassCode]
        classCodes[version.ClassCode] = (oldBasis == null ? 0 : oldBasis) + (version.BasisAmount == null ? 0 : version.BasisAmount)
      }
    }
    this.GoverningClass = classCodes.Keys.maxBy(\ code -> classCodes[code])
  }

  function firstMatchingClassCode(code : String, refDateState: Jurisdiction, wcDomain : String, peviousCode : WCClassCode) : WCClassCode {
    if (code == null) {
      return null
    }
    var criteria = new WCClassCodeSearchCriteria()
    criteria.Code = code
    criteria.PreviousSelectedClassCode = peviousCode.Code
    criteria.Domain = wcDomain
    criteria.EffectiveAsOfDate = this.getReferenceDateForCurrentJob(refDateState)
    var result = criteria.performSearch()
    if(result.Count != 1){
      return null
    }
    return result.AtMostOneRow
  }

  function doesClassCodeExist(code : String, refDateState: Jurisdiction, wcDomain : String, peviousCode : WCClassCode, classIndicator : String) : boolean {
    if (code == null) {
      return null
    }
    var criteria = new WCClassCodeSearchCriteria()
    criteria.Code = code
    criteria.PreviousSelectedClassCode = peviousCode.Code
    criteria.Domain = wcDomain
    criteria.EffectiveAsOfDate = this.getReferenceDateForCurrentJob(refDateState)
    criteria.ClassIndicatior = classIndicator
    criteria.ExactMatch = true
    var query = criteria.performSearch()
    return query.Count > 0
  }

  function firstMatchingClassCodeOrThrow(code : String, refDateState : Jurisdiction, wcDomain: String, peviousCode : WCClassCode) : WCClassCode{
    var retVal = firstMatchingClassCode(code, refDateState, wcDomain, peviousCode)
    if (retVal == null){
      throw new gw.api.util.DisplayableException(displaykey.Java.ClassCodePickerWidget.WCInvalidCode(code, refDateState))
    }
    return retVal
  }

  function createAndAddWCExcludedWorkplace(): WCExcludedWorkplace {
    var exclusion = new WCExcludedWorkplace(this.Branch)
    this.addToWCExcludedWorkplaces(exclusion)
    return exclusion
  }

  function getExcludedPersonStates(person : InclusionPerson, policyPeriod : PolicyPeriod) : java.util.List<typekey.Jurisdiction> {
    if(person.Inclusion == "incl"){
      return policyPeriod.WorkersCompLine.Jurisdictions*.State.sortBy(\ s -> s.Code).toList()
    }
    var monopolisticStates  = StateSet.get(StateSet.WC_MONOPOLISTIC).toArray()
    var states = gw.api.contact.AddressAutocompleteUtil.getStates(policyPeriod.PrimaryLocation.AccountLocation.Country).toList()
    states.removeAll(monopolisticStates.toList())
    var jurisditions : List<Jurisdiction>
    for(state in states){
      jurisditions.add(StateJurisdictionMappingUtil.getJurisdictionMappingForState(state))
    }
    return jurisditions
  }

  property get WCOptions() : List<WCOption> {
    return WCOption.createOptionList(this.Branch)
  }

  function addNewOwnerOfficerOfContactType(contactType : ContactType) : PolicyOwnerOfficer {
    var acctContact = this.Branch.Policy.Account.addNewAccountContactOfType(contactType)
    return addNewOwnerOfficerForContact(acctContact.Contact)
  }

  /**
   * adds an Owner Officer to the WC Line for the given Account Contact
   * if the Account Contact does not have a role of "Owner Officer" already, the role is added to the Account Contact
   * throws an exception if an Owner Officer for the given Account Contact already exists on this line
   */
  function addNewOwnerOfficerForContact(contact : Contact) : PolicyOwnerOfficer {
    if (this.PolicyOwnerOfficers.firstWhere(\ p -> p.AccountContactRole.AccountContact.Contact == contact) != null) {
      throw new UserDisplayableException(displaykey.Web.Contact.PolicyOwnerOfficer.Error.AlreadyExists(contact))
    }
    var policyOwnerOfficer = this.Branch.addNewPolicyContactRoleForContact(contact, "PolicyOwnerOfficer") as PolicyOwnerOfficer
    this.addToPolicyOwnerOfficers(policyOwnerOfficer)

    return policyOwnerOfficer
  }

  /**
   * For each AccountContact returned by the UnassignedOwnerOfficer property,
   * add that AccountContact as an Owner Officer to the WCLine
   */
  function addAllExistingOwnerOfficers() : PolicyOwnerOfficer[] {
    var newOwnerOfficers = new ArrayList<PolicyOwnerOfficer>()
    for(ac in UnassignedOwnerOfficers) {
      newOwnerOfficers.add(this.addNewOwnerOfficerForContact(ac.Contact))
    }
    return newOwnerOfficers.toTypedArray()
  }

  /**
   * All the account Owner Officers that are not already assigned to this policy line.
   */
  property get UnassignedOwnerOfficers() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyOwnerOfficer")
    var assignedOwnerOfficers = this.PolicyOwnerOfficers.map(\ ownerOfficer -> ownerOfficer.AccountContactRole.AccountContact)
    return this.Branch.Policy.Account
      .getAccountContactsWithRole(accountContactRoleType)
      .subtract(assignedOwnerOfficers)
      .toTypedArray()
  }

  /**
   * Any account contact that is not an Owner Officer.
   */
  property get OwnerOfficerOtherCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyOwnerOfficer")
    return this.Branch.Policy.Account.ActiveAccountContacts
      .where(\ ac -> plugin.canBeRole(ac.ContactType, accountContactRoleType) and not ac.hasRole(accountContactRoleType))
  }

  property get PolicyLaborClientDetailExistingCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyLaborClient")
    return this.Branch.Policy.Account.getAccountContactsWithRole(accountContactRoleType)
  }

  property get PolicyLaborClientDetailOtherCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyLaborClient")
    return this.Branch.Policy.Account.ActiveAccountContacts
      .where(\ acr -> plugin.canBeRole(acr.ContactType, accountContactRoleType) and not acr.hasRole(accountContactRoleType))
  }

  property get PolicyLaborContractorDetailExistingCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyLaborContractor")
    return this.Branch.Policy.Account.getAccountContactsWithRole(accountContactRoleType)
  }

  property get PolicyLaborContractorDetailOtherCandidates() : AccountContact[] {
    var plugin = Plugins.get(IContactConfigPlugin)
    var accountContactRoleType = plugin.getAccountContactRoleTypeFor("PolicyLaborContractor")
    return this.Branch.Policy.Account.ActiveAccountContacts
      .where(\ acr -> plugin.canBeRole(acr.ContactType, accountContactRoleType) and not acr.hasRole(accountContactRoleType))
  }

  function addNewLaborClientDetailForContactType(ctype : ContactType) : WCLaborContactDetail {
    return addNewLaborClientDetailForContact(this.Branch.Policy.Account.addNewAccountContactOfType(ctype).Contact)
  }

  function addNewLaborClientDetailForContact(contact : Contact) : WCLaborContactDetail {
    var policyLaborClient = this.PolicyLaborClients.firstWhere(\ plc -> plc.AccountContactRole.AccountContact.Contact == contact)
    if (policyLaborClient == null) {
      policyLaborClient = this.Branch.addNewPolicyContactRoleForContact(contact, "PolicyLaborClient") as PolicyLaborClient
      this.addToPolicyLaborClients(policyLaborClient)
    }
    return policyLaborClient.addNewDetail()
  }

  function addNewLaborContractorDetailForContactType(ctype : ContactType) : WCLaborContactDetail {
    return addNewLaborContractorDetailForContact(this.Branch.Policy.Account.addNewAccountContactOfType(ctype).Contact)
  }

  function addNewLaborContractorDetailForContact(contact : Contact) : WCLaborContactDetail {
    var policyLaborContractor = this.PolicyLaborContractors.firstWhere(\ plc -> plc.AccountContactRole.AccountContact.Contact == contact)
    if (policyLaborContractor == null) {
      policyLaborContractor = this.Branch.addNewPolicyContactRoleForContact(contact, "PolicyLaborContractor") as PolicyLaborContractor
      this.addToPolicyLaborContractors(policyLaborContractor)
    }
    return policyLaborContractor.addNewDetail()
  }

  function setDefaultExcludedStates(cov : WCOtherStatesInsurance) {
    var excludedStates = cov.WCExcludedStatesTerm.Value
    if (cov.WCOtherStatesOptTerm.Value == "AllExcept" and excludedStates == null) {
      var monopolistic = gw.api.domain.StateSet.get(gw.api.domain.StateSet.WC_MONOPOLISTIC)
      cov.WCExcludedStatesTerm.Value = monopolistic.toString()
    }
  }

  property get WCTransactions() : WCTransaction[] {
    var branch = this.Branch
    return branch.getSlice(branch.PeriodStart)  .WCTransactions
  }

  function addRPSD(splitDate : Date, splitType : RPSDType, jurisdictions : WCJurisdiction[]){
    for(j in jurisdictions){
      j.addRatingPeriodStartDate(splitDate, splitType)
    }
    updateWCExposuresAndModifiers()
  }

  /**
   * Returns a set of the first version of any WCJurisdiction that ever existed on this
   * line, in window mode.
   */
  property get RepresentativeJurisdictions() : WCJurisdiction[]
  {
    return this.Jurisdictions.map(\ j -> j.Unsliced)
  }
}
