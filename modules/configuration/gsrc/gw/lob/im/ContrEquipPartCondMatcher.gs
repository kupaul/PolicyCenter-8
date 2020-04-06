package gw.lob.im
uses gw.lob.common.AbstractConditionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link ContrEquipPartCond}s based on the FK to the {@link ContractorsEquipPart} as well as the
 * properties defined in {@link AbstractConditionMatcher}.
 */
@Export
class ContrEquipPartCondMatcher extends AbstractConditionMatcher<ContrEquipPartCond>{

  construct(owner : ContrEquipPartCond) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return ContrEquipPartCond.Type.TypeInfo.getProperty("ContractorsEquipPart") as ILinkPropertyInfo
  }

}
