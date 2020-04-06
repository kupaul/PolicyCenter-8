package gw.lob.pa.mvr

uses gw.lob.pa.mvr.IMVRService
uses gw.lob.pa.mvr.MVRPersistenceHelper
uses java.lang.String
uses typekey.MVRStatus
uses gw.plugin.motorvehiclerecord.IMotorVehicleRecordPlugin
uses java.util.HashMap
uses java.util.ArrayList
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.api.motorvehiclerecord.IMVROrder
uses java.util.concurrent.locks.ReentrantLock
uses gw.api.system.PCLoggerCategory

@Export
class InternalMVRService implements IMVRService {
  static var _lock = new ReentrantLock()
  static var _instance : InternalMVRService 
  var _mvrStorage = MVRPersistenceHelper.getInstance()
  var externalMVRService : IMotorVehicleRecordPlugin = gw.plugin.Plugins.get(gw.plugin.motorvehiclerecord.IMotorVehicleRecordPlugin)
   
  private construct() {

  }
  
  static function getInstance() : InternalMVRService {
    if(_instance == null){
      _instance = new InternalMVRService()
    }
    return _instance
  }

  //TODO-CC is there a way to check if the MVRs exist in the repository without returning it
  override function orderMVR(mvrSubjects : IMVRSubject[]) : HashMap<IMVRSubject, String> {
    using(_lock){
      var requestIDMap = new HashMap<IMVRSubject, String>()
      var requireOrder = new ArrayList<IMVRSubject>()

      //check if a valid MVR is in the repository, for every PolicyDriver that is not in the repository, order it
      for(mvrSubject in mvrSubjects){      
        var mvrOrder = checkIfRepoExistsAndMVRInRepo(mvrSubject)
      
        //if no MVRs are found then add that Driver to the list that needs to have an MVR ordered
        if(needMVROrder(mvrOrder, mvrSubject)){
          requireOrder.add(mvrSubject) 
        //if mvr(s) are returned then return the existing request IDs and we don't need order 
        }else{
          //setmvrSubjectDetails(mvrOrder, mvrSubject)
          requestIDMap.put(mvrSubject, mvrOrder.getInternalRequestID())
        }
      }

      if(requireOrder.HasElements){
        //need to order the MVRs that were not found in the repository
      var externalRequestIDs = externalMVRService.orderMVR(requireOrder.toTypedArray())
        for(mvrSubject in externalRequestIDs.Keys){
          var providerRequestID = externalRequestIDs.get(mvrSubject)
          var internalRequestID: String
          if(_mvrStorage <> null){ 
            internalRequestID = generateInternalID(providerRequestID)
            _mvrStorage.createNewOrder(mvrSubject, internalRequestID, providerRequestID)
          }else{
            // TODO the case when we do not have a repositry
            internalRequestID = providerRequestID
          }
          requestIDMap.put(mvrSubject, internalRequestID)
          var sc = mvrSubject.SearchCriteria
          PCLoggerCategory.INTEGRATION.info("Driver=" + sc.FirstName + " " + sc.LastName)
          PCLoggerCategory.INTEGRATION.info("RequestID=" + internalRequestID)
        }
      }
      return requestIDMap
    }
  }

  override function getMVROrderStatus(mvrSubjects : IMVRSubject[]) : HashMap<IMVRSubject, MVRStatus> {
    using(_lock){
      var responseHash = new HashMap<IMVRSubject, MVRStatus>()
      var externallyOrdered = new ArrayList<IMVRSubject>()
      //check if a valid MVR is in the repository, for every PolicyDriver that is not in the repository, order it
      for(mvrSubject in mvrSubjects){
        var driversMVROrder = checkIfRepoExistsAndSpecificMVRInRepo(mvrSubject)
        if(driversMVROrder != null){
          //if the external service does not need to be queried for the status
          if(driversMVROrder.getOrderStatus() <> typekey.MVRStatus.TC_ORDERED){
            responseHash.put(mvrSubject, driversMVROrder.getOrderStatus())  
          }
          else{
            externallyOrdered.add(new SubjectWithProviderID(mvrSubject, driversMVROrder.ProviderRequestID))    
          }
        }
        //if no MVRs are found then add that Driver to the list that needs to have an MVR ordered
        //TODO-CC: add not ordered status and then set status to that instead of null
        else{
           responseHash.put(mvrSubject, null)  
        }
      }
      // saves the response from the external mvr service provider and converts it to a status and returns that
      var externalResponses = externalMVRService.getMVROrderResponse(externallyOrdered.toTypedArray())
      if(_mvrStorage <> null){
        for(subject in externalResponses.Keys){
          var internalSubject = (subject as SubjectWithProviderID).InternalSubject
          var mvrOrder = _mvrStorage.getSpecificMVRByRequestId(internalSubject.RequestID)
          var response = externalResponses.get(subject)
          var status = mapResponseToStatus(response)
          //update the outgoing hashmap
          responseHash.put(internalSubject, status)
          
          _mvrStorage.updateStatusOfMVROrder(mvrOrder, status, response)
        }
      }else{
        // TODO the case when we do not have a repositry
      }

      return responseHash
    }
  }

