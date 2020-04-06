package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCProducerInfo
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCContactInfo

@Export
enhancement PCProducerInfoEnhancement : PCProducerInfo {
  function sync(organization : Organization){
    this.ProducerName = organization.Name
    this.ProducerNameKanji = organization.NameKanji
    this.Currencies = organization.AgencyBillPlans*.Currency*.Code.toList()
    this.AgencyBillPlanIDs = organization.AgencyBillPlans*.PlanID.toList()
    this.PublicID = organization.PublicID
    this.Tier = organization.Tier.Code
    var contactInfo = new PCContactInfo()
    contactInfo.sync( organization.Contact )
    this.PrimaryContact.$TypeInstance = contactInfo
  }
}
