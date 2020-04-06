package gw.api.databuilder.bop

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.builder.BuilderPropertyPopulator
uses gw.entity.IEntityPropertyInfo

@Export
class BuildingBuilder extends DataBuilder<Building, BuildingBuilder> {

  construct() {
    super(Building)
    withNumber(0)
  }

  protected override function createBean(context : BuilderContext) : Building {
    var bopBuilding = context.ParentBean as BOPBuilding
    var policyPeriod = bopBuilding.BOPLocation.BOPLine.Branch
    var building = new Building(policyPeriod)
    building.PolicyLocation = policyPeriod.PrimaryLocation
    return building
  }
  
  function withLocation(policyLocationBuilder : PolicyLocationBuilder) : BuildingBuilder {
    addPopulator(new BuilderPropertyPopulator(Building.Type.TypeInfo.getProperty("PolicyLocation") as IEntityPropertyInfo, policyLocationBuilder))
    return this
  }

  final function withNumber(number : int) : BuildingBuilder {
    set(Building.Type.TypeInfo.getProperty("BuildingNum"), number)
    return this
  }

  function withAlarmCertificate( certificateNum : String ) : BuildingBuilder
  {
    set( Building.Type.TypeInfo.getProperty( "AlarmCertificate" ), certificateNum )
    return this
  }
}
