package gw.api.databuilder.wc

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.productmodel.ModifierPattern
uses java.math.BigDecimal
uses java.lang.IllegalStateException

/**
 * @author dpetrusca
 */
@Export
class WCModifierBuilder extends DataBuilder<WCModifier, WCModifierBuilder> {

  var _modifierPatternCode : String

  construct(modifierPatternCode : String) {
      super(WCModifier)
      _modifierPatternCode = modifierPatternCode
  }

  protected override function createBean(context : BuilderContext) : WCModifier {
    var jurisdiction = context.ParentBean as WCJurisdiction
    var pattern = _modifierPatternCode as ModifierPattern
    if (pattern == null) {
      throw new IllegalStateException(displaykey.Builder.WCModifier.Error.InvalidPatternCode(_modifierPatternCode))
    }
    var jurisModifier = jurisdiction.getModifier(pattern)
    if (jurisModifier == null) {
      throw new IllegalStateException(displaykey.Builder.WCModifier.Error.InvalidPattern(pattern))
    }
    return jurisModifier as WCModifier
  }

  function withRateValue(value : double) : WCModifierBuilder {
    set(WCModifier.Type.TypeInfo.getProperty("RATEMODIFIER"), BigDecimal.valueOf(value))
    return this
  }

  function withBooleanValue(value : boolean) : WCModifierBuilder {
    set(WCModifier.Type.TypeInfo.getProperty("BOOLEANMODIFIER"), value)
    return this
  }
}
