package gw.plugin.exchangerate

uses gw.currency.fxrate.FXRate
uses gw.currency.fxrate.impl.FXRateServiceImpl

uses java.util.Date
uses gw.currency.fxrate.FXRateService
uses gw.api.util.FXRateUtil
uses gw.currency.fxrate.FXRateContext

/**
 * By default, FXRates are to be provided by an FXRateService.  As such, this plugin will provide an easy way to
 * interact with the FXRateService in providing FXRates and information around them.
 */
@Export
class FXRateServicePlugin implements IFXRatePlugin {

  /*
  * Answers whether or not the service can provide FX Rates between the given Currencies
  * @param from the basis Currency for conversion
  * @param to the target Currency for conversion
  **/
  override function canConvert(from : Currency, to : Currency): boolean {
    if (from == to) {
      return true
    }
    return FXRateService.canConvert(from, to)
  }

  /**
   * Provides an FXRate to convert from one Currency to another using the default FXMarket and the current time
   * @param from the basis Currency for conversion
   * @param to the target Currency for conversion
   */
  override function getFXRate(from : Currency, to : Currency): FXRate {
    return getFXRate(from, to, null as Date)
  }

  /**
   * Provides an FXRate to convert from one Currency to another using the default FXMarket and the given time
   * @param from the basis Currency for conversion
   * @param to the target Currency for conversion
   * @param  marketTime the market time to quote the FXRate
   */
  override function getFXRate(from : Currency, to : Currency, marketTime : Date): FXRate {
    return getFXRate(from, to, marketTime, null)
  }

  /**
   * Provides an FXRate to convert from one Currency to another using the default FXMarket and the given time
   * @param from the basis Currency for conversion
   * @param to the target Currency for conversion
   * @param  marketTime the market time to quote the FXRate
   */
  override function getFXRate(from: Currency, to: Currency, market: FXRateMarket): FXRate {
    return getFXRate(from, to, null, market)
  }

  /**
   * Provides an FXRate to convert from one Currency to another using the given FXMarket and time
   * @param from the basis Currency for conversion
   * @param to the target Currency for conversion
   * @param  marketTime the market time to quote the FXRate
   * @param market the FXMarket from which to get the FXRate
   */
  override function getFXRate(from: Currency, to: Currency, marketTime: Date, market: FXRateMarket): FXRate {
    var contextBuilder = FXRateUtil.makeContextBuilder(from, to)
    if (marketTime != null) {
      contextBuilder.withMarketTime(marketTime)
    }
    if (market != null) {
      contextBuilder.withMarket(market)
    }

    return getFXRate(contextBuilder.buildContext())
  }

/**
 * Provides an FXRate to convert from one Currency to another using the given FXMarket and time
 * @param context the FXRateContext to be used in determining which rate to use for conversion
 **/
  override function getFXRate(context : FXRateContext)  : FXRate {
    return FXRateService.getFXRate(context)
  }

  private property get FXRateService(): FXRateService {
    return new FXRateServiceImpl();
  }
}