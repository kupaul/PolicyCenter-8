package gw.lob.pa

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@link PersonalAutoExcl}s based on the FK to the {@link PALine} as well as the
 * properties defined in {@link AbstractExclusionMatcher}.
 */
@Export
class PersonalAutoExclMatcher extends AbstractExclusionMatcher<PersonalAutoExcl>{

  construct(owner : PersonalAutoExcl) {
    super(owner)
  }

  override property get Parent() : ILinkPropertyInfo {
    return PersonalAutoExcl.Type.TypeInfo.getProperty("PALine") as ILinkPropertyInfo
  }

}
