package gw.lob.ba
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class BusinessVehicleCopier extends AbstractEffDatedCopyable<BusinessVehicle> {

  construct(vehicle : BusinessVehicle) {
    super(vehicle)
  }

  override function copyBasicFieldsFromBean(vehicle : BusinessVehicle) {
    _bean.BodyType             = vehicle.BodyType
    _bean.Color                = vehicle.Color
    _bean.CostNew              = vehicle.CostNew
    _bean.DestinationZone      = vehicle.DestinationZone
    _bean.Experience           = vehicle.Experience
    _bean.Industry             = vehicle.Industry
    _bean.IndustryUse          = vehicle.IndustryUse
    _bean.LeaseOrRent          = vehicle.LeaseOrRent
    _bean.LengthOfLease        = vehicle.LengthOfLease
    _bean.LicensePlate         = vehicle.LicensePlate
    _bean.LicenseState         = vehicle.LicenseState
    _bean.Make                 = vehicle.Make
    _bean.Model                = vehicle.Model
    _bean.OriginationZone      = vehicle.OriginationZone
    _bean.PrimaryUse           = vehicle.PrimaryUse
    _bean.StatedValue          = vehicle.StatedValue
    _bean.VehicleClassCode     = vehicle.VehicleClassCode
    _bean.VehicleCondition     = vehicle.VehicleCondition
    _bean.VehicleRadius        = vehicle.VehicleRadius
    _bean.VehicleSizeClass     = vehicle.VehicleSizeClass
    _bean.VehicleType          = vehicle.VehicleType
    _bean.Year                 = vehicle.Year    
    _bean.YearPurchased        = vehicle.YearPurchased 
    // take care of FK Location
    // it would be nicer if we had a join entity instead of a naked foreign key here.
    var matches = vehicle.Location.findMatchesInPeriodUntyped(_bean.Branch, false) as List<PolicyLocation>
    // because slices can't overlap, firstWhere is equivalent to "AtMostOneRow"
    // This will set to the matching location if it exists on the destination branch
    // or null if the location is not present on the branch.
    _bean.Location = matches.firstWhere(\ l -> l.isEffective(_bean.EffectiveDate))
    /*
    Deprecated columns  that have been replaced with Vehicle Modifiers
    _bean.AntiLockBrakes       = vehicle.AntiLockBrakes
    _bean.AntiTheft            = vehicle.AntiTheft
    _bean.IntraInterStateUsage = vehicle.IntraInterStateUsage
    _bean.OwnedByPoliticalSub  = vehicle.OwnedByPoliticalSub
    _bean.SafeDrivingCert      = vehicle.SafeDrivingCert
    */
  }

}
