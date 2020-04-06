package gw.lob.im.contractorsequip

uses gw.coverage.AbstractCoverageMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link ContractorsEquipCov}s based on the FK to the {@link ContractorsEquipment} as well as the
 * properties defined in {@link AbstractCoverageMatcher}.
 */
@Export
class ContractorsEquipCovMatcher extends AbstractCoverageMatcher<ContractorsEquipCov> {

  construct(owner : ContractorsEquipCov) {
    super(owner)
  }

  override property get CoverableColumns() : List<ILinkPropertyInfo> {
    return {ContractorsEquipCov.Type.TypeInfo.getProperty("ContractorsEquipment") as ILinkPropertyInfo}
  }

}