package gw.plugin.billing.bc700
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.NewProducerCodeInfo

@Export
enhancement NewProducerCodeInfoEnhancement : NewProducerCodeInfo
{
  function sync(producerCode : ProducerCode) {
    this.PublicID = producerCode.PublicID
    this.Code = producerCode.Code
    var status = producerCode.ProducerStatus
    this.Active = status == ProducerStatus.TC_ACTIVE or status ==  ProducerStatus.TC_LIMITED
    this.ProducerPublicID = producerCode.Organization.PublicID
    this.CommissionPlanID = producerCode.CommissionPlans?.first()?.CommissionPlanID
  }
}
