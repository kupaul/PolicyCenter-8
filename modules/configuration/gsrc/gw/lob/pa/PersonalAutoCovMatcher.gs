package gw.lob.pa

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link PersonalAutoCov}s based on the FK to the {@link PALine} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class PersonalAutoCovMatcher extends AbstractCoverageMatcher<PersonalAutoCov> {

  construct(owner : PersonalAutoCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {PersonalAutoCov.Type.TypeInfo.getProperty("PALine") as ILinkPropertyInfo}
  }

}
