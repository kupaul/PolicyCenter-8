package gw.lob.pa.mvr

uses gw.api.motorvehiclerecord.IMVROrder
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.api.motorvehiclerecord.IMVRSearchCriteria
uses java.util.Date
uses gw.api.util.StateJurisdictionMappingUtil

@Export
class PolicyDriverMVRSubjectImpl implements IMVRSubject{
  
  var _policyDriverMVR: PolicyDriverMVR

  construct(driverMVR: PolicyDriverMVR) {
    _policyDriverMVR = driverMVR
  }

  override property get SearchCriteria() : IMVRSearchCriteria {
    return _policyDriverMVR.PolicyDriver.MVRSearchCriteria
  }

  override property get RequestID() : String {
    return _policyDriverMVR.InternalRequestID
  }
  
  /*
   * Returns true if the MVR report is still valid (not yet expired)
   * Uses the system table motor_vehicle_record_configs to get the stale days
   */
  override function isMVRValid(mvrOrder: IMVROrder): boolean{
    if(mvrOrder == null) return false
    
    var person = _policyDriverMVR.PolicyDriver.AccountContactRole.AccountContact.Contact as Person
    var policyPeriod = _policyDriverMVR.Branch
    var config = MVRConfig.executeSearch(person.LicenseState, policyPeriod.UWCompany.Code)
    var staleDays = config.StaleDays.intValue()
    var reportDate = mvrOrder.getReportRequestedDate()
    if(mvrOrder.MVRData.HasElements){
      reportDate = mvrOrder.MVRData.first().getReportDate()
    }
    var daysDiff = reportDate.differenceInDays(Date.Today)
    
    return daysDiff <= staleDays
  }

}
