package gw.lob.pa.mvr

uses java.util.Map
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.api.motorvehiclerecord.IMVROrder

@Export
interface IMVRService {
  function orderMVR(policyDriverMVRs : IMVRSubject[]) : Map<IMVRSubject, String>
  function getMVROrderStatus(policyDriverMVRs : IMVRSubject[]) : Map<IMVRSubject, MVRStatus>
  function getMVRDetails(policyDriverMVRs : IMVRSubject[]) : Map<IMVRSubject, IMVROrder>
  function getAllExistingMVRs(mvrSearchCriteria : MVRSearchCriteria) : IMVROrder[]
}
