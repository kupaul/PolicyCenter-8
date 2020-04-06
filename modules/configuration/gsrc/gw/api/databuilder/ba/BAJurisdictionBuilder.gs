package gw.api.databuilder.ba

uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.ba.BAHiredAutoBasisBuilder
uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.lang.RuntimeException
uses gw.api.util.CurrencyUtil

@Export
class BAJurisdictionBuilder extends DataBuilder<entity.BAJurisdiction, BAJurisdictionBuilder> {
  
  var _state : Jurisdiction
  
  construct() {
    super(BAJurisdiction)
  }
  
  protected override function createBean(context : BuilderContext) : entity.BAJurisdiction{
    if (_state == null) {
      throw new IllegalStateException(displaykey.Builder.BusinessAuto.Jurisdiction.Error.NoState)
    }
    var line = context.ParentBean as BusinessAutoLine
    var jurisdiction = line.addJurisdiction(_state)
    if (jurisdiction == null) {
      throw new RuntimeException(displaykey.Builder.BusinessAuto.Jurisdiction.Error.CouldNotAdd(_state))
    }
    return jurisdiction
  }
  
  function withState(state : Jurisdiction) : BAJurisdictionBuilder {
    _state = state
    set(BAJurisdiction.Type.TypeInfo.getProperty("State"), state)
    return this
  }
  
  function withCoverage(coverageBuilder : CoverageBuilder) : BAJurisdictionBuilder {
    addAdditiveArrayElement(BAJurisdiction.Type.TypeInfo.getProperty("Coverages"), coverageBuilder)
    return this
  }
  
  function withModifier(modifierBuilder : BAJurisModifierBuilder) : BAJurisdictionBuilder {
    addAdditiveArrayElement(BAJurisdiction.Type.TypeInfo.getProperty("BAJurisModifiers"), modifierBuilder)
    return this
  }
  
  function withHiredAutoBasis(baHiredAutoBasisBuilder : BAHiredAutoBasisBuilder) : BAJurisdictionBuilder {
    set(BAJurisdiction.Type.TypeInfo.getProperty("HiredAutoBasis"), baHiredAutoBasisBuilder)
    return this
  }
  
  function withHiredAutoBasis(basis : Integer, ifAnyExposure : Boolean) : BAJurisdictionBuilder {
    return withHiredAutoBasis(new BAHiredAutoBasisBuilder()
          .withBasis(basis)
          .withIfAnyExposure(ifAnyExposure))
  }
 
  function withNonOwnedBasis(baNonOwnedBasisBuilder : BANonOwnedBasisBuilder) : BAJurisdictionBuilder {
    set(BAJurisdiction.Type.TypeInfo.getProperty("NonOwnedBasis"), baNonOwnedBasisBuilder)
    return this
  }
  
  function withNonOwnedBasis(numEmployees : Integer, numPartners : Integer, numVolunteers : Integer) : BAJurisdictionBuilder {
    return withNonOwnedBasis(new BANonOwnedBasisBuilder()
          .withNumEmployees(numEmployees)
          .withNumPartners(numPartners)
          .withNumVolunteers(numVolunteers))
  }

  function withCurrency(currency : Currency) : BAJurisdictionBuilder {
    set(BAJurisdiction#PreferredCoverageCurrency, currency)
    return this
  }
}
