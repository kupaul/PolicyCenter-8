package gw.lob.im.contact

uses gw.lob.common.contact.AbstractAdditionalInterestContainer

@Export
class ScheduledEquipmentAdditionalInterestContainer extends AbstractAdditionalInterestContainer<ContractorsEquipment>
{
  construct(equipment : ContractorsEquipment) {
    super(equipment)
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return this.PolicyLine.Branch
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.PolicyLine
  }
  
  override property get AdditionalInterestDetails() : AddlInterestDetail[] {
    return _owner.AdditionalInterests
  }

  override property get TypeLabel() : String {
    return displaykey.Web.Policy.IM.ContractorsEquipment.ScheduledEquipment.AdditionalInterest.LVLabel
  }
  
  override function addToAdditionalInterestDetails( interestDetail: AddlInterestDetail ) {
    if (not (interestDetail typeis IMSchEquipAddlInterest)) {
      throw displaykey.Web.Policy.IM.ContractorsEquipment.ScheduledEquipment.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    _owner.addToAdditionalInterests( interestDetail as IMSchEquipAddlInterest )
  }

  override function removeFromAdditionalInterestDetails( interestDetail: AddlInterestDetail ) {
    if (not (interestDetail typeis IMSchEquipAddlInterest)) {
      throw displaykey.Web.Policy.IM.ContractorsEquipment.ScheduledEquipment.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    interestDetail.PolicyAddlInterest.removeFromAdditionalInterestDetails(interestDetail)
  }

  override function createNewAdditionalInterestDetail() : IMSchEquipAddlInterest {
    return new IMSchEquipAddlInterest(this.PolicyPeriod)
  }

  override property get ContainerIsValid() : boolean {
    return not (_owner == null)
  }
}