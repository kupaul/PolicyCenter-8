package gw.webservice.pc.pc700.archive
uses gw.transaction.Transaction
uses gw.xml.ws.annotation.WsiWebService
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.SOAPUtil
uses gw.api.database.Query
uses gw.api.database.Relop
uses java.util.Date
uses gw.xml.ws.annotation.WsiPermissions

/**
 * External API related to archiving
 *
 */
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/archive/ArchiveAPI")
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.archive.ArchiveAPI instead")
class ArchiveAPI {

  /**
   * Determines whether the policy term of the policy effective as of the given date is archived.
   *
   * @param policyNumber The policy to query
   * @param effectiveDate The effective date of the policy term to query
   * @return true if the policy term associated with this policy is archived
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function isArchived(policyNumber : String, effectiveDate : Date) : boolean {
    SOAPUtil.require(policyNumber, "policyNumber")
    SOAPUtil.require(effectiveDate, "effectiveDate")
    var period = findLatestBoundPeriodInPolicy(policyNumber, effectiveDate)
    return period.PolicyTerm.Archived
  }

  /**
   * Sends a asynchronous request to restore a policy term from the Archive.
   *
   * @param policyNumber The policy to restore
   * @param effectiveDate The effective date of the policy term to restore
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_RESTOREFROMARCHIVE})
  function requestRestore(policyNumber : String, effectiveDate : Date) {
    SOAPUtil.require(policyNumber, "policyNumber")
    SOAPUtil.require(effectiveDate, "effectiveDate")
    var period = findLatestBoundPeriodInPolicy(policyNumber, effectiveDate)
    Transaction.runWithNewBundle(\ bundle -> {
      period = bundle.add(period)
      period.PolicyTerm.createRestoreRequest(User.util.CurrentUser, displaykey.ArchiveAPI.RequestRestore.Reason, false)
    })

  }

  /**
   * Get whether policy is suspended from archiving
   *
   * @param policyNumber The policy to query
   * @return whether policy is suspended from archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function isDoNotArchive(policyNumber : String) : boolean {
    SOAPUtil.require(policyNumber, "policyNumber")
    var policy = findPolicy(policyNumber)
    return policy.DoNotArchive
  }


  /**
   * Suspend archiving policy
   * If there are terms that are already archived, suspending archiving will not restore past terms.
   *
   * @param policyNumber The policy to suspend archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_ARCHIVEDISABLE})
  function setDoNotArchive(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotArchive(policyNumber, true)
  }

  /**
   * Resume archiving policy
   * If there are terms that are already archived, resuming archiving will not restore past terms.
   *
   * @param policyNumber The policy to resume archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @WsiPermissions({SystemPermissionType.TC_ARCHIVEENABLE})
  function unsetDoNotArchive(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotArchive(policyNumber, false)
  }

  private function setDoNotArchive(policyNumber : String, value : boolean) {
    Transaction.runWithNewBundle(\ bundle -> {
      var policy = findPolicy(policyNumber)
      policy = bundle.add(policy)
      policy.setDoNotArchive(value, \ -> "")
    })
  }

  private function findPolicy(policyNumber : String) : Policy {
    var policyQuery = Query.make(Policy)
    policyQuery.withDistinct(true)
    var periodTable = policyQuery.join(PolicyPeriod, "Policy")
    periodTable.compare("PolicyNumber", Relop.Equals,  policyNumber)
    var resultPolicy =  policyQuery.select()

    if (resultPolicy.Count == 0) {
      throw new BadIdentifierException(displaykey.ArchiveAPI.InvalidPolicyNumber(policyNumber))
    }

    return resultPolicy.single()
  }

  private function findLatestBoundPeriodInPolicy(policyNumber : String, effectiveDate : Date) : PolicyPeriod {
    var period = entity.Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, effectiveDate)
    if (period == null) {
      throw new BadIdentifierException(displaykey.ArchiveAPI.InvalidPolicyNumberOnDate(policyNumber, effectiveDate))
    }
    return period
  }
}
