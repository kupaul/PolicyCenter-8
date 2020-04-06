package gw.lob.ba
uses gw.lob.common.AbstractModifierMatcher
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BAJurisModifiers based on the BAJurisdicion
 */
@Export
class BAJurisdictionModifierMatcher extends AbstractModifierMatcher<BAJurisModifier> {
  construct(owner : BAJurisModifier) {
    super(owner)
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BAJurisModifier.Type.TypeInfo.getProperty("Jurisdiction") as ILinkPropertyInfo}
  }
}
