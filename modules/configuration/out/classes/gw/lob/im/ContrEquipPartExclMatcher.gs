package gw.lob.im
uses gw.lob.common.AbstractExclusionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link ContrEquipPartExcl}s based on the FK to the {@link ContractorsEquipPart} as well as the
 * properties defined in {@link AbstractExclusionMatcher}.
 */
@Export
class ContrEquipPartExclMatcher extends AbstractExclusionMatcher<ContrEquipPartExcl>{

  construct(owner : ContrEquipPartExcl) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return ContrEquipPartExcl.Type.TypeInfo.getProperty("ContractorsEquipPart") as ILinkPropertyInfo
  }

}
