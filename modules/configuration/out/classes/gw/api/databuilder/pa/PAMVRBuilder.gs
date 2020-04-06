package gw.api.databuilder.pa
uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria

@Export
class PAMVRBuilder extends DataBuilder<MVR, PAMVRBuilder> {
  construct() {
    super(MVR)
    
    withFirstName("John")    
    withLastName("Smith")    
    withDateOfBirth(Date.Today)
    withMiddleName("S")
    withYearsRequested(7)
    withReportDate(Date.Yesterday)
    withReportNumber(1)
  }
  
  final function withDefault1() : PAMVRBuilder{
    addMVRIncident(new PAMVRIncidentBuilder())
    return this
  }
  
  final function withDefault2() : PAMVRBuilder{
    addMVRIncident(new PAMVRIncidentBuilder().withDefaultViol1())
    return this
  }  
 
  final function withDefault3() : PAMVRBuilder{
    addMVRIncident(new PAMVRIncidentBuilder().withDefaultViol2())
    return this
  }
  
  final function withMVRData(mvrSC : MVRSearchCriteria) : PAMVRBuilder {    
    withFirstName(mvrSC.FirstName)    
    withLastName(mvrSC.LastName)
    withMiddleName(mvrSC.MiddleName)
    withDateOfBirth(mvrSC.DateOfBirth)
    return this
  }

  final function withReportNumber(reportPageNumber: int) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("ReportNumber"), reportPageNumber)
    return this
  }

  final function withFirstName(firstName: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("FirstName"), firstName)
    return this
  }
  
  final function withLastName(lastName: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("LastName"), lastName)
    return this
  }
  
  final function withMiddleName(middleName: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("MiddleName"), middleName)
    return this
  }
  
  final function withSSN(ssn : String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("SSN"), ssn)
    return this
  }
  
  final function withDateOfBirth(dateOfBirth: Date) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("DateOfBirth"), dateOfBirth)
    return this
  }
  
  final function withGender(gender: GenderType) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Gender"), gender)
    return this
  }
  
  final function withYearsRequested(yearsRequested: int) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("YearsRequested"), yearsRequested)
    return this
  }
  
  final function withReportDate(reportDate: java.util.Date) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("ReportDate"), reportDate)
    return this
  }

  final function withHeight(height: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Height"), height)
    return this
  }
  
  final function withWeight(weight: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Weight"), weight)
    return this
  }
  
  final function withEyes(eyes: String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Eyes"), eyes)
    return this
  }
  
  final function withHair(hair : String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Hair"), hair)
    return this
  }
  
  final function withRace(race : String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Race"), race)
    return this
  }
  
  final function withDonor(donor : boolean) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Donor"), donor)
    return this
  }
  
  final function withMiscellaneous(miscellaneous : String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("Miscellaneous"), miscellaneous)
    return this
  }
  
  final function withAdditionalDrivers(additionalDrivers : String) : PAMVRBuilder {
    set(MVR.Type.TypeInfo.getProperty("AdditionalDrivers"), additionalDrivers)
    return this
  }
  
//  function addMVRIncident(mvrIB : PAMVRIncidentBuilder) : PAMVRBuilder{
//    addPopulator(new BuilderArrayPopulator(MVR.Type.TypeInfo.getProperty("Incidents") as IArrayPropertyInfo, mvrIB))
//    return this
//  }  
  
  final function withMVROrder(mvrOrder : entity.MVROrder) : PAMVRBuilder {
    set(MVRIncident.Type.TypeInfo.getProperty("MVROrder"), mvrOrder)
    return this  
  }
  
  function addMVRIncident(mvrIB : PAMVRIncidentBuilder) : PAMVRBuilder{
    addArrayElement(MVR.Type.TypeInfo.getProperty("IncidentEntities"), mvrIB)
    return this
  }  
  
  function withNoMVRIncident() : PAMVRBuilder{
    set(MVR.Type.TypeInfo.getProperty("Incidents"), null)
    return this
  }
}
