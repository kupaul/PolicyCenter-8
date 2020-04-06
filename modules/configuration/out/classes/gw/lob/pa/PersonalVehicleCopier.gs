package gw.lob.pa
uses gw.api.copy.CompositeCopier
uses gw.coverage.AllCoverageCopier

/**
 * Copies a PersonalVehicle into a PolicyPeriod.
 */
@Export
class PersonalVehicleCopier extends CompositeCopier<PersonalAutoLine, PersonalVehicle> {

  var _sourceVehicle : PersonalVehicle as readonly Source
  var _allCoverageCopier : AllCoverageCopier as AllCoverageCopier
  var _allAddlInterestDetailsCopier : AllAddlInterestDetailsCopier as AllAddlInterestDetailsCopier
  
  construct(sourceVehicle : PersonalVehicle) {
    _sourceVehicle = sourceVehicle
    addCopier(new ModifierCopier(_sourceVehicle).shouldCopy())    // always copy modifiers
    _allCoverageCopier = new AllCoverageCopier(_sourceVehicle)
    addCopier(_allCoverageCopier)
    _allAddlInterestDetailsCopier = new AllAddlInterestDetailsCopier(_sourceVehicle)
    addCopier(_allAddlInterestDetailsCopier)
  }
  
  override function findMatch(target : PersonalAutoLine) : PersonalVehicle[] {
    var matchesVehicles = _sourceVehicle.findMatchesInPeriodUntyped(target.Branch, false)
    var targetVehicle = matchesVehicles.firstWhere(\v -> v.EffectiveDateRange.includes(target.Branch.EditEffectiveDate)) as PersonalVehicle
    return (targetVehicle != null) ? new PersonalVehicle[]{targetVehicle} : null 
  }
 
  override protected function getOrCreateRoot(target : PersonalAutoLine) : PersonalVehicle {
    var targetVehicle : PersonalVehicle
    var matches = findMatch(target)
    
    if (matches == null) {
      // Create a new vehicle in the target period and copy all relevant fields from Source
      targetVehicle = target.createAndAddVehicle()
    } else {
      targetVehicle = matches.single().getSlice(target.Branch.EditEffectiveDate) 
    }
    return targetVehicle
  }
  
  override function copyRoot(targetVehicle : PersonalVehicle) {
    var defaultLocation = targetVehicle.GarageLocation
    targetVehicle.copyFromBeanUntyped(_sourceVehicle)
    //The matcher's copyFrom method does not include the Vin, so copy it manually
    targetVehicle.Vin = _sourceVehicle.Vin
    //After copying, if no legal location was found, re-use the default location
    if (targetVehicle.GarageLocation == null) {
      targetVehicle.GarageLocation = defaultLocation
    }
  }

}
