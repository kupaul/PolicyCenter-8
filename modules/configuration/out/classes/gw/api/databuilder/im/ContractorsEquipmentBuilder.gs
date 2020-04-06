package gw.api.databuilder.im
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.BuilderContext
uses java.util.concurrent.atomic.AtomicInteger
uses gw.api.builder.CoverageBuilder
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses java.math.BigDecimal
uses gw.api.util.CurrencyUtil

/**
 * This builder is for the Contractors Equipment entity, meant for tests.
 */
@Export
class ContractorsEquipmentBuilder extends DataBuilder<ContractorsEquipment, ContractorsEquipmentBuilder>{
  
  static var _number = new AtomicInteger(1)
  
  construct() {
    super(ContractorsEquipment)

    withDescription( "Fake default description" )
    withEquipmentId( "Fake default equipment id" )
    withManufacturer( "Fake default manufacturer" )
    withNumber( _number.incrementAndGet() )

    withModel( "Fake default model" )
    withModelYear( 1969 )
    withYearBought( 1969 )
  }
  
  /** helper for withXxx() methods */
  private function setByPropName(propertyName : String, value : Object) : ContractorsEquipmentBuilder {
    set(ContractorsEquipment.Type.TypeInfo.getProperty( propertyName ), value)
    return this
  }
  
  final function withEquipmentId(id : String) : ContractorsEquipmentBuilder {
    return setByPropName("ContractorsEquipmentID", id)
  }
  
  final function withNumber(number : int) : ContractorsEquipmentBuilder{
    return setByPropName("ContractorsEquipmentNumber", number)
  }
  
  final function withDescription(desc : String) : ContractorsEquipmentBuilder {
    return setByPropName("Description", desc)
  }

  final function withManufacturer(manufacturer : String) : ContractorsEquipmentBuilder {
    return setByPropName("Manufacturer", manufacturer)
  }

  final function withModel(model : String) : ContractorsEquipmentBuilder {
    return setByPropName("Model", model)
  }

  final  function withModelYear(modelYear : int) : ContractorsEquipmentBuilder {
    return setByPropName("ModelYear", modelYear)
  }

  final function withYearBought(yearBought : int) : ContractorsEquipmentBuilder {
    return setByPropName("YearBought", yearBought)
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : ContractorsEquipmentBuilder {
    addArrayElement(ContractorsEquipment.Type.TypeInfo.getProperty("Coverages"), coverageBuilder)
    return this
  }
  
  function withScheduledCoverage() : ContractorsEquipmentBuilder {
    return withScheduledCoverage(100000, "500", ValuationMethod.TC_REPLCOST)
  }
  
  function withScheduledCoverage(limit : BigDecimal, deductible : String, valuationMethod : ValuationMethod) : ContractorsEquipmentBuilder {
    var scheduledCoverageBuilder = new CoverageBuilder(ContractorsEquipCov)
      .withPattern("ContractorsEquipSchedCov")
      .withDirectTerm("ContractorsEquipSchedCovLimit", limit)
      .withOptionCovTerm("ContractorsEquipSchedCovDeductible", deductible)
      .withTypekeyCovTerm("ContractorsEquipSchedCovValuation", valuationMethod)
    return withCoverage(scheduledCoverageBuilder)
  }
  
  function withSchedEquipAdditionalInterest(additionalInterestBuilder : SchedEquipAdditionalInterestBuilder) : ContractorsEquipmentBuilder {
    addPopulator(new BuilderArrayPopulator(ContractorsEquipment.Type.TypeInfo.getProperty("AdditionalInterests") as IArrayPropertyInfo, additionalInterestBuilder))
    return this
  }

  function withCurrency(currency : Currency) : ContractorsEquipmentBuilder {
    set(ContractorsEquipment#PreferredCoverageCurrency, currency)
    return this
  }

  protected override function createBean(context : BuilderContext) : ContractorsEquipment {
    var part = context.ParentBean as entity.ContractorsEquipPart
    var equip = new ContractorsEquipment( part.InlandMarineLine.Branch )
    part.addToContractorsEquipments( equip )
    return equip
  }
}