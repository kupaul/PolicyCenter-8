package gw.question

uses entity.PolicyLineAnswer
uses gw.lang.Export
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link PolicyLineAnswer}s based on the FK to the {@link PolicyLine} as well as the
 * properties defined in {@link AbstractAnswerMatcher}.
 */
@Export
class PolicyLineAnswerMatcher extends AbstractAnswerMatcher<PolicyLineAnswer> {

  construct(bean : PolicyLineAnswer) {
    super(bean)
  }

  override property get Container() : List<ILinkPropertyInfo> {
    return {PolicyLineAnswer.Type.TypeInfo.getProperty("PolicyLine") as ILinkPropertyInfo}
  }

}
