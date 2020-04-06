package gw.web.line.cp.policy.CoverageInputSet

@Export
class CPBldgCovUIHelper {
  public static function getCoinsuranceValue(building : entity.CPBuilding, valMethodValue : gw.entity.TypeKey) : OptionCPBldgCovCoinsuranceType {
    if (valMethodValue == CPValuationMethod.TC_AGREEDAMT or valMethodValue == CPValuationMethod.TC_FUNCVALUE) {
      var optionValue = building.CPBldgCov.CPBldgCovCoinsuranceTerm.Pattern.getCovTermOpt("0")
      building.CPBldgCov.CPBldgCovCoinsuranceTerm.setOptionValue(optionValue)
    }
    return building.CPBldgCov.CPBldgCovCoinsuranceTerm
  }

  public static function getAutoIncreaseValue(building : entity.CPBuilding, valMethodValue : gw.entity.TypeKey) : OptionCPBldgCovAutoIncreaseType {
    if (valMethodValue == CPValuationMethod.TC_FUNCVALUE) {
      var optionValue = building.CPBldgCov.CPBldgCovAutoIncreaseTerm.Pattern.getCovTermOpt("0")
      building.CPBldgCov.CPBldgCovAutoIncreaseTerm.setOptionValue(optionValue)
    }
    return building.CPBldgCov.CPBldgCovAutoIncreaseTerm
  }

  public static function isCoverageAvailable(coverable : entity.Coverable, coveragePattern : gw.api.productmodel.ClausePattern) : boolean {
    return coverable.isCoverageConditionOrExclusionAvailable( coveragePattern )
  }

  public static function isCoinsuranceAvailable(building : entity.CPBuilding) : boolean {
    var valuationMethod = building.CPBldgCov.CPBldgCovValuationMethodTerm.Value
    return building.CPBldgCov.hasCovTerm("CPBldgCovCoinsurance") and
        valuationMethod != CPValuationMethod.TC_FUNCVALUE and
        valuationMethod != CPValuationMethod.TC_AGREEDAMT
  }

  public static function isAutoIncreaseAvailable(building : entity.CPBuilding) : boolean {
    return building.CPBldgCov.hasCovTerm("CPBldgCovAutoIncrease") and
        building.CPBldgCov.CPBldgCovValuationMethodTerm.Value != CPValuationMethod.TC_FUNCVALUE
  }
}