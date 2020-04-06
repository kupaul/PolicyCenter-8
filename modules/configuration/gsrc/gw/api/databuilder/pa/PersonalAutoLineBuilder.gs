package gw.api.databuilder.pa

uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.builder.ExclusionBuilder
uses gw.api.builder.PolicyConditionBuilder
uses gw.api.databuilder.pa.PolicyDriverBuilder
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.api.util.CurrencyUtil

/**
 * @author dpetrusca
 */
@Export
class PersonalAutoLineBuilder extends PolicyLineBuilder<PersonalAutoLine, PersonalAutoLineBuilder> {

  construct() {
    super(PersonalAutoLine)
  }
  
  function withCoverage(coverageBuilder : CoverageBuilder) : PersonalAutoLineBuilder {
    addArrayElement(PersonalAutoLine.Type.TypeInfo.getProperty("PALINECOVERAGES"), coverageBuilder)
    return this
  }

  function withExclusion(exclusionBuilder : ExclusionBuilder) : PersonalAutoLineBuilder {
    addArrayElement(PersonalAutoLine.Type.TypeInfo.getProperty("PALineExclusions"), exclusionBuilder)
    return this
  }
  
  function withCondition(conditionBuilder : PolicyConditionBuilder) : PersonalAutoLineBuilder {
    addArrayElement(PersonalAutoLine.Type.TypeInfo.getProperty("PALineConditions"), conditionBuilder)
    return this
  }
  function withVehicle(vehicle : PAVehicleBuilder) : PersonalAutoLineBuilder {
    addArrayElement(PersonalAutoLine.Type.TypeInfo.getProperty("VEHICLES"), vehicle)
    return this
  }

  function withPolicyDriver(driver : PolicyDriverBuilder) : PersonalAutoLineBuilder {
    addPopulator(new BuilderArrayPopulator(PersonalAutoLine.Type.TypeInfo.getProperty("PolicyDrivers") as IArrayPropertyInfo, driver))
    return this
  }

  function withCurrency(currency : Currency) : PersonalAutoLineBuilder {
    set(PersonalAutoLine#PreferredCoverageCurrency, currency)
    return this
  }
}
