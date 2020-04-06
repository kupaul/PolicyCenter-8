package gw.question
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link LocationAnswer}s based on the FK to the {@link PolicyLocation} as well as the
 * properties defined in {@link AbstractAnswerMatcher}.
 */
@Export
class LocationAnswerMatcher extends AbstractAnswerMatcher<LocationAnswer>{

  construct(locationAnswer : LocationAnswer) {
    super(locationAnswer)
  }

  override property get Container() : List<ILinkPropertyInfo> {
    return {LocationAnswer.Type.TypeInfo.getProperty("PolicyLocation") as ILinkPropertyInfo}
  }

}
