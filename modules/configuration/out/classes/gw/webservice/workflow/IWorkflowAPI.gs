package gw.webservice.workflow

uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.WSRunlevel
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.workflow.WorkflowAPIImpl
uses gw.api.webservice.exception.EntityStateException
uses java.lang.SuppressWarnings

/**
 * External API for performing operations on workflows.
 */
@RpcWebService(WSRunlevel.NODAEMONS)
@Deprecated("Use WS-I webservice gw.wsi.pl.WorkflowAPI instead.")
@SuppressWarnings("deprecation")
@Export
class IWorkflowAPI  {

   
  /**
   * Sets the state of the workflow with public ID <code>workflowID</code>
   * to WorkflowState#TC_COMPLETED.
   *
   * @param workflowID the public id of the workflow
   */
  @Throws(SOAPException, "")
  @Throws(BadIdentifierException, "If the workflow id did not match a valid workflow.")
  @Throws(RequiredFieldException, "If the workflow id is null.")
  function complete(workflowID : String){
    new WorkflowAPIImpl().complete( workflowID )
  }
  
  
  /**   
   * Suspends the workflow with public ID <code>workflowID</code>.
   *
   * @param workflowID the public id of the workflow
   */
  @Throws(SOAPException, "")
  @Throws(BadIdentifierException, "If the workflow id did not match a valid workflow.")
  @Throws(RequiredFieldException, "If the workflow id is null")
  function suspend(workflowID : String) {
    new WorkflowAPIImpl().suspend( workflowID )
  }
  
  /**
   * Resumes the workflow with public ID <code>workflowID</code>.
   *
   * The workflow engine will subsequently attempt to advance the workflow
   * to its next step. If an error occurs again, the error
   * will be logged and the workflow's state set to WorkflowState#TC_ERROR.
   *
   * @param workflowID the public id of the workflow
   */
   
  @Throws(SOAPException, "")
  @Throws(BadIdentifierException, "If the workflow id did not match a valid workflow.")
  @Throws(RequiredFieldException, "If the workflow id is null.")
  @Throws(EntityStateException, "If the workflow is not currently in the error or suspended state.")
  public function resumeWorkflow(workflowID : String) {
    new WorkflowAPIImpl().resumeWorkflow( workflowID )
  }
  
  /**
   * Resumes all workflows in the state
   * WorkflowState#TC_ERROR or WorkflowState#TC_SUSPENDED.
   *
   * The workflow engine will subsequently attempt to advance these workflows
   * to their next steps. For each one, if an error occurs again, the error
   * will be logged and the workflow's state set to WorkflowState#TC_ERROR.
   */
  @Throws(SOAPException, "")
  public function resumeAllWorkflows() {
    new WorkflowAPIImpl().resumeAllWorkflows()
  }
   
  /**
   * Invokes the triggerKey on the current step of the specified workflow causing
   * the workflow to advance to the next step.
   * If a null or invalid workflow ID is passed in, an exception will be thrown.  In
   * addition, if the triggerkey is null or the trigger is not available, an
   * exception will be thrown.
   *  
   * @param workflowID The ID of the workflow
   * @param triggerKey A workflow trigger key off the current workflow
   */  
  @Throws(SOAPException, "If no workspace matches the given workflow id or the trigger is invalid or not available.")
  @Throws(RequiredFieldException, "If the trigger key or workflow id is null.")
  function invokeTrigger(workflowID : String, triggerKey : WorkflowTriggerKey){
    new WorkflowAPIImpl().invokeTrigger( workflowID, triggerKey )
  }

  /**
   * True if the given trigger is available in the Workflow; i.e. if it is OK to pass the
   * trigger ID to the invokeTrigger method.
   *
   * @param workflowID The ID of the workflow
   * @param triggerKey A workflow trigger key off the current workflow
   */  
  @Throws(SOAPException, "If no workspace matches the given workflow id.")
  @Throws(RequiredFieldException, "If the trigger key or workflow id is null.")
  function isTriggerAvailable(workflowID : String, triggerKey : WorkflowTriggerKey) : boolean{
    if (triggerKey == null){
      throw new RequiredFieldException("The trigger key may not be null.")
    }    
    if (workflowID == null){
      throw new RequiredFieldException("The workflow id may not be null.")
    }
    var wf : Workflow = getWorkflowByIDOrThrow( workflowID )
    return wf.isTriggerAvailable( triggerKey )
  }  
  
  //----------------------------------------------------------------- private helper methods
  
  /**
   * Get a workflow by its id or throw a SOAPException.
   */
  private function getWorkflowByIDOrThrow(workflowID : String ) : Workflow {
    var workflowQuery = find ( w in Workflow where w.PublicID == workflowID)
    var workflow =  workflowQuery.getAtMostOneRow()
    if (workflow == null){
      throw new SOAPException("No workflow matches the given workflow id: " + workflowID)
    }
    return workflow
  }
  
  /*
  private function logTrace(msg :String){
    var logger = PLLoggerCategory.SERVER_WORKFLOW
    if (logger.isTraceEnabled()){
      logger.trace( msg , null)
    }    
  }
  */
}
