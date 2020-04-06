package gw.policylocation

uses com.guidewire.pl.system.util.DateRange
uses gw.account.AccountLocationToPolicyLocationSyncedField
uses gw.datatype.annotation.DataType
uses java.lang.Integer
uses gw.api.address.AddressFormatter
uses gw.api.domain.LineSpecificLocationContainer

enhancement PolicyLocationEnhancement : PolicyLocation {

  function canChangeState() : boolean {
    if (this.AccountLocation.New){
      if (this.Branch.Policy.Product.Personal and this.Branch.PolicyChange != null){
        // Personal policies is single state always
        return false
      }
      return true
    }
    return false
  }

  /**
   * Return a string giving a compact name for this PolicyLocation
   */
  property get CompactName() : String {
    var name = this.AccountLocation.LocationName
    if (name == null) {
      name = ""
    }
    var addressAsString = addressString(",", false, false)
    return name.Empty or addressAsString.Empty ? name + addressAsString : name + " (" + addressAsString + ")"
  }

  /**
   * This is built for address internationalization.  See AddressFormatter and usages.
   */
  function addressString(delimiter : String, includeCountry : boolean, includeCounty : boolean) : String {
    var formatter = new AddressFormatter() { :IncludeCounty = includeCounty,
                                             :IncludeCountry = includeCountry,
                                             :AddressLine1 = this.AddressLine1,
                                             :AddressLine2 = this.AddressLine2,
                                             :AddressLine3 = this.AddressLine3,
                                             :City         = this.City,
                                             :AddressLine1Kanji = this.AddressLine1Kanji,
                                             :AddressLine2Kanji = this.AddressLine2Kanji,
                                             :CityKanji    = this.CityKanji,
                                             :CEDEX        = this.CEDEX,
                                             :CEDEXBureau  = this.CEDEXBureau,
                                             :State        = this.State,
                                             :PostalCode   = this.PostalCode,
                                             :Country      = this.Country,
                                             :County       = this.County
                                            }
    return formatter.format(formatter, delimiter == "," ? ", " : delimiter)
  }

  property get CountryCode() : String {
    if (this.Country.Code <> null) {
      return this.Country.Code
    }
    return gw.api.system.PLConfigParameters.DefaultCountryCode.Value
  }

  /**
   * Returns an array containing Buildings from current and future slices.
   */
   property get CurrentAndFutureBuildings() : Building[] {
    var buildings = this.Buildings.toList()
    this.Branch.OOSSlices.each(\p -> p.PolicyLocations.where( \pl -> pl.FixedId == this.FixedId)
                                                      *.Buildings.each(\b -> {  if(!buildings.contains(b)) buildings.add(b)}));
    return buildings.toTypedArray()
  }

  function newBuilding() : Building {
    var building = new Building(this.Branch)

    var buildingSideTypes = BuildingSideType.getTypeKeys( false )
    for (var sideType in buildingSideTypes.iterator()) {
        var buildingSide = new BuildingSide(this.Branch)
        buildingSide.BuildingSideType = sideType
        building.addToBuildingSides(buildingSide)
    }
    var buildingImprTypes = BuildingImprType.getTypeKeys( false )
    for (var imprType in  buildingImprTypes.iterator()) {
        var buildingImprovement = new BuildingImprovement(this.Branch)
        buildingImprovement.BuildingImprType = imprType
        building.addToBuildingImprovements(buildingImprovement)
    }
    addAndNumberBuilding(building)
    return building
  }

  function addAndNumberBuilding(building : Building) {
    this.addToBuildings(building)
    this.BuildingAutoNumberSeq.number(building, CurrentAndFutureBuildings, entity.Building.Type.TypeInfo.getProperty( "BuildingNum")) 
  }

  function removeBuilding(building : Building) {
    this.removeFromBuildings(building)
    renumberBuilding()
  }

  function cloneBuildingAutoNumberSequence() {
    this.BuildingAutoNumberSeq = this.BuildingAutoNumberSeq.clone(this.Bundle)
  }

  function resetBuildingAutoNumberSequence() {
    this.BuildingAutoNumberSeq.reset()
    renumberBuilding()
  }

  function bindBuildingAutoNumberSequence() {
    renumberBuilding()
    this.BuildingAutoNumberSeq.bind(CurrentAndFutureBuildings, entity.Building.Type.TypeInfo.getProperty( "BuildingNum" ))
  }

  function renumberBuilding() {
    this.BuildingAutoNumberSeq.renumber(CurrentAndFutureBuildings, entity.Building.Type.TypeInfo.getProperty( "BuildingNum" ) )
  }

  function renumberBuildingAutoNumberSequence() {
    this.BuildingAutoNumberSeq.renumberNewBeans(CurrentAndFutureBuildings, entity.Building.Type.TypeInfo.getProperty( "BuildingNum" ) )
  }

  property get LocationNamedInsuredCandidates() : PolicyNamedInsured[] {
    return this.Branch.PolicyContactRoles
      .whereTypeIs(PolicyAddlNamedInsured)  // restrict it to only PolicyAddlNamedInsureds despite the return type
      .where(\ p ->not this.LocationNamedInsureds.hasMatch( \ l -> l.NamedInsured == p ))
  }

  function addNewLocationNamedInsured(polNamedInsured : PolicyNamedInsured) : LocationNamedInsured {
    if (this.LocationNamedInsureds.hasMatch(\ pni -> pni.NamedInsured == polNamedInsured)) {
      return null
    }
    var newLocationNamedInsured = new LocationNamedInsured(this.Branch)
    this.addToLocationNamedInsureds(newLocationNamedInsured)
    newLocationNamedInsured.NamedInsured = polNamedInsured
    return newLocationNamedInsured
  }

  property get SingleLocationNamedInsured() : PolicyNamedInsured {
    var locNamedIns = this.LocationNamedInsureds.first()
    if (locNamedIns != null) {
      return locNamedIns.NamedInsured
    } else {
      return null
    }
  }

  function getCoverableLocation(policyPeriod : PolicyPeriod) : Coverable {
    var coverableLocations = policyPeriod.Lines.whereTypeIs(LineSpecificLocationContainer)*.LineSpecificLocations.where(
        \ loc -> loc typeis Coverable and loc.PolicyLocation == this)
    return coverableLocations.Count==1 ? coverableLocations.single() as Coverable : null
  }

  property set SingleLocationNamedInsured(polNamedInsured : PolicyNamedInsured) {
    var existingLocNamedInsured = this.LocationNamedInsureds.first()
    if (existingLocNamedInsured != null) {
      this.removeFromLocationNamedInsureds(existingLocNamedInsured)
    }
    if (polNamedInsured != null) {
      this.addNewLocationNamedInsured(polNamedInsured)
    }
  }

  property get LastVersionWM() : PolicyLocation {
    return this.VersionList.AllVersions.last().Unsliced
  }

  property get EffectiveDateRangeWM() : DateRange{
    var allVersions = this.VersionList.AllVersions
    var effDate = allVersions.first().EffectiveDate
    var expDate = allVersions.last().ExpirationDate
    return DateRange.allDatesBetween(effDate, expDate)
  }

  property get PrimaryLoc() : boolean {
    return this.Branch.PrimaryLocation == this
  }

  /**
   * Returns true when this PolicyLocation is up-to-date with regards to the AccountLocation it is
   * linked to.  This always returns true when the PolicyLocation is SyncedToAccount, otherwise
   * it returns true if all the syncable fields match
   */
  function isUpToDate() : boolean {
    // when SyncedToAccount is true, Location is always up to date; otherwise compare fields using == so that comparing nulls returns true
    return this.SyncedToAccount or (
       this.AddressLine1 == this.AccountLocation.AddressLine1 and
       this.AddressLine2 == this.AccountLocation.AddressLine2 and
       this.AddressLine3 == this.AccountLocation.AddressLine3 and
       this.City == this.AccountLocation.City and
       this.AddressLine1Kanji == this.AccountLocation.AddressLine1Kanji and
       this.AddressLine2Kanji == this.AccountLocation.AddressLine2Kanji and
       this.CityKanji == this.AccountLocation.CityKanji and
       this.CEDEX == this.AccountLocation.CEDEX and
       this.CEDEXBureau == this.AccountLocation.CEDEXBureau and
       this.County == this.AccountLocation.County and
       this.State == this.AccountLocation.State and
       this.PostalCode == this.AccountLocation.PostalCode and
       this.Country == this.AccountLocation.Country and
       this.EmployeeCount == this.AccountLocation.EmployeeCount )
  }

  /**
   * Shared and revisioned address line 1.
   */
@DataType("addressline")
  property get AddressLine1() : String {
    return AccountLocationToPolicyLocationSyncedField.AddressLine1.getValue(this)
  }

  /**
   * Shared and revisioned address line 1.
   */
  property set AddressLine1(arg : String) {
    AccountLocationToPolicyLocationSyncedField.AddressLine1.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 2.
   */
@DataType("addressline")
  property get AddressLine2() : String {
    return AccountLocationToPolicyLocationSyncedField.AddressLine2.getValue(this)
  }

  /**
   * Shared and revisioned address line 2.
   */
  property set AddressLine2(arg : String) {
    AccountLocationToPolicyLocationSyncedField.AddressLine2.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 3.
   */
@DataType("addressline")
  property get AddressLine3() : String {
    return AccountLocationToPolicyLocationSyncedField.AddressLine3.getValue(this)
  }

  /**
   * Shared and revisioned address line 3.
   */
  property set AddressLine3(arg : String) {
    AccountLocationToPolicyLocationSyncedField.AddressLine3.setValue(this,arg)
  }

  /**
   * Shared and revisioned city.
   */
  property get City() : String {
    return AccountLocationToPolicyLocationSyncedField.City.getValue(this)
  }

  /**
   * Shared and revisioned city.
   */
  property set City(arg : String) {
    AccountLocationToPolicyLocationSyncedField.City.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 1 kanji.
   */
@DataType("addressline")
  property get AddressLine1Kanji() : String {
    return AccountLocationToPolicyLocationSyncedField.AddressLine1Kanji.getValue(this)
  }

  /**
   * Shared and revisioned address line 1 kanji.
   */
  property set AddressLine1Kanji(arg : String) {
    AccountLocationToPolicyLocationSyncedField.AddressLine1Kanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 2 kanji.
   */
@DataType("addressline")
  property get AddressLine2Kanji() : String {
    return AccountLocationToPolicyLocationSyncedField.AddressLine2Kanji.getValue(this)
  }

  /**
   * Shared and revisioned address line 2 kanji.
   */
  property set AddressLine2Kanji(arg : String) {
    AccountLocationToPolicyLocationSyncedField.AddressLine2Kanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned city kanji.
   */
  property get CityKanji() : String {
    return AccountLocationToPolicyLocationSyncedField.CityKanji.getValue(this)
  }

  /**
   * Shared and revisioned city kanji.
   */
  property set CityKanji(arg : String) {
    AccountLocationToPolicyLocationSyncedField.CityKanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned CEDEX.
   */
  property get CEDEX() : Boolean {
    return AccountLocationToPolicyLocationSyncedField.CEDEX.getValue(this)
  }

  /**
   * Shared and revisioned CEDEX.
   */
  property set CEDEX(arg : Boolean) {
    AccountLocationToPolicyLocationSyncedField.CEDEX.setValue(this, arg)
  }

  /**
   * Shared and revisioned CEDEX bureau.
   */
  property get CEDEXBureau() : String {
    return AccountLocationToPolicyLocationSyncedField.CEDEXBureau.getValue(this)
  }

  /**
   * Shared and revisioned CEDEX bureau.
   */
  property set CEDEXBureau(arg : String) {
    AccountLocationToPolicyLocationSyncedField.CEDEXBureau.setValue(this, arg)
  }

  /**
   * Shared and revisioned county.
   */
  property get County() : String {
    return AccountLocationToPolicyLocationSyncedField.County.getValue(this)
  }

  /**
   * Shared and revisioned county.
   */
  property set County(arg : String) {
    AccountLocationToPolicyLocationSyncedField.County.setValue(this, arg)
  }

  /**
   * Shared and revisioned postal code.
   */
@DataType("postalcode")
  property get PostalCode() : String {
    return AccountLocationToPolicyLocationSyncedField.PostalCode.getValue(this)
  }

  /**
   * Shared and revisioned postal code.
   */
  property set PostalCode(arg : String) {
    AccountLocationToPolicyLocationSyncedField.PostalCode.setValue(this, arg)
  }

  /**
   * Shared and revisioned state.
   */
  property get State() : State {
    return AccountLocationToPolicyLocationSyncedField.State.getValue(this)
  }

  /**
   * Shared and revisioned state.
   */
  property set State(arg : State) {
    AccountLocationToPolicyLocationSyncedField.State.setValue(this, arg)
  }

  /**
   * Shared and revisioned country.
   */
  property get Country() : Country {
    return AccountLocationToPolicyLocationSyncedField.Country.getValue(this)
  }

  /**
   * Shared and revisioned country.
   */
  property set Country(arg : Country) {
    AccountLocationToPolicyLocationSyncedField.Country.setValue(this, arg)
  }

  /**
   * Shared and revisioned description.
   */
  property get Description() : String {
    return AccountLocationToPolicyLocationSyncedField.Description.getValue(this)
  }

  /**
   * Shared and revisioned description.
   */
  property set Description(arg : String) {
    AccountLocationToPolicyLocationSyncedField.Description.setValue(this, arg)
  }

  /**
   * Shared and revisioned date that the address is valid until.
   */
  property get ValidUntil() : DateTime {
    return AccountLocationToPolicyLocationSyncedField.ValidUntil.getValue(this)
  }

  /**
   * Shared and revisioned date that the address is valid until.
   */
  property set ValidUntil(arg : DateTime) {
    AccountLocationToPolicyLocationSyncedField.ValidUntil.setValue(this, arg)
  }

  /**
   * Shared and revisioned address type.
   */
  property get AddressType() : AddressType {
    return AccountLocationToPolicyLocationSyncedField.AddressType.getValue(this)
  }

  /**
   * Shared and revisioned address type.
   */
  property set AddressType(arg : AddressType) {
    AccountLocationToPolicyLocationSyncedField.AddressType.setValue(this, arg)
  }

  /**
   * Shared and revisioned employee count.
   */
  property get EmployeeCount() : Integer {
    return AccountLocationToPolicyLocationSyncedField.EmployeeCount.getValue(this)
  }

  /**
   * Shared and revisioned employee count.
   */
  property set EmployeeCount(arg : Integer) {
    AccountLocationToPolicyLocationSyncedField.EmployeeCount.setValue(this, arg)
  }
}