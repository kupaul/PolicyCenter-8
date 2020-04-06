package gw.api.databuilder.pa

uses gw.api.databuilder.DataBuilder

/**
 * @author gclarke
 */
@Export
class VehicleDriverBuilder extends DataBuilder<VehicleDriver, VehicleDriverBuilder> {
  
  construct() {
    super(VehicleDriver)
    withPercentageDriven(100)
  }

  final function withPercentageDriven(percent : int) : VehicleDriverBuilder {
    set(VehicleDriver.Type.TypeInfo.getProperty("PercentageDriven"), percent)
    return this
  }

}
