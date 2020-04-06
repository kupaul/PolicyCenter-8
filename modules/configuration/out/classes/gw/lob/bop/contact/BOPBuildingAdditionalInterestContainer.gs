package gw.lob.bop.contact
uses gw.lob.common.contact.AbstractAdditionalInterestContainer

@Export
class BOPBuildingAdditionalInterestContainer extends AbstractAdditionalInterestContainer<BOPBuilding>
{
  construct(building : BOPBuilding) {
    super(building)
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BOPLocation.BOPLine
  }

  override property get OwnerDisplayName() : String {
    return _owner.DisplayName + " (" + _owner.BOPLocation.DisplayName + ")"
  }

  override property get AdditionalInterestDetails() : AddlInterestDetail[] {
    return _owner.AdditionalInterests
  }

  override property get TypeLabel() : String {
    return displaykey.BusinessOwners.Building.AdditionalInterest.LVLabel
  }
  
  override function addToAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void {
    if (not (interestDetail typeis BOPBldgAddlInterest)) {
      throw displaykey.BusinessOwners.Building.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    _owner.addToAdditionalInterests( interestDetail as BOPBldgAddlInterest )
  }

  override function removeFromAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void {
    if (not (interestDetail typeis BOPBldgAddlInterest)) {
      throw displaykey.BusinessOwners.Building.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    interestDetail.PolicyAddlInterest.removeFromAdditionalInterestDetails(interestDetail)
  }

  override function createNewAdditionalInterestDetail() : BOPBldgAddlInterest {
    return new BOPBldgAddlInterest(this.PolicyPeriod)
  }

  override property get ContainerIsValid() : boolean
  {
    return not (_owner == null)
  }
}
