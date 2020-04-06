package gw.lob.im

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link IMCoveragePart}s based on the subtype (that is, a SignPart will match another SignPart).
 */
@Export
class IMCoveragePartMatcher extends AbstractEffDatedPropertiesMatcher<IMCoveragePart> {

  construct(part : IMCoveragePart) {
    super(part)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {IMCoveragePart.Type.TypeInfo.getProperty("Subtype") as IEntityPropertyInfo}
  }

}
