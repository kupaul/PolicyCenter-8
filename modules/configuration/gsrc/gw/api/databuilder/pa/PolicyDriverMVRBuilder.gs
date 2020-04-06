package gw.api.databuilder.pa

uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses gw.api.databuilder.BuilderContext

@Export
class PolicyDriverMVRBuilder extends DataBuilder<PolicyDriverMVR, PolicyDriverMVRBuilder>{

  construct() {
    super(PolicyDriverMVR)
    withNumberOfAccidents(0)
    withNumberOfViolations(0)
    withOrderStatus(MVRStatus.TC_ORDERED)
    withInternalRequestId("12345")
    withStatusDate(Date.Today)
  }

  final function withNumberOfAccidents(numberOfAccidents : int) : PolicyDriverMVRBuilder {
    set(PolicyDriverMVR.Type.TypeInfo.getProperty("NumberOfAccidents"), numberOfAccidents)
    return this
  }

  final function withNumberOfViolations(numberOfViolations : int) : PolicyDriverMVRBuilder {
    set(PolicyDriverMVR.Type.TypeInfo.getProperty("NumberOfViolations"), numberOfViolations)
    return this
  }  
  
  final function withOrderStatus(orderStatus : MVRStatus) : PolicyDriverMVRBuilder {
    set(PolicyDriverMVR.Type.TypeInfo.getProperty("OrderStatus"), orderStatus)
    return this
  }
  
  final function withInternalRequestId(requestId : String) : PolicyDriverMVRBuilder {
    set(PolicyDriverMVR.Type.TypeInfo.getProperty("InternalRequestId"), requestId)
    return this
  } 
  
  final function withStatusDate(statusDate : Date) : PolicyDriverMVRBuilder {
    set(PolicyDriverMVR.Type.TypeInfo.getProperty("StatusDate"), statusDate)
    return this
  }
  
  override function createBean(context: BuilderContext): PolicyDriverMVR{
    var driverMVR = super.createBean(context)
    var driver = context.ParentBean as PolicyDriver
    var line = driver.Branch.PersonalAutoLine
    line.addToPolicyDriverMVRs(driverMVR)

    return driverMVR
  }
  
}
