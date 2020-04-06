package gw.api.databuilder
uses java.util.Date
uses gw.api.databuilder.wc.WCSubmissionBuilder

@Export
public class TimeoutWFBuilder extends DataBuilder<TimeoutWF, TimeoutWFBuilder> {  
  construct() {
    super(TimeoutWF)
    withTimeoutTime(Date.Today)
    withHandler(WorkflowHandler.TC_INTERNAL)
    withState(WorkflowState.TC_ACTIVE)
    withPolicyPeriod(new WCSubmissionBuilder().create())
    withFunctionToCall("guaranteedToFail")
    withWakeupTime(Date.Today)
    withProcessVersion(1)
    withCurrentAction(WorkflowActionType.TC_FINISH)
    withCurrentStep("Start")
    withEnteredStep(Date.Today)
  }

  final function withTimeoutTime(time : Date) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("TimeoutTime"), time)
    return this
  }

  final function withHandler(handler : WorkflowHandler) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("Handler"), handler)
    return this
  }

  final function withState(state : WorkflowState) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("State"), state)
    return this
  }

  final function withPolicyPeriod(period : PolicyPeriod) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("PolicyPeriod"), period)
    return this
  }

  final function withFunctionToCall(functionToCall : String) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("FunctionToCall"), functionToCall)
    return this
  }

  final function withWakeupTime(time : Date) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("WakeupTime"), time)
    return this
  }

  final function withProcessVersion(version : int) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("ProcessVersion"), version)
    return this
  }

  final function withCurrentAction(currentAction : WorkflowActionType) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("CurrentAction"), currentAction)
    return this
  }

  final function withCurrentStep(currentStep : String) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("CurrentStep"), currentStep)
    return this
  }

  final function withEnteredStep(enteredStep : Date) : TimeoutWFBuilder {
    set(TimeoutWF.Type.TypeInfo.getProperty("EnteredStep"), enteredStep)
    return this
  }
}