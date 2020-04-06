
package gw.lob.pa.mvr
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.api.motorvehiclerecord.IMVRData
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria
uses gw.transaction.Transaction
uses gw.api.database.Query
uses gw.entity.IArrayPropertyInfo
uses gw.entity.ILinkPropertyInfo
uses java.util.Date

@Export
class MVRPersistenceHelper{
  static var instance : MVRPersistenceHelper

  private construct() {

  }

  static function getInstance() : MVRPersistenceHelper {
    if(instance == null){
      instance = new MVRPersistenceHelper()
    }
    return instance
  }

  private function copyDataElementsFromSourceToTarget(sourceBean : Object, targetBean: Object) {
     for (aProp in (typeof targetBean).TypeInfo.Properties) {
       if ( aProp.Hidden == false && aProp.Writable == true && aProp.Abstract == false && !(aProp typeis IArrayPropertyInfo) && !(aProp typeis ILinkPropertyInfo)  && aProp.Name != "PublicID") {

        if((typeof sourceBean).TypeInfo.Properties*.Name.contains(aProp.Name)){
          targetBean[aProp.Name] = sourceBean[aProp.Name]
        }
      }
    }
  }

  function getSpecificMVRByRequestId(requestId : String) : MVROrder{
    if (requestId == null) {
      return null
    }

    return performOneMvrSearch(requestId)
  }

  function getLatestMVRByDriver(criteria : MVRSearchCriteria) : MVROrder{
    if (criteria == null) {
      return null
    }

    var foundMvrOrders = performMultiMvrSearch(criteria)
    if(foundMvrOrders.Count > 1){
      foundMvrOrders = foundMvrOrders.orderByDescending(\ o -> o.ReportRequestedDate).toTypedArray()
    }
    return foundMvrOrders.first()
  }

  function getAllReceivedMVRsByDriver(criteria : MVRSearchCriteria) : MVROrder[]{
    if (criteria == null) {
      return null
    }

    return performMultiMvrSearch(criteria)
  }

  private function performOneMvrSearch(requestId : String) : MVROrder{

    var  mvrQuery =  Query.make(MVROrder)
    mvrQuery.compare( "InternalRequestID", Equals, requestId )

    // if "getLatestOnly" is true, filter to get only the latest ones.
    // group by requestID, pick max(ReportDate)

    var queryResults = mvrQuery.select()
    var foundMvrOrder = queryResults.AtMostOneRow

    return foundMvrOrder
  }

  private function performMultiMvrSearch(mvrSearchCriteria : MVRSearchCriteria) : MVROrder[]{

    var  mvrQuery =  Query.make(MVROrder)
    mvrQuery.compare( "DateOfBirthSC", Equals, mvrSearchCriteria.DateOfBirth )
    mvrQuery.compare( "FirstNameSC", Equals, mvrSearchCriteria.FirstName )
    mvrQuery.compare( "LastNameSC", Equals, mvrSearchCriteria.LastName )
    mvrQuery.compare( "LicenseNumberSC", Equals, mvrSearchCriteria.LicenseNumber )
    mvrQuery.compare( "LicenseStateSC", Equals, mvrSearchCriteria.LicenseState )
    mvrQuery.compare( "MiddleNameSC", Equals, mvrSearchCriteria.MiddleName )

    // if "getLatestOnly" is true, filter to get only the latest ones.
    // group by requestID, pick max(ReportDate)

    var queryResults = mvrQuery.select()
    var foundMvrOrders = queryResults.toTypedArray()

    return foundMvrOrders
  }

  function createNewOrder(mvrSubject: IMVRSubject, internalRequestID: String, providerRequestID: String): String{
    var publicID: String

    if(mvrSubject != null and internalRequestID != null){
      //check for duplicates
      // TODO - error handling - verify if it is already in the repository
      var foundMVR = performOneMvrSearch(internalRequestID)
      if(foundMVR <> null){
        publicID = foundMVR.PublicID
      }
      else{
        var mvrOrder: MVROrder
        Transaction.runWithNewBundle(\ bundle -> {
          mvrOrder = new MVROrder(bundle)
          mvrOrder.ReportRequestedDate = Date.CurrentDate
          //mvr.setDataAndSC(policyDriverMVR.PolicyDriver.MVRSearchCriteria)
          mvrOrder.populateSearchCriteria(mvrSubject.getSearchCriteria() as MVRSearchCriteria)
          mvrOrder.InternalRequestID = internalRequestID
          mvrOrder.ProviderRequestID = providerRequestID
          mvrOrder.OrderStatus = MVRStatus.TC_ORDERED
          mvrOrder.StatusDate = Date.CurrentDate

        })

        publicID = mvrOrder.PublicID
      }
    }

    return publicID
  }

  function addMVRsToMVROrder(orderToUpdate : MVROrder, mvrData : IMVRData[]) {
    if (orderToUpdate <> null) {
      Transaction.runWithNewBundle(\ bundle -> {
        //  Need to update fields from the mvrToStore on to the existingMVR.  First delete the incidents, then copy them in the next step
        bundle.add(orderToUpdate)
        orderToUpdate.OrderStatus = MVRStatus.TC_RECEIVED
        orderToUpdate.StatusDate = Date.CurrentDate

        for (sourceMVR in mvrData) {
          var copiedMVR = new MVR()
          copyDataElementsFromSourceToTarget(sourceMVR, copiedMVR)
          for (sourceIncident in sourceMVR.Incidents) {
            var copiedIncident = new MVRIncident()
            copyDataElementsFromSourceToTarget(sourceIncident, copiedIncident)
            copiedMVR.addToIncidentEntities( copiedIncident)
          }
          for (sourceLicense in sourceMVR.Licenses) {
            var copiedLicense = new MVRLicense()
            copyDataElementsFromSourceToTarget(sourceLicense, copiedLicense)
            copiedMVR.addToLicenseEntities(copiedLicense)
          }
          orderToUpdate.addToMVREntities(copiedMVR)
        }
      })
    }
  }

  function updateStatusOfMVROrder(mvrOrder : MVROrder, status : MVRStatus, response : MVRResponse) {
    if (mvrOrder <> null) {
      Transaction.runWithNewBundle(\ bundle -> {
        //  Need to update fields from the mvrToStore on to the existingMVR.
        bundle.add(mvrOrder)
        mvrOrder.MVRResponse = response
        //if there is any change in the status then update the order
        if(status <> mvrOrder.OrderStatus){
          mvrOrder.OrderStatus = status
          mvrOrder.StatusDate = Date.CurrentDate
        }
      })
    }
  }

  function resetMVRs(){
    var bundle = Transaction.getCurrent()
    var mvrOrderQuery = Query.make(MVROrder)
    var allmvrOrders = mvrOrderQuery.select().toTypedArray()
    allmvrOrders.each(\ m -> {
      var order = bundle.add(m)
      order.remove()
    })
  }
}