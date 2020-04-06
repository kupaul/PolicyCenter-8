package gw.lob.pa.contact
uses gw.lob.common.contact.AbstractAdditionalInterestContainer

@Export
class PAVehicleAdditionalInterestContainer extends AbstractAdditionalInterestContainer<PersonalVehicle>
{  
  construct(vehicle : PersonalVehicle) {
    super(vehicle) 
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.PALine
  }
  
  override property get AdditionalInterestDetails() : AddlInterestDetail[] {
    return _owner.AdditionalInterests
  }

  override property get TypeLabel() : String {
    return displaykey.PersonalAuto.Vehicle.AdditionalInterest.LVLabel
  }
  
  override function addToAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void
  {
    if (not (interestDetail typeis PAVhcleAddlInterest)) {
      throw displaykey.PersonalAuto.Vehicle.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    _owner.addToAdditionalInterests( interestDetail as PAVhcleAddlInterest )
  }

  override function removeFromAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void {
    if (not (interestDetail typeis PAVhcleAddlInterest)) {
      throw displaykey.PersonalAuto.Vehicle.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    interestDetail.PolicyAddlInterest.removeFromAdditionalInterestDetails(interestDetail)
  }

  override function createNewAdditionalInterestDetail() : PAVhcleAddlInterest {
    return new PAVhcleAddlInterest(this.PolicyPeriod)
  }

  override property get ContainerIsValid() : boolean
  {
    return not (_owner == null)
  }
}