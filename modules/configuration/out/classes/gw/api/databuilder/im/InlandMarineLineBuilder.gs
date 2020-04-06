package gw.api.databuilder.im

uses gw.api.builder.PolicyLineBuilder

@Export
class InlandMarineLineBuilder extends PolicyLineBuilder<InlandMarineLine, InlandMarineLineBuilder> {
  construct() {
    super(InlandMarineLine)
  }
  
  function withPart(partBuilder : IMPartBuilder) : InlandMarineLineBuilder {
    addArrayElement(InlandMarineLine.Type.TypeInfo.getProperty("IMCoverageParts"), partBuilder,DEFAULT_ORDER+1)
    return this
  }
  
  function withIMLocation(imLocation : IMLocationBuilder) : InlandMarineLineBuilder {
    addArrayElement(InlandMarineLine.Type.TypeInfo.getProperty("IMLocations"), imLocation,DEFAULT_ORDER)
    return this
  }
}
