package gw.api.databuilder.pa
uses gw.api.builder.ModifierBuilder

@Export
class PAVehicleModifierBuilder extends ModifierBuilder<PAVehicleModifier, PAVehicleModifierBuilder> {

  construct() {
    super(PAVehicleModifier)
  }

  function withPAVehicle(paVehicleBuilder : PAVehicleBuilder) : PAVehicleModifierBuilder {
    set(PAVehicleModifier.Type.TypeInfo.getProperty("PAVehicle"), paVehicleBuilder)
    return this
  }
  
}
