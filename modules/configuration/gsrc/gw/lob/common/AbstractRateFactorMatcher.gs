package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches subtypes of {@link RateFactor} based on the PatternCode.  Concrete subtypes must also define which 
 * ParentColumn foreign keys (usually the owner of the RateFactor) are also used in the match.
 */
@Export
abstract class AbstractRateFactorMatcher<T extends RateFactor> extends AbstractEffDatedPropertiesMatcher<T> {

  construct(owner : T) {
    super(owner)
  }
  
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {T.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }

}
