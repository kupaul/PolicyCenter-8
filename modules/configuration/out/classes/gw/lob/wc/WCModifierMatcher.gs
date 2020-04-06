package gw.lob.wc
uses gw.lob.common.AbstractModifierMatcher
uses gw.entity.IEntityPropertyInfo
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo
uses gw.api.productmodel.ModifierPattern

/**
 * Matches {@link WCModifier}s based on the FK to the {@link WCJurisdiction}, the State and
 * PatternCode properties as well as the properties defined in {@link AbstractModifierMatcher}.
 */
@Export
class WCModifierMatcher extends AbstractModifierMatcher<WCModifier> {
  construct(owner : WCModifier) {
    super(owner)
  }
  
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    if ((this._entity.Pattern as ModifierPattern).SplitOnAnniversary) {
      return { WCModifier.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo,
               WCModifier.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo }
    } else {
      return super.IdentityColumns
    }
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return { WCModifier.Type.TypeInfo.getProperty("WCJurisdiction") as ILinkPropertyInfo }
  }
}
