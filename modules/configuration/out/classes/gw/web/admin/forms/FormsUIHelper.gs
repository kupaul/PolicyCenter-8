package gw.web.admin.forms

uses java.util.Map
uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses gw.rating.flow.util.TypeMaps
uses gw.rating.rtm.valueprovider.Parser
uses gw.rating.rtm.valueprovider.RateTableCellValueProviderFactory
uses gw.rating.rtm.valueprovider.TypeListValueProvider


@Export
class FormsUIHelper {

  public static function wrapKeysWithQuotes(arg : entity.CalcStepDefinitionArgument) : Map<String,String> {
    var wrapMap : Map<String,String> = {}
    arg.AvailableStringValues.eachKeyAndValue(\ key, val -> {
      wrapMap.put("\"" + key + "\"", val)
    })
    return wrapMap
  }

  public static function commitPopup(valueDelegate : entity.CalcStepValueDelegate, currentLocation : pcf.RateRoutineDateConstantPopup) {
    if (valueDelegate typeis CalcStepDefinitionArgument) {
      valueDelegate.OverrideSource = true
    }
    currentLocation.commit()
    gw.api.web.PebblesUtil.invalidateIterators(currentLocation, entity.CalcStepDefinition)
  }

  public static function getTableParameterType(arg : entity.CalcStepDefinitionArgument) : IType{
    var column = arg.RateTableMatchOp.Params.first()
    if (column.ValueProvider != null) {
      var valueProvider = RateTableCellValueProviderFactory.getValueProvider(column)
      if (valueProvider typeis TypeListValueProvider) {
        var parser = Parser.parse(column.ValueProvider)
        return TypeSystem.getByFullNameIfValid(parser.Arguments.first())
      }
    }
    return TypeMaps.rateTableColumnTypeToType(column.ColumnType)
  }
}