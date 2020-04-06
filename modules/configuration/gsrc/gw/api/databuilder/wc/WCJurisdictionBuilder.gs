package gw.api.databuilder.wc

uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses java.lang.Integer
uses java.util.Date
uses gw.api.util.CurrencyUtil

/**
 * @author dpetrusca
 */
@Export
class WCJurisdictionBuilder extends DataBuilder<WCJurisdiction, WCJurisdictionBuilder> {

  var _state : Jurisdiction
  var _anniversaryDate : Date

  construct(state : Jurisdiction) {
    super(WCJurisdiction)
    _state = state

    addPopulator(Integer.MAX_VALUE, new BeanPopulator<WCJurisdiction>() {
        override function execute(jurisdiction : WCJurisdiction) {
          if (_anniversaryDate != null) {
            jurisdiction.AnniversaryDate = _anniversaryDate
          }
        }
      })
  }

  protected override function createBean(context : BuilderContext) : WCJurisdiction {
    var line = context.ParentBean as WorkersCompLine
    var wcJurisdiction = line.addJurisdiction(_state)
    return wcJurisdiction
  }

  function setRateModifierValue(modifierPatternCode : String, rate : double) : WCJurisdictionBuilder {
    addArrayElement(WCJurisdiction.Type.TypeInfo.getProperty("WCMODIFIERS"), 
                    new WCModifierBuilder(modifierPatternCode).withRateValue(rate))
    return this
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : WCJurisdictionBuilder {
    addArrayElement(WCJurisdiction.Type.TypeInfo.getProperty("COVERAGES"), coverageBuilder)
    return this
  }

  function withRPSD(rpsdDate : Date, rpsdType : RPSDType) : WCJurisdictionBuilder {
    addAdditiveArrayElement(WCJurisdiction.Type.TypeInfo.getProperty("RATINGPERIODSTARTDATES"), 
                            new RatingPeriodStartDateBuilder().withDate(rpsdDate).withType(rpsdType))
    return this
  }

  function withAnniversaryDate(anniversaryDate : Date) : WCJurisdictionBuilder {
    _anniversaryDate = anniversaryDate
    return this
  }

  function withCurrency(currency : Currency) : WCJurisdictionBuilder {
    set(WCJurisdiction#PreferredCoverageCurrency, currency)
    return this
  }
}
