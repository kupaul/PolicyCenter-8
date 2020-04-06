package gw.lob.pa.mvr
uses gw.lob.pa.mvr.IMVRService

uses typekey.MVRStatus
uses entity.PolicyDriverMVR

uses gw.lob.pa.mvr.InternalMVRService
uses gw.api.motorvehiclerecord.IMVROrder
uses java.util.ArrayList
uses gw.api.system.PCLoggerCategory

@Export
class PAMVRUtil {
  
    final static var internalMVRService : IMVRService = InternalMVRService.getInstance()

  /*
   * Creates PolicyDriverMVR entities for the passed in policy drivers
   */
  static function initMVRRequest(selectedDrivers: PolicyDriver[]) {
    if(selectedDrivers.Count == 0) {
      return
    }

    for(driver in selectedDrivers){

      if (driver.PolicyDriverMVR != null) {
        driver.PolicyDriverMVR.remove()
      }
      var policyMVR = new PolicyDriverMVR(driver.Branch)
      policyMVR.PersonalAutoLine = driver.PersonalAutoLine
      policyMVR.OrderStatus = MVRStatus.TC_TOBEORDERED
      driver.PolicyDriverMVR = policyMVR
    }
  }

  /*
   * Calls the MVR plugin to order the MVRs
   */
  static function orderMVRs(selectedDrivers: PolicyDriver[]) {
    if(selectedDrivers.Count == 0) {
      return
    }

    var policyDriverMVRs = selectedDrivers*.PolicyDriverMVR
    
    var internalIDsMap = internalMVRService.orderMVR(policyDriverMVRs)
        
    for(policyDriverMVR in policyDriverMVRs){
      var internalID = internalIDsMap.get(policyDriverMVR)
      policyDriverMVR.InternalRequestID = internalID
      // temporary status until we get the real one calling checkMVRStatus
      policyDriverMVR.setOrderStatus(MVRStatus.TC_ORDERED)
    }

   
  }

  /*
   * Calls the internal MVR service plugin to verify the status of the passed in ordered MVRs
   */
  static function checkMVRStatus(driversWithOrders: PolicyDriverMVR[]){
    var responseMap = internalMVRService.getMVROrderStatus(driversWithOrders)
    for(policyDriverMVR in driversWithOrders){
      var status = responseMap.get(policyDriverMVR)
      // if it is received in the MVR service for the policy it is just ready to get from the service
      if(status == MVRStatus.TC_RECEIVED) status = MVRStatus.TC_READY   
      policyDriverMVR.setOrderStatus(status)
      PCLoggerCategory.PRODUCT_MODEL.info("In checkMVRStatus RequestID=" + policyDriverMVR.InternalRequestID)
      PCLoggerCategory.PRODUCT_MODEL.info("status=" + status)
    }
  }

  /*
   * Calls the MVR plugin to get MVR data for the orders that have the status "RECEIVED"
   */
   
  static function getMVRData(driversWithMVRs: PolicyDriverMVR[]) {
    getMVRDataAndReturnOrders(driversWithMVRs)
  }
  
  private static function getMVRDataAndReturnOrders(driversWithMVRs: PolicyDriverMVR[]): IMVROrder[]{
    var mvrOrders = new ArrayList<IMVROrder>()
    if(driversWithMVRs.Count > 0){// some orders

      PCLoggerCategory.PRODUCT_MODEL.info("before getMVRDetails")

      var responseHashMap = internalMVRService.getMVRDetails(driversWithMVRs)
      PCLoggerCategory.PRODUCT_MODEL.info("after getMVRDetails:" + responseHashMap.size())

      for(policyDriverMVR in driversWithMVRs){
        var mvrOrder = responseHashMap.get(policyDriverMVR)
        //MVRStatus should be set to READY and should be set to RECEIVED after setMVRSummary()
        policyDriverMVR.setMVRSummary(mvrOrder)
        mvrOrders.add(mvrOrder)
        // add code to set the policy MVR summary data
      }
    }
    return mvrOrders.toTypedArray()
  }
  
  static function checkAllClear(driversWithMVRs: PolicyDriverMVR[]): boolean{
    var orders = getMVRDataAndReturnOrders(driversWithMVRs)
    var notClear = orders.firstWhere(\ o -> o.MVRResponse <> typekey.MVRResponse.TC_CLEAR)
    return notClear == null
  }
}
