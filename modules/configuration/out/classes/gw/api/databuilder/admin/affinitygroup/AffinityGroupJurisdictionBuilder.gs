package gw.api.databuilder.admin.affinitygroup

uses gw.api.databuilder.DataBuilder

@Export
class AffinityGroupJurisdictionBuilder extends DataBuilder<AffinityGroupJurisdiction, AffinityGroupJurisdictionBuilder> {

  construct() {
    super(AffinityGroupJurisdiction)
  }
   
  function withJurisdition(jurisdiction : Jurisdiction) : AffinityGroupJurisdictionBuilder {
    set(AffinityGroupJurisdiction.Type.TypeInfo.getProperty("Jurisdiction"), jurisdiction)
    return this
  }
   
  function withAffinityGroup(affinityGroup : AffinityGroup) : AffinityGroupJurisdictionBuilder {
    set(AffinityGroupJurisdiction.Type.TypeInfo.getProperty("AffinityGroup"), affinityGroup)
    return this
  }
  
  function withAffinityGroup(affinityGroupBuilder : AffinityGroupBuilder) : AffinityGroupJurisdictionBuilder {
    var affinityGroup = affinityGroupBuilder.create()
    set(AffinityGroupJurisdiction.Type.TypeInfo.getProperty("AffinityGroup"), affinityGroup)
    return this
  }
}