uses gw.cmdline.util.WorkflowToolsArgs
uses gw.lang.cli.CommandLineAccess
uses gw.api.soap.GWAuthenticationHandler
uses java.lang.Integer
uses java.net.URL
uses gw.wsi.pl.workflowapi.WorkflowAPI
uses gw.wsi.pl.workflowapi.faults.BadIdentifierException
uses gw.wsi.pl.workflowapi.faults.EntityStateException
uses gw.wsi.pl.workflowapi.faults.IllegalArgumentException


print( "Running ${CommandLineAccess.getCurrentProgram().Name}" )

//Initialize the args class for this program
CommandLineAccess.initialize( WorkflowToolsArgs )

//New up a maintenance soap service
var config = new gw.xml.ws.WsdlConfig()
config.ServerOverrideUrl = new URL(WorkflowToolsArgs.Server + "/ws/gw/wsi/pl/WorkflowAPI").toURI()
config.Guidewire.Authentication.Username = WorkflowToolsArgs.User
config.Guidewire.Authentication.Password = WorkflowToolsArgs.Password
config.CallTimeout = Integer.MAX_VALUE
var api = new WorkflowAPI( config );
print( "Connecting as ${config.Guidewire.Authentication.Username} to URL ${config.ServerOverrideUrl}" )

try {
  if(WorkflowToolsArgs.ResumeAll) {
    api.resumeAllWorkflows()
  } else if(WorkflowToolsArgs.Resume != null) {
    api.resumeWorkflow( WorkflowToolsArgs.Resume )
  } else if(WorkflowToolsArgs.Complete != null) {
    api.complete( WorkflowToolsArgs.Complete )
  } else if(WorkflowToolsArgs.Suspend != null) {
    api.suspend( WorkflowToolsArgs.Suspend )
  } else {
    CommandLineAccess.showHelp( WorkflowToolsArgs )
  }
} catch (e : BadIdentifierException) {
  print("BadId: " + e.Message)
} catch (e : EntityStateException) {
  print("Workflow invalid state: " + e.Message)
} catch (e : IllegalArgumentException) {
  print("Required field: " + e.Message)
} catch (e) { 
  e.printStackTrace()
}
print("done")