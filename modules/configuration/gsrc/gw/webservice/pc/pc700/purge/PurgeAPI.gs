package gw.webservice.pc.pc700.purge

uses gw.xml.ws.annotation.WsiWebService
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.SOAPUtil
uses gw.transaction.Transaction
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.xml.ws.annotation.WsiPermissions

@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/purge/PurgeAPI")
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.purge.PurgeAPI instead")
class PurgeAPI {

  /** DoNotPurge flag on policy period**/

  /**
   * Get whether policy period is restricted from being purged
   *
   * @param policyPeriodPublicID The policy period to query
   * @return whether policy period is restricted from being purged
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function isDoNotPurgePolicyPeriod(policyPeriodPublicID : String) : boolean {
    SOAPUtil.require(policyPeriodPublicID, "publicID")
    var period = findPolicyPeriod(policyPeriodPublicID)
    return period.DoNotPurge
  }

  /**
   * Restrict policy period from being purged
   *
   * @param policyPeriodPublicID The policy period to restrict from being purged
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_PURGEDISABLE})
  function setDoNotPurgePolicyPeriod(policyPeriodPublicID : String) {
    SOAPUtil.require(policyPeriodPublicID, "publicID")
    setDoNotPurgePolicyPeriod(policyPeriodPublicID, true)
  }

  /**
   * Remove restriction from policy period to be purged
   *
   * @param policyPeriodPublicID The policy period to remove purging restriction from
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_PURGEENABLE})
  function unsetDoNotPurgePolicyPeriod(policyPeriodPublicID : String) {
    SOAPUtil.require(policyPeriodPublicID, "publicID")
    setDoNotPurgePolicyPeriod(policyPeriodPublicID, false)
  }




  /** DoNotPurge flag on policy **/

  /**
   * Get whether jobs and policy periods on policy are restricted from being purged
   *
   * @param policyNumber The policy to query
   * @return whether policy is restricted from being purged
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function isDoNotPurgePolicy(policyNumber : String) : boolean {
    SOAPUtil.require(policyNumber, "policyNumber")
    var policy = findPolicyByPolicyNumber(policyNumber)
    return policy.DoNotPurge
  }

  /**
   * Restrict jobs and policy periods on policy from being purged
   *
   * @param policyNumber The policy to restrict from being purged
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_PURGEDISABLE})
  function setDoNotPurgePolicy(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotPurgePolicyByPolicyNumber(policyNumber, true)
  }

  /**
   * Remove restriction from jobs and policy periods on policy to be purged
   *
   * @param policyNumber The policy to remove purging restriction from
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_PURGEENABLE})
  function unsetDoNotPurgePolicy(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotPurgePolicyByPolicyNumber(policyNumber, false)
  }

  private function setDoNotPurgePolicyPeriod(policyPeriodPublicID : String, value : boolean) {
    Transaction.runWithNewBundle(\ bundle -> {
      var period = findPolicyPeriod(policyPeriodPublicID)
      period = bundle.add(period)
      period.setDoNotPurge(value, \ -> "")
    })
  }

  private function setDoNotPurgePolicyByPolicyNumber(policyNumber : String, value : boolean) {
    Transaction.runWithNewBundle(\ bundle -> {
      var policy = findPolicyByPolicyNumber(policyNumber)
      policy = bundle.add(policy)
      policy.setDoNotPurge(value, \ -> "")
    })
  }

  private function findPolicyPeriod(policyPeriodPublicID : String) : PolicyPeriod {
    var policyPeriodQuery = Query.make(PolicyPeriod)
    policyPeriodQuery.withDistinct(true)
    policyPeriodQuery.compare("PublicID", Relop.Equals,  policyPeriodPublicID)
    var resultPolicyPeriod =  policyPeriodQuery.select()

    if (resultPolicyPeriod.Count == 0) {
      throw new BadIdentifierException(displaykey.JobAPI.InvalidPolicyPeriodPublicID(policyPeriodPublicID))
    }

    return resultPolicyPeriod.single()
  }

  private function findPolicyByPolicyNumber(policyNumber : String) : Policy {
    var policy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    if (policy == null) {
      throw new BadIdentifierException(displaykey.ArchiveAPI.InvalidPolicyNumber(policyNumber))
    }
    return policy
  }

}
