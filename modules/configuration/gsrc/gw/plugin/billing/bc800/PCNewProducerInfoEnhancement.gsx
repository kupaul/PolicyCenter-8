package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCNewProducerInfo
uses gw.api.util.CurrencyUtil

enhancement PCNewProducerInfoEnhancement: PCNewProducerInfo {
    function syncNew(organization : Organization) {
      this.sync(organization)
      this.PreferredCurrency = CurrencyUtil.DefaultCurrency.Code
    }
}
