package gw.pcf

@Export
class WorkflowHelper {

 /**
  * Gets the immediate workflow subtype that is used as mode to display the Modal section in WorkflowUI -
  * WorkflowSearch, WorkflowDetailDV and WorkflowDV.
  * 
  * @return the immediate subtype of Workflow entity that is assignable by the selected workflow type.
  */
  public static function getWorkflowSubtype(workflow : typekey.Workflow) : String {
    if(workflow == null)
      return "default";
    // get the type of the workflow 
    var wfType = gw.lang.reflect.TypeSystem.getByRelativeName(workflow.DisplayName)
    return entity.Workflow.Type.ImmediateSubtypes.firstWhere(\ t -> t.isAssignableFrom(wfType)).RelativeName
  } 

}
