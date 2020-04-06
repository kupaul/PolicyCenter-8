package gw.lob.ba.contact
uses gw.lob.common.contact.AbstractAdditionalInterestContainer

@Export
class BAVehicleAdditionalInterestContainer extends AbstractAdditionalInterestContainer<BusinessVehicle>
{
  construct(vehicle : BusinessVehicle) {
    super(vehicle)
    _owner = vehicle  
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BALine
  }
  
  override property get AdditionalInterestDetails() : AddlInterestDetail[] {
    return _owner.AdditionalInterests
  }

  override property get TypeLabel() : String {
    return displaykey.BusinessAuto.Vehicle.AdditionalInterest.LVLabel
  }
  
  override function addToAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void {
    if (not (interestDetail typeis BAVhcleAddlInterest)) {
      throw displaykey.BusinessAuto.Vehicle.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    _owner.addToAdditionalInterests( interestDetail as BAVhcleAddlInterest )
  }

  override function removeFromAdditionalInterestDetails( interestDetail: AddlInterestDetail ) : void {
    if (not (interestDetail typeis BAVhcleAddlInterest)) {
      throw displaykey.BusinessAuto.Vehicle.AdditionalInterest.Error.AdditionalInterestIsWrongType(interestDetail.Subtype)
    }
    interestDetail.PolicyAddlInterest.removeFromAdditionalInterestDetails(interestDetail)
  }

  override function createNewAdditionalInterestDetail() : BAVhcleAddlInterest {
    return new BAVhcleAddlInterest(this.PolicyPeriod)
  }

  override property get ContainerIsValid() : boolean
  {
    return not (_owner == null)
  }

}