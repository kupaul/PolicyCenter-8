package gw.rating.rtm

uses gw.api.database.Query
uses gw.rating.flow.domain.CalcRoutine
uses gw.rating.rtm.domain.table.RateTableCell

enhancement RateTableColumnEnhancement : entity.RateTableColumn {

  property get Definition() : RateTableDefinition {
    if (this.DefinitionForParam != null) return this.DefinitionForParam
    else if (this.DefinitionForFactor != null) return this.DefinitionForFactor
    return null
  }

  property set Definition(rtDef : RateTableDefinition)  {
    if (this.DefinitionForParam != null){
      this.DefinitionForParam = rtDef
    }
    else if (this.DefinitionForFactor != null){
      this.DefinitionForFactor = rtDef
    }
  }

  property get HasDependent() : Boolean {
    return not Dependents.Empty
  }

  property get Dependents() : List<RateTableColumn> {
    return Query.make(RateTableColumn).compare("DependsOn", Equals, this.ID).select().toList()
  }

  property get HasValueProvider() : Boolean {
    return this.ValueProvider.HasContent or this.ColumnType == RateTableDataType.TC_BOOLEAN
  }

  property get IsFactorColumn() : boolean {
    return this.DefinitionForFactor != null
  }

  property get IsParameterColumn() : boolean {
    return this.DefinitionForParam != null
  }

  property get CustomValProviderClass(): ValueProvider {
    var providerType: ValueProvider
    if(this.ValueProvider != null and this.ValueProvider.NotBlank){
      var p = gw.rating.rtm.valueprovider.Parser.parse(this.ValueProvider)
      var keyValue = p.ClassName.substring("gw.rating.rtm.valueprovider.".length)
      providerType = ValueProvider.get(keyValue)
    }
    return providerType
  }

  property set CustomValProviderClass(className: ValueProvider){
    if(className != null){
      this.ValueProvider = "gw.rating.rtm.valueprovider." + className.Code
    }
  }

  function clearArgumentSources() {
    this.MatchOp.ArgumentSources.each(\ asrc -> {
      asrc.Root = null
      asrc.ArgumentSource = null
    })
  }

  function isEqual(other : RateTableColumn) : boolean {
    return (this.ColumnName == other.ColumnName) and
           (this.ColumnType == other.ColumnType) and
           (this.PhysicalColumnName == other.PhysicalColumnName) and
           (this.SortOrder == other.SortOrder) and
           (this.DependsOn.PublicID == other.DependsOn.PublicID) and
           (this.ValueProvider == other.ValueProvider)
  }

  property get Scale() : int {
    return scale(this.PhysicalColumnName)
  }

  property get Precision() : int {
    return precision(this.PhysicalColumnName)
  }

  function scale(colName : String) : int {
    return Definition.getColumnScale(colName) ?: RateTableCell.FACTOR_SCALE
  }

  function precision(colName : String) : int {
    return Definition.getColumnPrecision(colName) ?: RateTableCell.FACTOR_PRECISION
  }

  property get EditMode() : String {
    if (this.ColumnType == typekey.RateTableDataType.TC_DATE) {
      return "date"
    } else if (this.HasValueProvider) {
      return this.HasDependent ? "selectwithrefresh" : "select"
    } else switch (this.DisplayType) {
      case TC_SMALL:  return "small"
      case TC_LARGE:  return "large"
      case TC_NORMAL:
      default: return "default"
    }
  }
}
