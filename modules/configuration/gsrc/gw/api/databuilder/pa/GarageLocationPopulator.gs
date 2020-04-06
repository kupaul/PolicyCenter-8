package gw.api.databuilder.pa

uses gw.api.databuilder.populator.BeanPopulator
uses gw.api.builder.PolicyLocationBuilder
uses java.lang.RuntimeException

@Export
public class GarageLocationPopulator implements BeanPopulator<PersonalVehicle> {
  
  var _builder : PolicyLocationBuilder

  construct(builder : PolicyLocationBuilder) {
    this._builder = builder
  }

  override function execute(bean : PersonalVehicle) {
    var value = _builder.LastCreatedBean
    if (value == null) {
        throw new RuntimeException(displaykey.Builder.PersonalVehicle.LocationBuilder.Error.CreateNotCalled(_builder.Class.Name))
    }
    bean.GarageLocation = value
  }
}
