package gw.rating.rtm

uses gw.rating.rtm.matchop.StatelessMatchOperator
uses gw.rating.rtm.query.RateQueryParam
uses gw.rating.rtm.util.AvailableAttributePresenter
uses gw.rating.rtm.valueprovider.RateTableCellValueProviderFactory

uses java.lang.IllegalArgumentException

enhancement RateTableMatchOpEnhancement : RateTableMatchOp {

  property get AllParamColumnScales() : int {
    return this.Params.first().ColumnScale
  }

  property set AllParamColumnScales(scale : int) {
    this.Params.each(\ r -> {r.ColumnScale = scale})
  }

  function hasSameNameAs(inputParam : RateQueryParam) : boolean {
    return this.Name == inputParam.Name
  }

  function getPhysicalColumnNameFor(columnName : String) : String {
    var v = this.Params.firstWhere(\ p -> p.ColumnName == columnName)
    if (v == null)
      throw new IllegalArgumentException("Column ${columnName} does not exists in rate table ${this.Definition.TableName}")

    return v.PhysicalColumnName
  }

  function newStatelessInstance() : StatelessMatchOperator {
    return this.MatchOpDefinition.statelessMatchOperator(this)
  }

  function getArgumentSource(argSrcSetCode : String) : RateTableArgumentSource {
    return this.ArgumentSources
         .where(\argSrc -> argSrc.ArgumentSourceSet.Code== argSrcSetCode).first()
  }

  property get ArgumentSourceIsRequired() : boolean {
    var provider = this.Params.first().ValueProvider
    return (provider == null or provider.Empty
            or provider.toLowerCase().contains("typelistvalueprovider"))
  }

  function isIncompleteTypeListValueProvider(param : RateTableColumn) : boolean {
    if (param == null or param.ValueProvider == null) return false
    return param.ValueProvider.toLowerCase().contains("typelistvalueprovider")
       and not param.ValueProvider.toLowerCase().contains("(typekey.")
  }

  property get AvailableAttributes() : List<String> {
    return getAvailableUsages()*.Path.toList()
  }

  function getAvailableUsages() : List<AvailableAttributePresenter>{
    var param = this.Params.first()
    // typelist value provider is created in two parts, then a string
    // with both of them is constructed.   If we are in the middle of
    // this creation when AvailableAttributes is called, getValueProvider
    // fails to parse the partially-created string, and we get an exception.
    // To avoid this (sigh) check for this special case first.
    if (isIncompleteTypeListValueProvider(param)) {
      return {}
    }

    var valueProvider = RateTableCellValueProviderFactory.getValueProvider(param)
    var paramSet : CalcRoutineParameterSet = null
    if (this.Definition != null) {
      paramSet = this.Definition.getParameterSet()
    }
    return valueProvider.availableAttributes(this.LineOfBusiness, paramSet)
  }

  property get LineOfBusiness() : gw.api.productmodel.PolicyLinePattern {
    var lob = this.Definition.PolicyLine
    return gw.api.productmodel.PolicyLinePatternLookup.getByCode(lob)
  }

  function isEqual(other : RateTableMatchOp) : boolean {
    return (this.Name == other.Name) and
           (this.MatchOpDefinition.isEqual(other.MatchOpDefinition)) and
           (this.Params.Count == other.Params.Count) and
            sameParamsAs(other)
  }

  private function sameParamsAs(other : RateTableMatchOp) : boolean {
    var same : boolean = true
    this.Params.eachWithIndex(\ param, i ->  {
      if (!param.isEqual(other.Params[i])) {
        same = false
      }
    })
    return same
  }

  private function isCoverageValueProvider(provider : String) : boolean {
    return provider.contains("CoverageValueProvider")
        or provider.contains("CovTermValueProvider")
        or provider.contains("CovTermOptionValueProvider")
  }

  property get ModeForRateTableArgumentValue() : String {
    if (this.AvailableAttributes.HasElements) {
      var param = this.Params.first()
      if (param.ValueProvider != null and isCoverageValueProvider(param.ValueProvider)) {
        return "Coverage"
      } else {
        return "Typelist"
      }
    }
    return "Freeform"
  }
}
