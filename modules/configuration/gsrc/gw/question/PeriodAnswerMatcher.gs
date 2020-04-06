package gw.question

uses entity.PeriodAnswer
uses gw.lang.Export
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link PeriodAnswer}s based on the properties defined in {@link AbstractAnswerMatcher}.
 */
@Export
class PeriodAnswerMatcher extends AbstractAnswerMatcher<PeriodAnswer> {
  
  construct(periodAnswer : PeriodAnswer) {
    super(periodAnswer)
  }

  override property get Container() : List<ILinkPropertyInfo> {
    return {}
  }

}
