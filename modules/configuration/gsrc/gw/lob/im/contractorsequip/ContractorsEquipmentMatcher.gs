package gw.lob.im.contractorsequip

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Out of the box, ContractosEquipment is not matchable as the base data model does not contain sufficiently
 * unique identifying fields - as such, this matcher as implemented will always return false.
 */
@Export
class ContractorsEquipmentMatcher extends AbstractEffDatedPropertiesMatcher<ContractorsEquipment> {
  
  construct(owner : ContractorsEquipment) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {ContractorsEquipment.Type.TypeInfo.getProperty("ContractorsEquipPart") as ILinkPropertyInfo}
  }

  override function isLogicalMatchUntyped(bean : KeyableBean) : boolean {
    if (bean typeis ContractorsEquipment) {
      return isLogicalMatch(bean)
    } else {
      return false
    }
  }

  // OOTB, ContractorsEquipment entities are not matchable.  Customers should delete the overridden
  // isLogicalMatch() method and implement the IdentityColumns property if they would like to match
  // these entities (e.g. if they have changed the ContractorsEquipmentID column to be required).

  override function isLogicalMatch(other : ContractorsEquipment) : boolean {
    return false
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {ContractorsEquipment.Type.TypeInfo.getProperty("ID") as IEntityPropertyInfo}
  }
  
}