package gw.lob.pa.mvr

uses gw.plugin.motorvehiclerecord.MVRSearchCriteria

enhancement MVROrderEnhancement : entity.MVROrder {
  function populateSearchCriteria(msc : MVRSearchCriteria){
    this.FirstNameSC = msc.FirstName    
    this.LastNameSC = msc.LastName    
    this.MiddleNameSC = msc.MiddleName    
    this.DateOfBirthSC = msc.DateOfBirth
    this.LicenseNumberSC = msc.LicenseNumber
    this.LicenseStateSC = msc.LicenseState
  }
 
  function setOrderData(policyDriverMVR : PolicyDriverMVR){
    this.InternalRequestID = policyDriverMVR.InternalRequestID
    this.OrderStatus = policyDriverMVR.OrderStatus
    this.StatusDate = policyDriverMVR.StatusDate
  }

}
