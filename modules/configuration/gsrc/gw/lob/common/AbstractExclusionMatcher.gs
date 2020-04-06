package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable
uses java.lang.IllegalStateException

/**
 * Matches subtypes of {@link Exclusion} based on the Pattern Code, and the ParentColumn defined in the abstract
 * Parent property.  The Parent property must be implemented by concrete subtypes, and defines the FK from
 * this exclusion to the entity that owns the exclusion (for example, GeneralLiabilityExclusionMatcher's Parent
 * parent property refers to the General Liability Line)
 */
@Export
abstract class AbstractExclusionMatcher<D extends Exclusion> extends AbstractEffDatedPropertiesMatcher<D> {

  construct(exclusionDelegator : D) {
    super(exclusionDelegator)
  }
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { D.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo }
  }
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {this.Parent}
  }
  
  /**
   * Defines the foreign key column that points from this Exclusion to its owning Parent entity.
   */
  abstract property get Parent() : ILinkPropertyInfo
}
