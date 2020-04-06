package gw.lob.pa
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class PersonalVehicleEffDatedCopier extends AbstractEffDatedCopyable<PersonalVehicle> {

  construct(vehicle : PersonalVehicle) {
    super(vehicle)
  }

  override function copyBasicFieldsFromBean(vehicle : PersonalVehicle) {
    var incoming = vehicle
    var thisOne = this._bean
    
    thisOne.AnnualMileage  = incoming.AnnualMileage
    thisOne.BasisAmount    = incoming.BasisAmount
    thisOne.Color          = incoming.Color
    thisOne.CommutingMiles = incoming.CommutingMiles
    thisOne.CostNew        = incoming.CostNew
    thisOne.LeaseOrRent    = incoming.LeaseOrRent
    thisOne.LicensePlate   = incoming.LicensePlate
    thisOne.Make           = incoming.Make
    thisOne.Model          = incoming.Model
    thisOne.StatedValue    = incoming.StatedValue
    thisOne.Year           = incoming.Year
    thisOne.BodyType       = incoming.BodyType
    thisOne.LengthOfLease  = incoming.LengthOfLease
    thisOne.LicenseState   = incoming.LicenseState
    thisOne.PipCovered     = incoming.PipCovered
    thisOne.PrimaryUse     = incoming.PrimaryUse
    thisOne.VehicleType    = incoming.VehicleType

    // take care of FK GarageLocation
    // it would be nicer if we had a join entity instead of a naked foreign key here.
    var matches = incoming.GarageLocation.findMatchesInPeriodUntyped(thisOne.Branch, false) as List<PolicyLocation>
    // because slices can't overlap, firstWhere is equivalent to "AtMostOneRow"
    // This will set to the matching location if it exists on the destination branch
    // or null if the location is not present on the branch.
    thisOne.GarageLocation = matches.firstWhere(\ l -> l.isEffective(thisOne.EffectiveDate))
  }

}
