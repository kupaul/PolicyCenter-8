package gw.lob.ba
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo
uses gw.lob.common.AbstractModifierMatcher

@Export
class BAModifierMatcher extends AbstractModifierMatcher<BAModifier> {
  construct(owner : BAModifier) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    var columns = super.IdentityColumns
    columns.toCollection().add(BAModifier.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo)
    return columns
  }
}
