package gw.plugin.productmodel.impl

@Export
class RefDateTypeLookupHandler extends RefDateTypeLookupHandlerBase {
  override property get DefaultDateType() : ReferenceDateType {
    return "EffectiveDate"
  }
}
