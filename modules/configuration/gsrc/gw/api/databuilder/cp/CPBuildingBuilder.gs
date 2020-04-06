package gw.api.databuilder.cp

uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.BuilderContext
uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses java.lang.Integer
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.api.util.CurrencyUtil

@Export
class CPBuildingBuilder extends DataBuilder<CPBuilding, CPBuildingBuilder> {

  var _classCode : String

  construct() {
    super(CPBuilding)
    withDefaults()
    constructWithAddPopulator()
  }

  construct(includeDefaults : boolean) {
    super(CPBuilding)
    if (includeDefaults) {
      withDefaults()
    }
    constructWithAddPopulator()
  }

  private function constructWithAddPopulator() {
    addPopulator(Integer.MAX_VALUE, new BeanPopulator<CPBuilding>() {
      override function execute(building : CPBuilding) {
        if (building.Building == null) {
          if (building.CPLocation.Location == null) {  // same behavior in the CPLocationBuilder
            building.CPLocation.Location = building.CPLocation.CPLine.Branch.PrimaryLocation
          }
          building.Building = building.CPLocation.Location.newBuilding()
        }
        if (building.ClassCode == null) {
          var classCode = building.firstMatchingClassCodeOrThrow(_classCode)
          if (classCode == null) {
            throw displaykey.Builder.CPBuilding.Error.InvalidClassCode(_classCode)
          }
          building.ClassCode = classCode
        }
      }
    })
  }

  private function withDefaults() {
    withCoverage(new CoverageBuilder(CPBuildingCov)
                .withPatternCode("CPBldgCov")
                .withDirectTerm("CPBldgCovLimit", 500000))    
    withCoverage(new CoverageBuilder(CPBuildingCov)
                .withPatternCode("CPBPPCov")
                .withDirectTerm("CPBPPCovLimit", 500000))    
    withCoverage(new CoverageBuilder(CPBuildingCov)
                .withPatternCode("CPBldgExtraExpenseCov")
                .withDirectTerm("CPBldgExtraExpenseCovLimit", 500000))
    withCoverage(new CoverageBuilder(CPBuildingCov)
                .withPatternCode("CPBldgBusIncomeCov")
                .withDirectTerm("BusIncomeOtherLimit", 500000))
    withClassCode("0025")
    withCoverageForm(CoverageForm.TC_BPP)
  }
  
  protected override function createBean(context : BuilderContext) : CPBuilding {
    var location = context.ParentBean as CPLocation
    var building = new CPBuilding(location.CPLine.Branch)
    location.addToBuildings(building)
    return building
  }

  function withBuilding(building : BuildingBuilder) : CPBuildingBuilder {
    set(CPBuilding.Type.TypeInfo.getProperty("Building"), building)
    return this
  }

  final function withCoverage(coverageBuilder : CoverageBuilder) : CPBuildingBuilder {
    addAdditiveArrayElement(CPBuilding.Type.TypeInfo.getProperty("Coverages"), coverageBuilder)
    return this
  }
  
  final function withClassCode(classCode : String) : CPBuildingBuilder {
    _classCode = classCode
    return this
  }

  function withCPClassCode(classCode : CPClassCode) : CPBuildingBuilder {
    set(CPBuilding.Type.TypeInfo.getProperty("ClassCode"), classCode)
    return this
  }
  
  final function withCoverageForm(coverageForm : CoverageForm) : CPBuildingBuilder {
    set(CPBuilding.Type.TypeInfo.getProperty("CoverageForm"), coverageForm)
    return this
  }
  
  function withCPBuildingAdditionalInterest(addInterestBuilder : CPBuildingAdditionalInterestBuilder) : CPBuildingBuilder {
    addPopulator(new BuilderArrayPopulator(CPBuilding.Type.TypeInfo.getProperty("AdditionalInterests") as IArrayPropertyInfo, addInterestBuilder))
    return this
  }

  function withCurrency(currency : Currency) : CPBuildingBuilder {
    set(CPBuilding#PreferredCoverageCurrency, currency)
    return this
  }
}
