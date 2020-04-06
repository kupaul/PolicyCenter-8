package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link PolicyLine}s based on the PatternCode.
 */
@Export
class AbstractPolicyLineMatcher<T extends PolicyLine> extends AbstractEffDatedPropertiesMatcher<T> {

  construct(line : T) {
    super(line)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {T.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }

}
