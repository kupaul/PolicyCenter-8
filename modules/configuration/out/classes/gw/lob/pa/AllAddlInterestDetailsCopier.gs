package gw.lob.pa
uses gw.api.copy.GroupingCompositeCopier

/**
 * Copies all selected {@link AddlInterestDetail} from a source PersonalVehicle to a target PersonalVehicle, using
 * {@link AddlInterestDetailsCopier}s to copy the individual details.
 */
@Export
class AllAddlInterestDetailsCopier extends GroupingCompositeCopier<AddlInterestDetailsCopier, PersonalVehicle> {

  var _vehicle : PersonalVehicle as readonly Source
  
  construct(vehicle : PersonalVehicle) {
    _vehicle = vehicle
    _vehicle.AdditionalInterestDetails.each(\ a -> addCopier(new AddlInterestDetailsCopier(a)))
  }

}
