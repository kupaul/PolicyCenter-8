package gw.api.databuilder.bop

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses gw.api.builder.CoverageBuilder
uses java.lang.Integer
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.api.util.CurrencyUtil

@Export
class BOPBuildingBuilder extends DataBuilder<BOPBuilding, BOPBuildingBuilder> {

  construct() {
    super(BOPBuilding)
    withBasisAmount(100000)
    withCoverage(new CoverageBuilder(BOPBuildingCov)
                .withPatternCode("BOPBuildingCov")
                .withDirectTerm("BOPBldgLim", 500000))
    withCoverage(new CoverageBuilder(BOPBuildingCov)
                .withPatternCode("BOPPersonalPropCov")
                .withDirectTerm("BOPBPPBldgLim", 500000))
    addPopulator(Integer.MAX_VALUE, new BeanPopulator<BOPBuilding>() {
      override function execute(building : BOPBuilding) {
        if (building.Building == null) {
          if (building.BOPLocation.Location == null) {  // same behavior in the BOPLocationBuilder
            building.BOPLocation.Location = building.BOPLocation.BOPLine.Branch.PrimaryLocation
          }
          building.Building = building.BOPLocation.Location.newBuilding()
        }
      }
    })
  }

  protected override function createBean(context : BuilderContext) : BOPBuilding {
    var location = context.ParentBean as BOPLocation
    var building = new BOPBuilding(location.PolicyLine.Branch)
    location.addToBuildings(building)
    return building
  }

  function withBuilding(building : BuildingBuilder) : BOPBuildingBuilder {
    set(BOPBuilding.Type.TypeInfo.getProperty("Building"), building)
    return this
  }

  final function withBasisAmount(amount : int) : BOPBuildingBuilder {
    set(BOPBuilding.Type.TypeInfo.getProperty("BasisAmount"), amount)
    return this
  }

  final function withCoverage(coverageBuilder : CoverageBuilder) : BOPBuildingBuilder {
    addAdditiveArrayElement(BOPBuilding.Type.TypeInfo.getProperty("Coverages"), coverageBuilder)
    return this
  }
  
  function withBOPBuildingAdditionalInterest(addInterestBuilder : BOPBuildingAdditionalInterestBuilder) : BOPBuildingBuilder {
    addPopulator(new BuilderArrayPopulator(BOPBuilding.Type.TypeInfo.getProperty("AdditionalInterests") as IArrayPropertyInfo, addInterestBuilder))
    return this
  }
  
  function withClassCode(classCode : BOPClassCode) : BOPBuildingBuilder {
    set(BOPBuilding.Type.TypeInfo.getProperty("ClassCode"), classCode)
    return this
  }

  function withCurrency(currency : Currency) : BOPBuildingBuilder {
    set(BOPBuilding#PreferredCoverageCurrency, currency)
    return this
  }
}
