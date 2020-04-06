package gw.api.databuilder.cp

uses java.lang.Integer
uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.builder.BuilderPropertyPopulator
uses gw.entity.IEntityPropertyInfo
uses gw.api.util.CurrencyUtil

@Export
class CPLocationBuilder extends DataBuilder<CPLocation, CPLocationBuilder> {
  
  construct() {
    super(CPLocation)
    addPopulator(Integer.MAX_VALUE, new BeanPopulator<CPLocation>() {
      override function execute(loc : CPLocation) {
        var period = loc.CPLine.Branch
        if (loc.Location == null) {  // this is duplicated in the CPBuildingBuilder
          loc.Location = period.PrimaryLocation          
        }
      }
    })
  }

  protected override function createBean(context : BuilderContext) : CPLocation {    
    var cpLoc : CPLocation = null
    var line : CommercialPropertyLine = null
    line = context.ParentBean as CommercialPropertyLine
    cpLoc = super.createBean(context)
    line.addToCPLocations(cpLoc)
    return cpLoc
  }

  function withLocation(policyLocationBuilder : PolicyLocationBuilder) : CPLocationBuilder {
    addPopulator(new BuilderPropertyPopulator(CPLocation.Type.TypeInfo.getProperty("Location") as IEntityPropertyInfo, policyLocationBuilder))
    return this
  }

  function withExistingLocation(policyLocation : PolicyLocation) : CPLocationBuilder {
    set(CPLocation.Type.TypeInfo.getProperty("Location"), policyLocation)
    return this
  }

  public function withLocationAtIndex(ind : int) : CPLocationBuilder {
    addPopulator(60, new BeanPopulator<CPLocation>() {
      public override function execute(bean : CPLocation) {
        final var locations : PolicyLocation[] = bean.Branch.PolicyLocations
        final var location : PolicyLocation = locations[ind]
        bean.PolicyLocation = location
      }
    })
    return this
  }
  
  function withBuilding(cpBuildingBuilder : CPBuildingBuilder) : CPLocationBuilder {
    addArrayElement(CPLocation.Type.TypeInfo.getProperty("Buildings"), cpBuildingBuilder)
    return this
  }

  function withABuilding() : CPLocationBuilder {
    return withBuilding(new CPBuildingBuilder())
  }

  function withCurrency(currency : Currency) : CPLocationBuilder {
    set(CPLocation#PreferredCoverageCurrency, currency)
    return this
  }
}
