package gw.productmodel
uses gw.api.productmodel.ModifierPattern

enhancement ModifierPatternEnhancement : ModifierPattern {
  static property get ExpMod () : ModifierPattern { return "ExpMod" as ModifierPattern}
}
