package gw.api.databuilder.admin.affinitygroup

uses gw.api.databuilder.DataBuilder

@Export
class AffinityGroupProducerCodeBuilder extends DataBuilder<AffinityGroupProducerCode, AffinityGroupProducerCodeBuilder> {

  construct() {
    super(AffinityGroupProducerCode)
  }
   
  function withProducerCode(producerCode : ProducerCode) : AffinityGroupProducerCodeBuilder {
    set(AffinityGroupProducerCode.Type.TypeInfo.getProperty("ProducerCode"), producerCode)
    return this
  }
   
  function withAffinityGroup(affinityGroup : AffinityGroup) : AffinityGroupProducerCodeBuilder {
    set(AffinityGroupProducerCode.Type.TypeInfo.getProperty("AffinityGroup"), affinityGroup)
    return this
  }
  
  function withAffinityGroup(affinityGroupBuilder : AffinityGroupBuilder) : AffinityGroupProducerCodeBuilder {
    var affinityGroup = affinityGroupBuilder.create()
    set(AffinityGroupProducerCode.Type.TypeInfo.getProperty("AffinityGroup"), affinityGroup)
    return this
  }
}
