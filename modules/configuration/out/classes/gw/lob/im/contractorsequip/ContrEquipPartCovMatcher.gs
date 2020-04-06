package gw.lob.im.contractorsequip

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link ContrEquipPartCov}s based on the FK to the {@link ContractorsEquipPart} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class ContrEquipPartCovMatcher extends AbstractCoverageMatcher<ContrEquipPartCov> {

  construct(owner : ContrEquipPartCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {ContrEquipPartCov.Type.TypeInfo.getProperty("ContractorsEquipPart") as ILinkPropertyInfo}
  }
  
}