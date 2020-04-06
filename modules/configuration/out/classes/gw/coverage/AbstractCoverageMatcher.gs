package gw.coverage

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Concrete implementation of {@link AbstractEffDatedPropertiesMatcher} for matching subtypes of {@link Coverage}.
 * Coverages match on at least the PatternCode as well as the FKs to the Coverable(s).  Subtypes of this abstract
 * class must define what the FK(s) to the Coverable(s) are by implementing the CoverableColumns() property.
 */
@Export
abstract class AbstractCoverageMatcher<T extends Coverage> extends AbstractEffDatedPropertiesMatcher<T> {

  construct(cov : T) {
    super(cov)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {T.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return CoverableColumns
  }
  
  /**
   * Return the foreign key column(s) that point from this Coverage to its owning Coverable(s).
   */
  abstract property get CoverableColumns() : List<ILinkPropertyInfo>
}
