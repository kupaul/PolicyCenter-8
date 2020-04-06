package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * Matches subtypes of {@link Modifier} based on the PatternCode.  Concrete subtypes of this class must
 * define any ParentColumns that identify the specific type of Modifier.
 */
@Export
abstract class AbstractModifierMatcher<T extends Modifier> extends AbstractEffDatedPropertiesMatcher<T> {

  construct(owner : T) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {T.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }
}
