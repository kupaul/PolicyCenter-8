package gw.api.databuilder.ba

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.util.DateUtil
uses java.util.Date

@Export
class CommercialDriverBuilder extends DataBuilder<entity.CommercialDriver, CommercialDriverBuilder> {

  construct() {
    super(CommercialDriver)
    withFirstName("Bob")
    withLastName("Jones")
    withGender("M")
    withBirthday(DateUtil.addYears(Date.CurrentDate.trimToMidnight(), -30))
    withLicense("ABC123XYZ", "CA")
  }

  protected override function createBean(context : BuilderContext) : CommercialDriver {
    var line = context.ParentBean as BusinessAutoLine
    return line.createAndAddDriverContact()
  }
  
  final function withFirstName(name : String) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("FirstName"), name)
    return this
  }

  final function withLastName(name : String) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("LastName"), name)
    return this
  }

  final function withGender(gender : GenderType) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("Gender"), gender)
    return this
  }

  final function withBirthday(day : Date) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("DateOfBirth"), day)
    return this
  }

  function withMaritalStatus(status : MaritalStatus) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("MaritalStatus"), status)
    return this
  }

  function withYearsExperience(experience : DriverExperience) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("YearsExperience"), experience)
    return this
  }

  final function withLicense(license : String, state : State) : CommercialDriverBuilder {
    set(CommercialDriver.Type.TypeInfo.getProperty("LicenseNumber"), license)
    set(CommercialDriver.Type.TypeInfo.getProperty("LicenseState"), state)
    return this
  }
}
