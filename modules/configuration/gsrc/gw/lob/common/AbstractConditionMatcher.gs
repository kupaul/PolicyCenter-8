package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable
uses java.lang.IllegalStateException

/**
 * Abstract class extending from {@link AbstractEffDatedPropertiesMatcher} used to match types that extend 
 * {@link PolicyCondition}.  PolicyConditions match on PatternCode as well as a FK defined by the Parent property,
 * which must be implemented by concrete subclasses.  The Parent is the FK to the entity that owns the Condition
 * in question - for example, the PersonalAutoCondMatcher parent is the Personal Auto Line.
 */
@Export
abstract class AbstractConditionMatcher<D extends PolicyCondition> extends AbstractEffDatedPropertiesMatcher<D> {

  construct(pcDelegator : D) {
    super(pcDelegator)
  }
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { D.Type.TypeInfo.getProperty("PatternCode") as IEntityPropertyInfo }
  }
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {this.Parent}
  }
  
  /**
   * Defines the foreign key that owns this type of PolicyCondition.  This should be consistent based on the subtype of
   * PolicyCondition - some PolicyConditions are owned by a Line, a Jurisdiction or a specific Coverable.
   */
  abstract property get Parent() : ILinkPropertyInfo
}
