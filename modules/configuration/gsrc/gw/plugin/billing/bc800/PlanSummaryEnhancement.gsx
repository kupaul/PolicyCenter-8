package gw.plugin.billing.bc800

uses gw.api.webservice.exception.DataConversionException
uses gw.plugin.billing.PlanSummary
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PlanCurrencyInfo

/**
 * Defines an enhancement to {@code PlanSummary} and its subclasses that
 * encapsulates synchronization with a {@code PlanCurrencyInfo}.
 */
enhancement PlanSummaryEnhancement : PlanSummary {
  function syncCurrency(plan : PlanCurrencyInfo) {
    this.Currency = Currency.get(plan.Currency)
    if (this.Currency == null) {
      throw new DataConversionException(
          displaykey.Webservice.Error.Currency.Unknown(plan.Currency))
    }
    this.Name = plan.Name
    this.Id = plan.PublicID
  }
}
