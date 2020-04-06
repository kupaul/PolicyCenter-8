package gw.rating.rtm

uses gw.api.rating.RateQueryResult

enhancement DefaultRateFactorRowEnhancement : entity.DefaultRateFactorRow {

  function getFactorValue<T>() : RateQueryResult<T> {
    var factorColumnName = this.RateTable.Definition.getFactorPhysicalColumnName()
    var value = this.getFieldValue(factorColumnName)
    return new RateQueryResult<T>(value as T)
  }
}

