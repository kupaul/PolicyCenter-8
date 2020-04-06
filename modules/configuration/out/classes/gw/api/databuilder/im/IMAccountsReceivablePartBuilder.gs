package gw.api.databuilder.im
uses gw.api.databuilder.BuilderContext
uses gw.api.builder.CoverageBuilder
uses gw.api.util.CurrencyUtil

@Export
class IMAccountsReceivablePartBuilder  extends IMPartBuilder<IMAccountsRecPart, IMAccountsReceivablePartBuilder> {
  construct()  {
    super(IMAccountsRecPart)
  }
  
    /** helper for withXxx/isXxx() methods */
  private function setByPropName(propertyName : String, value : Object) : IMAccountsReceivablePartBuilder {
    set(IMAccountsRecPart.Type.TypeInfo.getProperty( propertyName ), value)
    return this
  }
  
  function withReporting(reporting : boolean) : IMAccountsReceivablePartBuilder {
    return setByPropName("Reporting", reporting) 
  }
  
  // coinsurance  
  function withCoinsurance(coinsurance : Coinsurance) : IMAccountsReceivablePartBuilder {
    return setByPropName("Coinsurance", coinsurance) 
  }
  
  // business class
  function withBusinessClass(businessClass : BusinessClass) : IMAccountsReceivablePartBuilder {
    return setByPropName("BusinessClass", businessClass) 
  }
  
  // equipment
  function withIMAccountsReceivable(arItem : IMAccountsReceivableBuilder) : IMAccountsReceivablePartBuilder {
    addAdditiveArrayElement(IMAccountsRecPart.Type.TypeInfo.getProperty("IMAccountsReceivables"), arItem)
    return this
  }

  // cost  
  function withCost(cost : IMAccountsRecPartCost) : IMAccountsReceivablePartBuilder {
    addArrayElement(IMAccountsRecPart.Type.TypeInfo.getProperty("IMAccountsRecPartCosts"), cost)
    return this
  }
  
  // coverage
  function withCoverage(coverageBuilder : CoverageBuilder) : IMAccountsReceivablePartBuilder {
    addArrayElement(IMAccountsRecPart.Type.TypeInfo.getProperty("IMAccountsRecPartCovs"), coverageBuilder)
    return this
  }

  function withExcludedAccount(excludedAccountBuilder : IMExcludedAccountBuilder) : IMAccountsReceivablePartBuilder {
    addArrayElement(IMAccountsRecPart.Type.TypeInfo.getProperty("IMExcludedAccounts"), excludedAccountBuilder)
    return this
  }

  function withCurrency(currency : Currency) : IMAccountsReceivablePartBuilder {
    set(IMAccountsRecPart#PreferredCoverageCurrency, currency)
    return this
  }
    
  protected override function createBean(context : BuilderContext) : IMAccountsRecPart {
    var acctRecPart = super.createBean(context)
    acctRecPart.initializeAutoNumberSequence(acctRecPart.Bundle)
    return acctRecPart
  }
}