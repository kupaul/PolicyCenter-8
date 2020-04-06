package gw.lob.pa.mvr.crossboundary
uses gw.api.motorvehiclerecord.IMVROrder
uses java.util.Date
uses gw.api.motorvehiclerecord.IMVRData
uses java.util.ArrayList

@Export
class SimpleMVROrder implements IMVROrder {

  construct() {
    resetMVRData()
  }

  var _internalRequestID: String as InternalRequestID
  var _mvrData: List<IMVRData>
  var _orderStatus: MVRStatus as OrderStatus
  var _providerResponse: MVRResponse as MVRResponse
  var _providerRequestID: String as ProviderRequestID
  var _reportRequestedDate: Date as ReportRequestedDate
  var _statusDate: Date as StatusDate
  
    
  override property get MVRData() : IMVRData[] {
    return _mvrData.toTypedArray()
  }
  
  final function resetMVRData(){
    _mvrData = new ArrayList<IMVRData>()  
  }
  
  function addMVRData(mvr : IMVRData){
    _mvrData.add(mvr)
    if(not (mvr typeis KeyableBean)){ //only checks that it is not an entity because the framework already sets this AND cannot set a FK to a POGO or POJO
      mvr.MVROrderParent = this
    }
  }
  
}