  override function getMVRDetails(mvrSubjects : IMVRSubject[]) : HashMap<IMVRSubject, IMVROrder> {
    using(_lock){
      var responseHash = new HashMap<IMVRSubject, IMVROrder>()
      var externallyOrdered = new HashMap<IMVRSubject, MVROrder>()
    
      for(mvrSubject in mvrSubjects){
        var driversMVROrder = checkIfRepoExistsAndSpecificMVRInRepo(mvrSubject)
        // TODO error handling - the order should be in the repository
        //don't need to go outside to get MVR from external service
        if(driversMVROrder != null and driversMVROrder.getOrderStatus() == typekey.MVRStatus.TC_RECEIVED){  //status must be ordered, not found or received in the repository
          responseHash.put(mvrSubject, driversMVROrder)  
        }
        else if(driversMVROrder.getOrderStatus() == typekey.MVRStatus.TC_READY){
          externallyOrdered.put(mvrSubject, driversMVROrder)
        }
        //if the status is TOBEORDERED  or just ORDERED then getMVRDetails should not have been called for that order
      }

      if(not externallyOrdered.Empty){
        var toOrderExternally = externallyOrdered.Keys.map(\ i -> new SubjectWithProviderID(i, externallyOrdered.get(i).ProviderRequestID))
        var externalMVRs = externalMVRService.getMVRDetails(toOrderExternally.toTypedArray())
        if(_mvrStorage <> null){
          //store received MVRs into repository
          for(subject in toOrderExternally){
            var mvr = externalMVRs.get(subject)
            var internalSubject = subject.InternalSubject
            var mvrOrder = externallyOrdered.get(internalSubject)
            //mvr status is updated in addMVRsToMVROrder
            _mvrStorage.addMVRsToMVROrder(mvrOrder, mvr)
            responseHash.put(internalSubject, mvrOrder)
          }
        }else{
          // TODO the case when we do not have a repositry
        }
      }
      return responseHash
    }
  }
  
  override function getAllExistingMVRs(mvrSearchCriteria : MVRSearchCriteria) : IMVROrder[] {
    var mvrOrders : MVROrder[]
    if(_mvrStorage <> null){
      mvrOrders = _mvrStorage.getAllReceivedMVRsByDriver(mvrSearchCriteria)
    }
    return mvrOrders
  } 
  
  private function needMVROrder(driverMVROrder : MVROrder, mvrSubject : IMVRSubject) : boolean {
    var needOrder = true
    if(driverMVROrder != null and mvrSubject.isMVRValid(driverMVROrder)){
      needOrder = false 
    }
    return needOrder
  }
  
  //should be made private again after demo
  private function checkIfRepoExistsAndSpecificMVRInRepo(mvrSubject : IMVRSubject) : MVROrder {
    var mvrOrder : MVROrder
    if(_mvrStorage <> null){
      mvrOrder = _mvrStorage.getSpecificMVRByRequestId(mvrSubject.RequestID)
    }
    return mvrOrder
  }
    
  private function checkIfRepoExistsAndMVRInRepo(mvrSubject : IMVRSubject) : MVROrder {
    var mvrOrder : MVROrder
    if(_mvrStorage <> null){
      var searchCriteria = mvrSubject.getSearchCriteria()
      mvrOrder = _mvrStorage.getLatestMVRByDriver(searchCriteria as MVRSearchCriteria)
    }
    return mvrOrder
  }
  
  private function generateInternalID(providerRequestID : String) : String{
    var internalRequestID = providerRequestID
    var mvrOrder = _mvrStorage.getSpecificMVRByRequestId(providerRequestID)
    var counter = 0
    while(mvrOrder <> null){
      internalRequestID =  providerRequestID + "_" + counter
      mvrOrder = _mvrStorage.getSpecificMVRByRequestId(internalRequestID)
      counter++
    }
      
    return internalRequestID 
  }
  
  private function mapResponseToStatus(response: MVRResponse) : MVRStatus{
    var status : MVRStatus
    switch(response){
      case typekey.MVRResponse.TC_CLEAR:
      case typekey.MVRResponse.TC_HIT:
      case typekey.MVRResponse.TC_NOTFOUND: 
        status = MVRStatus.TC_READY
        break
        
      case typekey.MVRResponse.TC_PEND:
      case typekey.MVRResponse.TC_DELAY:
        status = MVRStatus.TC_ORDERED
        break       
    }
    return status
  }
  
  
  //The following two methods can be used to change the delegates that MVRService uses on the fly.  This means a repository or external MVR Service can be 
  //used and then another one set and used. ie. use external service plugin to one provider and then change provider and call that new provider without taking server down
  
  function setExternalMVRService(externalService : IMotorVehicleRecordPlugin){
    externalMVRService = externalService 
  }

}
