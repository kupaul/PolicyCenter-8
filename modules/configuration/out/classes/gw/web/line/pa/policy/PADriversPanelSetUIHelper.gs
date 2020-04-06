package gw.web.line.pa.policy

@Export
class PADriversPanelSetUIHelper {
  public static function printDrivers(drivers: entity.PolicyDriver[]){
    drivers.each(\ d -> print(d))
  }

  public static function attachMVRToPolicyDriver(currentLocation : pcf.api.Location, policyPeriod : entity.PolicyPeriod, policyDrivers : PolicyDriver[]) {
    // if all selected drivers have the flag DNO MVR display error
    if(policyDrivers.allMatch(\ d -> d.DoNotOrderMVR)){
      throw new gw.api.util.DisplayableException(displaykey.Web.PolicyLine.Drivers.NoMVRsToOrder)
    }

    if((currentLocation as pcf.api.Wizard).saveDraft()){

      var workflow = new entity.ProcessMVRsWF()
      var synchronousWait = false
      workflow.setupForMVRRequest(policyPeriod, policyDrivers)
      workflow.initiateMVRRequest(synchronousWait)
      (currentLocation as pcf.api.Wizard).saveDraft()
    }
  }

  public static function getMVROrder(policyDriverMVR : PolicyDriverMVR) : gw.api.motorvehiclerecord.IMVROrder {
    return policyDriverMVR <> null ? policyDriverMVR.getMVRDetails() : null
  }
}