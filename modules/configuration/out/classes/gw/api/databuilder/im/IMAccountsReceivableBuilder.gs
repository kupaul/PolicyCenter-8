package gw.api.databuilder.im

uses gw.api.builder.BuilderPropertyPopulator
uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.BuilderContext
uses java.util.concurrent.atomic.AtomicInteger
uses gw.entity.IEntityPropertyInfo
uses java.math.BigDecimal
uses gw.api.util.CurrencyUtil

@Export
class IMAccountsReceivableBuilder extends DataBuilder<IMAccountsReceivable, IMAccountsReceivableBuilder>{

  static var _number = new AtomicInteger(1)

  construct() {
    super(IMAccountsReceivable)
    withNumber( _number.incrementAndGet() )
    //withBuilding
  }

  /** helper for withXxx() methods */
  protected function setByPropName(propertyName : String, value : Object) : IMAccountsReceivableBuilder {
    set(IMAccountsReceivable.Type.TypeInfo.getProperty( propertyName ), value)
    return this
  }
  
  final function withNumber( number : int) : IMAccountsReceivableBuilder {
    setByPropName( "AccountsRecNumber",  number )
    return this
  }
  
  function withReceptacleType( receptacle : ReceptacleType ) : IMAccountsReceivableBuilder {
    setByPropName ( "ReceptacleType", receptacle )
    return this
  }
  
  function withPercentDuplicated( percent : PercentDuplicated ) : IMAccountsReceivableBuilder {
    setByPropName ( "PercentDuplicated", percent )
    return this
  }
  
  function withIMBuilding ( imBuildingBuilder : IMBuildingBuilder) : IMAccountsReceivableBuilder {
    addPopulator(new BuilderPropertyPopulator(IMAccountsReceivable.Type.TypeInfo.getProperty("IMBuilding") as IEntityPropertyInfo,
            imBuildingBuilder) )
    return this
  }
  
  function withCoverage ( coveragebuilder : CoverageBuilder ) : IMAccountsReceivableBuilder {
    addAdditiveArrayElement( IMAccountsReceivable.Type.TypeInfo.getProperty("Coverages"), coveragebuilder )
    return this
  }
  
  function withARItemCoverage(limit : BigDecimal ) : IMAccountsReceivableBuilder {
    var arItemCoverageBuilder = new CoverageBuilder( IMAccountReceivableCov )
      .withPattern("IMAccountReceivableCov")
      .withDirectTerm("IMAccountsReceivableLimit", limit)
    return withCoverage(arItemCoverageBuilder)
  }

  function withCurrency(currency : Currency) : IMAccountsReceivableBuilder {
    set(IMAccountsReceivable#PreferredCoverageCurrency, currency)
    return this
  }
  
  protected override function createBean(context : BuilderContext) : IMAccountsReceivable {
    var part = context.ParentBean as entity.IMAccountsRecPart
    var arItem = new IMAccountsReceivable( part.InlandMarineLine.Branch )
    part.addToIMAccountsReceivables( arItem )
    return arItem
  }
}
