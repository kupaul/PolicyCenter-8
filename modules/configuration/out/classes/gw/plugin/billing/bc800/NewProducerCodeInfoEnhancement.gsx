package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.NewProducerCodeInfo

@Export
enhancement NewProducerCodeInfoEnhancement : NewProducerCodeInfo {
  function sync(producerCode : ProducerCode){
    this.PublicID = producerCode.PublicID
    this.Code = producerCode.Code
    var status = producerCode.ProducerStatus
    this.Active = status == TC_ACTIVE or status == TC_LIMITED
    this.ProducerPublicID = producerCode.Organization.PublicID
    this.CommissionPlanIDs = producerCode.CommissionPlanIDs.toList()
    this.Currencies = producerCode.Currencies*.Code.toList()
  }
}
