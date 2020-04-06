package gw.lob.pa.mvr
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.api.motorvehiclerecord.IMVRSearchCriteria
uses gw.api.motorvehiclerecord.IMVROrder

@Export
class SubjectWithProviderID implements IMVRSubject{
  var _internalSubject: IMVRSubject
  var _providerID: String

  construct(intSubject: IMVRSubject, providerID: String) {
    _internalSubject = intSubject
    _providerID = providerID
  }

  override property get RequestID() : String {
    return _providerID
  }

  override property get SearchCriteria() : IMVRSearchCriteria {
    return _internalSubject.SearchCriteria
  }

  override function isMVRValid(mvrOrder: IMVROrder) : boolean {
    return _internalSubject.isMVRValid(mvrOrder)
  }
  
  property get InternalSubject(): IMVRSubject{
    return _internalSubject
  }

}
