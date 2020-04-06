package gw.api.databuilder.admin.affinitygroup

uses gw.api.databuilder.DataBuilder

@Export
class AffinityGroupProductBuilder extends DataBuilder<AffinityGroupProduct, AffinityGroupProductBuilder> {

  construct() {
    super(AffinityGroupProduct)
  }

  function withProductCode(productCode : String) : AffinityGroupProductBuilder {
    set(AffinityGroupProduct.Type.TypeInfo.getProperty("ProductCode"), productCode)
    return this
  }
  
  function withAffinityGroup(affinityGroup : AffinityGroup) : AffinityGroupProductBuilder {
    set(AffinityGroupProduct.Type.TypeInfo.getProperty("AffinityGroup"), affinityGroup)
    return this
  }
  
  function withAffinityGroup(affinityGroupBuilder : AffinityGroupBuilder) : AffinityGroupProductBuilder {
    var affinityGroup = affinityGroupBuilder.create()
    withAffinityGroup(affinityGroup)
    return this
  }
}
