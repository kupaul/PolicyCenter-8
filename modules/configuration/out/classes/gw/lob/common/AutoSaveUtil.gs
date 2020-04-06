package gw.lob.common

@Export
class AutoSaveUtil {
  
  static final var autoSaveDraftSteps : String[] = {
    /* Shared */
    "PolicyInfo", "Locations", 
    /* BA */
    "BusinessVehicles", "StateInfo", "BADrivers", 
    /* BOP */
    "BOP", "BOPBuildings",
    /* CP */
    "CPBuildings",
    /* GL */
    "GLLine", 
    /* PA */
    "PersonalVehicles", "PADrivers"
  }

  static function canAutoSaveDraft(locationStepID : String) : boolean {
    return autoSaveDraftSteps.contains( locationStepID )
  }
}
