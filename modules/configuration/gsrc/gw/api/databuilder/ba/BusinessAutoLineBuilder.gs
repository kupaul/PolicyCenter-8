package gw.api.databuilder.ba

uses gw.api.databuilder.ba.BAVehicleBuilder
uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.util.CurrencyUtil

@Export
class BusinessAutoLineBuilder extends PolicyLineBuilder<entity.BusinessAutoLine, BusinessAutoLineBuilder> {

  construct() {
    super(BusinessAutoLine)
    withPolicyType("BA")
  }
  
  function withCoverage(coverageBuilder : CoverageBuilder) : BusinessAutoLineBuilder {
    addArrayElement(BusinessAutoLine.Type.TypeInfo.getProperty("BALineCoverages"), coverageBuilder)
    return this
  }
  
  function withVehicle(vehicleBuilder : BAVehicleBuilder) : BusinessAutoLineBuilder {
    addArrayElement(BusinessAutoLine.Type.TypeInfo.getProperty("Vehicles"), vehicleBuilder)
    return this
  }
  
  function withDriver(driverBuilder : CommercialDriverBuilder) : BusinessAutoLineBuilder {
    addArrayElement(BusinessAutoLine.Type.TypeInfo.getProperty("Drivers"), driverBuilder)
    return this
  }
  
  function withJurisdiction(jurisdictionBuilder : BAJurisdictionBuilder) : BusinessAutoLineBuilder {
    addAdditiveArrayElement(BusinessAutoLine.Type.TypeInfo.getProperty("Jurisdictions"), jurisdictionBuilder)
    return this
  }
  
  function withFleet(fleetType : FleetType) : BusinessAutoLineBuilder {
    set(BusinessAutoLine.Type.TypeInfo.getProperty("Fleet"), fleetType)
    return this
  }
  
  function asFleet() : BusinessAutoLineBuilder {
    return withFleet("Fleet")
  }
  
  function asNonFleet() : BusinessAutoLineBuilder {
    return withFleet("NonFleet")
  }

  function withRateModifier(modifierBuilder : BAModifierBuilder) : BusinessAutoLineBuilder {
    addArrayElement(BusinessAutoLine.Type.TypeInfo.getProperty("BAModifiers"), modifierBuilder) 
    return this
  }

  final function withPolicyType(policyType : typekey.BAPolicyType) : BusinessAutoLineBuilder {
    set(BusinessAutoLine.Type.TypeInfo.getProperty("PolicyType"), policyType)
    return this
  }

  final function withCurrency(currency: Currency) : BusinessAutoLineBuilder {
    set(BusinessAutoLine#PreferredCoverageCurrency, currency)
    return this
  }
}
