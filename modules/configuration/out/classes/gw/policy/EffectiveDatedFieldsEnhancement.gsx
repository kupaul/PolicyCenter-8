package gw.policy
uses gw.api.productmodel.OfferingLookup

enhancement EffectiveDatedFieldsEnhancement : EffectiveDatedFields {

  function getOfferingName(offeringCode : String) : String {
    var offering = OfferingLookup.getByCode(offeringCode)
    return offering.Name
  }
}