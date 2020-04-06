package gw.lob.pa
uses java.util.Date
uses gw.lob.pa.mvr.InternalMVRService
uses gw.api.motorvehiclerecord.IMVROrder

enhancement PolicyDriverMVREnhancement : entity.PolicyDriverMVR {

  function setOrderStatus(newStatus: MVRStatus){
    if(newStatus != this.OrderStatus){
      this.OrderStatus = newStatus
      this.StatusDate = Date.CurrentDate
    }
  }

  function getMVRDetails() : IMVROrder {
    var mvrService = InternalMVRService.getInstance()
    var latestMVRDetails : IMVROrder
    if(this.InternalRequestID != null and this.OrderStatus == typekey.MVRStatus.TC_RECEIVED){      
      latestMVRDetails = mvrService.getMVRDetails({this}).get(this)
    }
    return latestMVRDetails 
  }
  
  function getAllMVRs() : IMVROrder[] {
    var mvrService = InternalMVRService.getInstance()
    return mvrService.getAllExistingMVRs(this.PolicyDriver.MVRSearchCriteria)      
  }

  function setMVRSummary(mvrOrder : IMVROrder){
    var accidentCount = 0
    var violationCount = 0
    var pointCount = 0
    
    //for each MVR total the accidents, violations and points
    for(mvr in mvrOrder.MVRData){
      accidentCount += mvr.getIncidents().where(\ i -> i.getIncidentType() == typekey.MVRIncidentType.TC_ACCI).Count
      violationCount += mvr.getIncidents().where(\ i -> i.getIncidentType() == typekey.MVRIncidentType.TC_VIOL).Count
      //for each incident, add up the points
      mvr.getIncidents().each(\ i -> {pointCount += i.getPoints()})
    }
    
    //set the calculated values on the PolicyDriverMVR as well as the order status which will have been returned with the Order
    this.setOrderStatus(mvrOrder.getOrderStatus())
    this.NumberOfAccidents = accidentCount
    this.NumberOfViolations = violationCount
    this.Points = pointCount
  }

  function getAccidentsToCompareToTypeKey() : int {
    if(this.NumberOfAccidents == null){
      this.NumberOfAccidents = 0
    }
    var boundedAccidentCount : int
    if(this.NumberOfAccidents.intValue() >= 5 ){
      boundedAccidentCount = 5  
    }
    else{
      boundedAccidentCount = this.NumberOfAccidents.intValue()
    }
    return boundedAccidentCount  
  }
  
  function getViolationsToCompareToTypeKey() : int {
    if(this.NumberOfViolations == null){
      this.NumberOfViolations = 0
    }
    var boundedViolationCount : int
    if(this.NumberOfViolations.intValue() >= 5 ){
      boundedViolationCount = 5  
    }
    else{
      boundedViolationCount = this.NumberOfViolations.intValue()
    }
    return boundedViolationCount  
  }
}
