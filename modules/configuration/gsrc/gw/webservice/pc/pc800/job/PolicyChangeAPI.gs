package gw.webservice.pc.pc800.job

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.policy.IPolicyPlugin
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil

uses java.util.Date
uses gw.xml.ws.annotation.WsiPermissions

@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/job/PolicyChangeAPI" )
@Export
class PolicyChangeAPI {

  /**
   * Starts a Policy Change on the policy with the given policy number effective at the 
   * given date. The policy change will start and wait in draft mode for the user to 
   * quote and finish it manually.
   * 
   * @param policyNumber The policy number for which to start a change. Must not be null.
   * @param effectiveDate Effective date of the policy change. Must not be null.
   * @return The job number of the newly created Policy Change as a String.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(EntityStateException, "if a Policy Change cannot be started for the policy")
  @Param("policyNumber", "The policy number for which to start a change. Must not be null.")
  @Param("effectiveDate", "Effective date of the policy change. Must not be null.")
  @WsiPermissions({SystemPermissionType.TC_CREATEPOLCHANGE})
  @Returns("The job number of the newly created Policy Change as a String.")
  function startManualPolicyChange(policyNumber: String, effectiveDate: Date) : String {
    SOAPUtil.require(policyNumber, "policyNumber")
    SOAPUtil.require(effectiveDate, "effectiveDate")
    
    var policy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    if (policy == null) {
      throw new BadIdentifierException(displaykey.PolicyChangeAPI.Error.InvalidPolicyNumber(policyNumber))
    }
    
    var error = Plugins.get(IPolicyPlugin).canStartPolicyChange(policy, effectiveDate)
    if (error != null) {
      throw new EntityStateException(displaykey.PolicyChangeAPI.Error.CannotStart(error))
    }

    var policyChange : PolicyChange
    Transaction.runWithNewBundle( \ bundle -> {
      policyChange = new PolicyChange(bundle)
      policyChange.startJob(policy, effectiveDate)
    })
    
    return policyChange.JobNumber
  }
  
  /**
   * Starts a Policy Change on the policy with the given policy number effective at the 
   * given date. The policy change will try to automatically quote and bind. Should any 
   * error occur during this process the user then can go and complete the policy change
   * manually. Customers can modify the default behaviour by changing the implementation 
   * of PolicyChangeProcess.startAutomatic(). An actual workflow can be started in this 
   * method to control the job's progress.
   * 
   * @param policyNumber The policy number for which to start a change. Must not be null.
   * @param effectiveDate Effective date of the policy change. Must not be null.
   * @return The job number of the newly created Policy Change as a String.
   */  
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(EntityStateException, "if a Policy Change cannot be started for the policy")
  @Param("policyNumber", "The policy number for which to start a change. Must not be null.")
  @Param("effectiveDate", "Effective date of the policy change. Must not be null.")
  @WsiPermissions({SystemPermissionType.TC_CREATEPOLCHANGE})
  @Returns("The job number of the newly created Policy Change as a String.")
  function startAutomaticPolicyChange(policyNumber: String, effectiveDate: Date) : String {
    SOAPUtil.require(policyNumber, "policyNumber")
    SOAPUtil.require(effectiveDate, "effectiveDate")
    
    var policy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    if (policy == null) {
      throw new BadIdentifierException(displaykey.PolicyChangeAPI.Error.InvalidPolicyNumber(policyNumber))
    }
    
    var error = Plugins.get(IPolicyPlugin).canStartPolicyChange(policy, effectiveDate)
    if (error != null) {
      throw new EntityStateException(displaykey.PolicyChangeAPI.Error.CannotStart(error))
    }

    var bundle : Bundle
    Transaction.runWithNewBundle( \ b -> { bundle = b } )
    var change_daemon = findUserByCredential("policychange_daemon")

    try {
      var policyChange = new PolicyChange(bundle)
      policyChange.startAutomatic(policy, effectiveDate, change_daemon)
      return policyChange.JobNumber
    } finally {
      bundle.commit()
    }
  }
  
  protected function findUserByCredential(userName : String) : User {
    var q = Query.make(User)
    q.join("Credential").compare("UserName", Equals, userName)
    var results = q.select()
    return results.AtMostOneRow  
  }
}
