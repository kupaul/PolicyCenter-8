package gw.api.databuilder.cp

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.builder.BuilderPropertyPopulator
uses gw.entity.IEntityPropertyInfo

@Export
class BuildingBuilder extends DataBuilder<Building, BuildingBuilder> {

  construct() {
    super(Building)
    withNumber(1)
  }

  protected override function createBean(context : BuilderContext) : Building {
    var cpBuilding = context.ParentBean as CPBuilding
    var policyPeriod = cpBuilding.CPLocation.CPLine.Branch
    var building = new Building(policyPeriod)
    var buildingImprovement = new BuildingImprovement(policyPeriod)
    buildingImprovement.BuildingImprType = "Heating"
    building.addToBuildingImprovements(buildingImprovement)    
    var buildingSide = new BuildingSide(policyPeriod)
    buildingSide.BuildingSideType = "Front"
    building.addToBuildingSides(buildingSide)
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
  
  final function withDescription(description : String) : BuildingBuilder {
    set(Building.Type.TypeInfo.getProperty("Description"), description)
    return this
  }
}
