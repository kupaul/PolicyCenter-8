package gw.job
uses java.util.Date

@Export
class RenewalProcessTimeoutHandler {
  
  public static var STANDARD_INSTANCE : RenewalProcessTimeoutHandler = new RenewalProcessTimeoutHandler()
  
  function startAutomatedRenewal(branch : PolicyPeriod) {
    branch.startWorkflowAsynchronously("StartRenewalWF")  
  }
  
  function scheduleTimeoutOperation(branch : PolicyPeriod, timeoutDate : Date, 
        callbackName : String, isRenewalOffer : boolean) {
    var workflow = branch.createActiveWorkflow( "RenewalTimeoutWF" ) as RenewalTimeoutWF
    workflow.FunctionToCall = callbackName
    workflow.WakeupTime = timeoutDate
    workflow.RenewalOffer = isRenewalOffer
    workflow.start()
  }

}
