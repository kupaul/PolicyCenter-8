package gw.api.databuilder.pa
uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria

@Export
class PAMVROrderBuilder extends DataBuilder<MVROrder, PAMVROrderBuilder> {
  construct() {
    super(MVROrder)
    withInternalRequestID("GuidewireTest")
    withReportRequestedDate(Date.Today)  
    withOrderStatus(typekey.MVRStatus.TC_RECEIVED)   
  }
  
  final function withDefault1() : PAMVROrderBuilder{
    withInternalRequestID("GuidewireTest1")
    addMVR(new PAMVRBuilder().withDefault1())
    return this
  }
  
  final function withDefault2() : PAMVROrderBuilder{
    withInternalRequestID("GuidewireTest2")
    addMVR(new PAMVRBuilder().withDefault2())
    return this
  }  
 
  final function withDefault3() : PAMVROrderBuilder{
    withInternalRequestID("GuidewireTest3")
    addMVR(new PAMVRBuilder().withDefault3())
    return this
  }  
  
  final function withSC(mvrSC : MVRSearchCriteria) : PAMVROrderBuilder {
    var mSC = mvrSC  
    withLicenseNumberSC(mSC.LicenseNumber)
    withLicenseStateSC(mSC.LicenseState)
    withFirstNameSC(mSC.FirstName)
    withLastNameSC(mSC.LastName)
    withMiddleNameSC(mSC.MiddleName)
    withDateOfBirthSC(mSC.DateOfBirth)    
    return this
  }
  
  final function withLicenseNumberSC(licenseNumber: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("LicenseNumberSC"), licenseNumber)
    return this
  }
  
  final function withLicenseStateSC(licenseState: State) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("LicenseStateSC"), licenseState)
    return this
  }
  
  final function withFirstNameSC(firstName: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("FirstNameSC"), firstName)
    return this
  }
  
  final function withLastNameSC(lastName: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("LastNameSC"), lastName)
    return this
  }
  
  final function withMiddleNameSC(middleName: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("MiddleNameSC"), middleName)
    return this
  }
  
  final function withDateOfBirthSC(dateOfBirth: Date) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("DateOfBirthSC"), dateOfBirth)
    return this
  }
    final function withInternalRequestID(requestID: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("InternalRequestID"), requestID)
    return this
  }
 
  final function withOrderStatus(orderStatus: typekey.MVRStatus) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("OrderStatus"), orderStatus)
    return this
  }
 
  final function withStatusDate(statusDate: Date) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("StatusDate"), statusDate)
    return this
  }    

  final function withReportRequestedDate(reportRequestedDate: java.util.Date) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("ReportRequestedDate"), reportRequestedDate)
    return this
  }
  
  final function withProviderRequestID(providerRequestID: String) : PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("ProviderRequestID"), providerRequestID)
    return this
  }

  function withMVRResponse(mvrResponse: typekey.MVRResponse): PAMVROrderBuilder {
    set(MVROrder.Type.TypeInfo.getProperty("MVRResponse"), mvrResponse)
    return this  
  }
       
  function addMVR(mvrB : PAMVRBuilder) : PAMVROrderBuilder{
    addArrayElement(MVROrder.Type.TypeInfo.getProperty("MVREntities"), mvrB)
    return this
  }  
  
  function withNoMVR() : PAMVROrderBuilder{
    set(MVROrder.Type.TypeInfo.getProperty("MVRs"), null)
    return this
  }       
}
