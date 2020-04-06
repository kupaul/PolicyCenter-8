package gw.financials

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.Plugins
uses gw.plugin.exchangerate.IFXRatePlugin
uses gw.util.Pair

uses java.util.Collection
uses java.util.Date
uses java.util.Map

/**
 * Implements a cache of the @{link PolicyFXRate}'s for a @{link PolicyPeriod}
 *    keyed by currency and the desired effective date for the rate.
 *
 * This provides a cache of recorded foreign exchange rate conversions for a
 * policy period indexed by the source currency and the desired effective date
 * for the rate. Since the desired effective date does not directly map to an
 * actual effective date of a foreign exchange rate, this allows policy period
 * operations to cache and share references in an efficient manner to a recorded
 * copy of the foreign exchange rate used to perform a currency conversion.
 *
 * The cache is of course transient to be used in a local context where multiple
 * conversions are necessary. Current examples are during ceding or for rating
 * costs conversion.
 */
@Export
final class PolicyPeriodFXRateCache {
  /**
   * The policy period for this rate cache.
   */
  var _period : PolicyPeriod as readonly PolicyPeriod

  var _rateCache : Map<Pair<Currency, Date>, PolicyFXRate> = {}
  var _rates : Collection<PolicyFXRate>  // persisted rates...

  /**
   * Construct a new rate cache for the specified policy period.
   *
   * @param period The policy period with which the rates are associated.
   */
  construct(period : PolicyPeriod) {
    _period = period
    _rates = _period.loadPolicyFXRates()
  }

  /**
   * The policy period's settlement currency.
   */
  final property get SettlementCurrency() : Currency {
    return PolicyPeriod.PreferredSettlementCurrency
  }

  /**
   * Get or create a @{link PolicyFXRate foreign exchange rate} for the
   *    specified monetary amount to the policy period's settlement currency
   *    and effective on the same date as the period.
   *
   * @param from The monetary amount for which to obtain a foreign
   *             exchange rate to the settlement currency
   * @return A foreign exchange rate for the specified monetary amount
   *         effective on the same date as the policy period and recorded
   *         for the period.
   */
  final function getPolicyFXRate(from : MonetaryAmount) : PolicyFXRate {
    //find or create rate in cache
    return getPolicyFXRate(from.Currency, _period.EditEffectiveDate)
  }

  /**
   * Get or create a @{link PolicyFXRate foreign exchange rate} for the
   *    specified currency to the policy period's settlement currency
   *    effective on the specified date.
   *
   * @param fromCurrency The currency for which to get a foreign exchange
   *                     rate to the settlement currency
   * @param effectiveDate The effective date for the foreign exchange rate
   * @return A foreign exchange rate for the specified currency to the
   *         settlement currency effective on the specified date and recorded
   *         for the policy period.
   */
  final function getPolicyFXRate(fromCurrency : Currency, effectiveDate : Date) : PolicyFXRate {
    //find or create rate in cache
    var pair = Pair.make(fromCurrency, effectiveDate)
    var policyRate = _rateCache.get(pair)
    if (policyRate == null) {
      var rate = getFXRatePlugin().getFXRate(fromCurrency, SettlementCurrency, effectiveDate)
      policyRate = _period.findOrCreatePolicyFXRate(rate, _rates)
      _rateCache.put(pair, policyRate)
    }
    return policyRate
  }

  private function getFXRatePlugin() : IFXRatePlugin {
    return Plugins.get(IFXRatePlugin)
  }
}