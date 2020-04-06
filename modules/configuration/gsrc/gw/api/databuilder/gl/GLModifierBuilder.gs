package gw.api.databuilder.gl
uses gw.api.builder.ModifierBuilder
uses gw.api.productmodel.ModifierPattern
uses java.lang.IllegalStateException

@Export
class GLModifierBuilder extends ModifierBuilder<GLModifier, GLModifierBuilder>{

  construct(modifierPatternCode : String) {
    super(GLModifier)
    var pattern = modifierPatternCode as ModifierPattern
    if (pattern == null) {
      throw new IllegalStateException(displaykey.Builder.CPModifier.Error.InvalidPatternCode(modifierPatternCode))
    }
    withPattern(pattern)
  }
}
