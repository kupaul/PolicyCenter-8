package gw.api.databuilder.cp

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.productmodel.ModifierPattern
uses java.math.BigDecimal
uses java.lang.IllegalStateException
uses java.math.RoundingMode

@Export
class CPModifierBuilder extends DataBuilder<CPModifier, CPModifierBuilder> {

  var _modifierPatternCode : String

  construct(modifierPatternCode : String) {
      super(CPModifier)
      _modifierPatternCode = modifierPatternCode
  }

  protected override function createBean(context : BuilderContext) : CPModifier {
    var line = context.ParentBean as CommercialPropertyLine
    var pattern = _modifierPatternCode as ModifierPattern
    if (pattern == null) {
      throw new IllegalStateException(displaykey.Builder.CPModifier.Error.InvalidPatternCode(_modifierPatternCode))
    }
    line.syncModifiers()
    var modifier = line.getModifier(pattern)
    if (modifier == null) {
      throw new IllegalStateException(displaykey.Builder.CPModifier.Error.InvalidPattern(pattern))
    }
    return modifier as CPModifier
  }

  function withRateValue(value : double) : CPModifierBuilder {
    var doubleVal = BigDecimal.valueOf(value).setScale(4, RoundingMode.FLOOR)
    set(CPModifier.Type.TypeInfo.getProperty("RATEMODIFIER"), doubleVal)
    return this
  }

  function withBooleanValue(value : boolean) : CPModifierBuilder {
    set(CPModifier.Type.TypeInfo.getProperty("BOOLEANMODIFIER"), value)
    return this
  }
}
