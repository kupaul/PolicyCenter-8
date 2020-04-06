package gw.api.databuilder.im
uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.BuilderContext
uses java.util.Map
uses gw.api.productmodel.ExclusionPattern
uses gw.api.util.CurrencyUtil
uses gw.api.productmodel.ExclusionPattern

@Export
class ContractorsEquipmentPartBuilder extends IMPartBuilder<ContractorsEquipPart, ContractorsEquipmentPartBuilder> {
  
  var _exclusions : Map<String,Boolean> = {}

  construct() {
    super(ContractorsEquipPart)
    withCoinsurance(typekey.Coinsurance.TC_80)
    withReporting(false)
  }
  
  /** helper for withXxx/isXxx() methods */
  private function setByPropName(propertyName : String, value : Object) : ContractorsEquipmentPartBuilder {
    set(ContractorsEquipPart.Type.TypeInfo.getProperty(propertyName), value)
    return this
  }
  
  // reporting
  final function withReporting(reporting : boolean) : ContractorsEquipmentPartBuilder {
    return setByPropName("Reporting", reporting) 
  }
  function isReporting() : ContractorsEquipmentPartBuilder {
    return setByPropName("Reporting", true) 
  }
  function isNotReporting() : ContractorsEquipmentPartBuilder {
    return setByPropName("Reporting", false) 
  }
  
  // per-occurrence limit
  function withPerOccurrenceLimit(perOccurrenceLimit : boolean) : ContractorsEquipmentPartBuilder {
    return setByPropName("PerOccurrenceLimit", perOccurrenceLimit) 
  }
  
  // coinsurance  
  final function withCoinsurance(coinsurance : Coinsurance) : ContractorsEquipmentPartBuilder {
    return setByPropName("Coinsurance", coinsurance) 
  }
  
  // contractor type
  function withContractorType(contractorType : ContractorType) : ContractorsEquipmentPartBuilder {
    return setByPropName("ContractorType", contractorType) 
  }
  
  // equipment
  function withContractorsEquipment(equipment : ContractorsEquipmentBuilder) : ContractorsEquipmentPartBuilder {
    addAdditiveArrayElement(ContractorsEquipPart.Type.TypeInfo.getProperty("ContractorsEquipments"), equipment)
    return this
  }

  // cost  
  function withCost(cost : ContrEquipPartCost) : ContractorsEquipmentPartBuilder {
    addArrayElement(ContractorsEquipPart.Type.TypeInfo.getProperty("ContrEquipPartCosts"), cost)
    return this
  }
  
  // coverage
  function withCoverage(coverageBuilder : CoverageBuilder) : ContractorsEquipmentPartBuilder {
    addArrayElement(ContractorsEquipPart.Type.TypeInfo.getProperty("ContrEquipPartCovs"), coverageBuilder)
    return this
  }
  
  // exclude theft
  function withExcludeTheft(excludeTheft : boolean) : ContractorsEquipmentPartBuilder {
    _exclusions.put("ExcludeTheft", excludeTheft)
    return this 
  }
  
  // exclude vandalism
  function withVandalism(excludeVandalism : boolean) : ContractorsEquipmentPartBuilder {
    _exclusions.put("ExcludeVandalism", excludeVandalism)
    return this
  }

  function withCurrency(currency : Currency) : ContractorsEquipmentPartBuilder {
    set(ContractorsEquipPart#PreferredCoverageCurrency, currency)
    return this
  }

  protected override function createBean(context : BuilderContext) : ContractorsEquipPart {
    var line = context.ParentBean as entity.InlandMarineLine
    var part = super.createBean(context)
    // duplicated previous funtionality from calling IMLine.maybeCreateCoveragePart and existing builder code
    part.initializeAutoNumberSequence(part.Bundle)
    part.createCoveragesConditionsAndExclusions()
    var p : ExclusionPattern
    for (e in _exclusions.Keys) {
      p = line.Pattern.getExclusionPattern(e)
      if (part.hasExclusion(p) and not _exclusions.get(e)) {
        part.removeExclusionFromCoverable(part.getExclusion(p))
      } else if (not part.hasExclusion(p) and _exclusions.get(e)) {
        part.createExclusion(p)
      }
    }
    return part
  }
}
