package gw.question

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link PCAnswerDelegate}s (that are also {@link EffDated}) based on the QuestionCode, as well
 * as the FK to the answer Container.  Subclasses must implement the abstract Container property to define the
 * FK to the owning container.
 */
@Export
abstract class AbstractAnswerMatcher<D extends PCAnswerDelegate & EffDated> extends AbstractEffDatedPropertiesMatcher<D> {

  construct(delegateInstance : D) {
    super(delegateInstance)
  }
  
  //an answer is logically identifiable by its question code and container
  final override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { D.Type.TypeInfo.getProperty("QuestionCode") as IEntityPropertyInfo }
  }
  
  //force all subtypes to implement a method to identify their container
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return Container
  }
  
  /**
   * Defines the foriegn key from this PCAnswerDelegate to the owning AnswerContainer.  Must be implemented by
   * concrete subtypes.
   */
  abstract property get Container() : List<ILinkPropertyInfo>
  
}
