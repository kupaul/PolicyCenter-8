package gw.lob.pa
uses gw.lob.pa.mvr.PAMVRUtil

uses java.lang.Thread
uses gw.api.system.PCLoggerCategory

enhancement ProcessMVRsWFEnhancement : entity.ProcessMVRsWF {

  function setupForMVRRequest(policyPeriod: PolicyPeriod, allSelectedDrivers: PolicyDriver[]){
    PCLoggerCategory.INTEGRATION.info("setupForMVRRequest")
    this.PolicyPeriod = policyPeriod
    var selectedDrivers = allSelectedDrivers.where(\ d -> not d.DoNotOrderMVR)
    PAMVRUtil.initMVRRequest(selectedDrivers)
    this.start()
    PCLoggerCategory.INTEGRATION.info("after setupForMVRRequest")
  }

  /*
   * Called before the workflow is started to set the drivers to order MVRs for
   */
  function initiateMVRRequest(synchronousWait: boolean){
    PCLoggerCategory.INTEGRATION.info("initiateMVRRequest")

    if(this.CurrentStep == "BeforeOrder"){
      this.invokeTrigger(typekey.WorkflowTriggerKey.TC_ORDERMVRS, true)
    }
    
    if(this.CurrentStep == "BeforeShortWait"){
      this.invokeTrigger(typekey.WorkflowTriggerKey.TC_WAITFORMVRS, synchronousWait)
    }

    PCLoggerCategory.INTEGRATION.info("end initiateMVRRequest")
  }

  /*
   * Called when workflow is started to order MVRs for the selected drivers
   */
  function orderMVRs(){
    PCLoggerCategory.INTEGRATION.info("orderMVRs")
    
    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
    var selectedDrivers = allDrivers.where(\ d -> d.PolicyDriverMVR != null and d.PolicyDriverMVR.OrderStatus == MVRStatus.TC_TOBEORDERED)
    
    PAMVRUtil.orderMVRs(selectedDrivers)

    PCLoggerCategory.INTEGRATION.info("end orderMVRs")
  }

  /*
   * Called on the workflow state "ShortWait", the first state of the workflow
   * Waits a few seconds before thefirst status check
   */
  function shortWait(){
    PCLoggerCategory.INTEGRATION.info("shortWait")
    Thread.sleep(3000)
    PCLoggerCategory.INTEGRATION.info("end shortWait")
  }

  /*
   * Called on the workflow transition to state "GetMVRData"
   * Checks the status of the orders in the database and returs true if any with status "READY"
   */
  function anyMVRsReady(): boolean{
    PCLoggerCategory.INTEGRATION.info("anyMVRsReady")

    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
    var numberOfReceivedOrders = allDrivers.countWhere(\ p -> p.PolicyDriverMVR.OrderStatus == MVRStatus.TC_READY)

    var someReceived = numberOfReceivedOrders > 0
    PCLoggerCategory.INTEGRATION.info("end anyMVRsReady:" + someReceived)

    return someReceived
  }

  /*
   * Called on the workflow transition from state "GetMVRData"
   * Checks the status of the orders in the database and returs true if none with status "ORDERED"
   */
  function receivedAllMVRs(): boolean{
    PCLoggerCategory.INTEGRATION.info("receivedAllMVRs")

    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
    var numberOfUnprocessedOrders = allDrivers.countWhere(\ p -> p.PolicyDriverMVR.OrderStatus == MVRStatus.TC_ORDERED)

    var allReceived = numberOfUnprocessedOrders == 0
    PCLoggerCategory.INTEGRATION.info("end receivedAllMVRs:" + allReceived)

    return allReceived
  }

  /*
   * Called from the workflow state "CheckMVRStatus"
   */
  function checkMVRStatus(){
    PCLoggerCategory.INTEGRATION.info("checkMVRStatus")

    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
  
    var driversWithOrders = allDrivers.where(\ d -> d.PolicyDriverMVR.OrderStatus == MVRStatus.TC_ORDERED).map(\ d -> d.PolicyDriverMVR)
    PCLoggerCategory.INTEGRATION.info("orders=" + driversWithOrders.Count)
    
    PAMVRUtil.checkMVRStatus(driversWithOrders)
    
    PCLoggerCategory.INTEGRATION.info("end checkMVRStatus")
  }

  /*
   * Called from the workflow state "GetMVRData"
   */
  function getMVRData(){
    PCLoggerCategory.INTEGRATION.info("getMVRData")

    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
    var driversWithMVRs = allDrivers.where(\ p -> p.PolicyDriverMVR.OrderStatus == MVRStatus.TC_READY).map(\ d -> d.PolicyDriverMVR)
    PCLoggerCategory.INTEGRATION.info("MVRs=" + driversWithMVRs.Count)
    
    PAMVRUtil.getMVRData(driversWithMVRs)

    PCLoggerCategory.INTEGRATION.info("end getMVRData")
  }

  /*
   * Called from the workflow state "CreateActivity"
   * Sets the necessary attributes on the activity object created in this step
   */
  function setupActivity(activity: Activity){
    var allDrivers = this.PolicyPeriod.PersonalAutoLine.PolicyDrivers
    var driversWithMVRs = allDrivers.where(\ p -> p.PolicyDriverMVR.OrderStatus == MVRStatus.TC_RECEIVED).map(\ d -> d.PolicyDriverMVR)
    var allClear = PAMVRUtil.checkAllClear(driversWithMVRs)
    var subjectSuffix : String
    var descriptionSuffix: String
    if(allClear){
      subjectSuffix = displaykey.Web.PersonalAuto.MotorVehicleRecord.Clear
      descriptionSuffix = ""
    }
    else{
      subjectSuffix = displaykey.Web.PersonalAuto.MotorVehicleRecord.NotClear
      descriptionSuffix = displaykey.Web.PersonalAuto.MotorVehicleRecord.ReviewRiskAnalysisPage
    }
  
    activity.assignToCreator(this)
    activity.Account = this.PolicyPeriod.Policy.Account
    activity.setFieldValue("Job", this.Job)
    activity.Subject = displaykey.Web.PersonalAuto.MotorVehicleRecord.MVRsReceived + subjectSuffix
    activity.Description = displaykey.Web.PersonalAuto.MotorVehicleRecord.MVRsReceived + descriptionSuffix
    PCLoggerCategory.INTEGRATION.info("Activity Created:  " + activity)
  }
  
  /*
   * Go to the end of the workflow verifying the pending MVRs without waiting.
   * Do not call it from the workflow
   */
  function cancelFromOutsideWF(): boolean{
    var cancellable = false
    
    var safety = 0 
    var safetyLimit = 100 //if it takes more than ten seconds the cancel action is aborted
    var milliSecondWait = 100 //sleep an arbitrary amount of time to see if the WF can be cancelled

    while(this.CurrentStep <> "BeforeOrder" and this.CurrentStep <> "Wait" and safety < safetyLimit){
      Thread.sleep(milliSecondWait)
      safety++
    }
    
    cancellable = this.CurrentStep == "BeforeOrder" or this.CurrentStep == "Wait"
    if(cancellable){
      this.invokeTrigger(typekey.WorkflowTriggerKey.TC_CANCEL)
    }
    
    return cancellable
  }
}
