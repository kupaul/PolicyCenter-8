package gw.api.databuilder.ba

uses gw.api.databuilder.DataBuilder
uses java.lang.Integer

@Export
class BAHiredAutoBasisBuilder extends DataBuilder<entity.BAHiredAutoBasis, BAHiredAutoBasisBuilder>{

  construct() {
    super(BAHiredAutoBasis)
  }

  function withIfAnyExposure(ifAnyExposure : boolean) : BAHiredAutoBasisBuilder {
    set(BAHiredAutoBasis.Type.TypeInfo.getProperty("IfAnyExposure"), ifAnyExposure)
    return this
  }

  function withBasis(basis : Integer) : BAHiredAutoBasisBuilder {
    set(BAHiredAutoBasis.Type.TypeInfo.getProperty("Basis"), basis)
    return this
  }
}
