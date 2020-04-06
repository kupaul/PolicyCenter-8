package gw.web.rating

uses gw.api.database.Query
uses gw.api.database.InOperation
uses gw.api.database.IQueryBeanResult

@Export
class RateTableDefinitionDetailsScreenUIHelper {
  public static function addFactorDefinition(tableDefinition : entity.RateTableDefinition) : RateTableColumn {
    var columnDef = new RateTableColumn()
    columnDef.ColumnType = TC_DECIMAl // Default is String, which is not always legal for Factors
    tableDefinition.addToFactors(columnDef)
    return columnDef
  }

  public static function addMatchOperation(tableDefinition : entity.RateTableDefinition, matchOpDef : RateTableMatchOpDefinition) : entity.RateTableMatchOp {
    var matchOp = new RateTableMatchOp()
    matchOp.MatchOpDefinition = matchOpDef
    tableDefinition.addToMatchOps(matchOp)
    for (i in 0..|matchOpDef.NumberOfParameters) {
      var column = new RateTableColumn()
      column.DefinitionForParam = matchOp.Definition
      column.ColumnType = matchOpDef.AllowedParameterTypeSet.order().first()
      matchOp.addToParams(column)
    }
    return matchOp
  }

  public static function tableFactorFilter(tableDefinition : entity.RateTableDefinition, value : RateTableDataType) : Boolean{
    if(tableDefinition.MatchOps.hasMatch(\ mo -> mo.MatchOpDefinition.OpCode == "Interpolate")) {
      return RateTableDataType.TF_INTERPOLATEDFACTOR.TypeKeys.contains(value)
    }
    return RateTableDataType.TF_FACTOR.TypeKeys.contains(value)
  }

  public static property get MatchOpDefinitions(): IQueryBeanResult<RateTableMatchOpDefinition> {
    return Query.make(RateTableMatchOpDefinition)
        .or(\ r -> {
          r.compare("Deprecated", Equals, false)   // by default, only non-deprecated matchops
          r.subselect("ID", InOperation.CompareIn, // but also anything that's already in use
                      RateTableMatchOp, "MatchOpDefinition")
        })
        .select()
  }

  public static function getOpCodeLabel(matchOp : RateTableMatchOp) : String {
    return gw.api.domain.DisplayKey.getDisplayKeyValue("Web.Rating.Matchop." + matchOp.MatchOpDefinition.OpCode)
  }
}
