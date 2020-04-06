package gw.webservice.pc.pc800.archive

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiPermissions
uses gw.xml.ws.annotation.WsiWebService
uses java.util.Date

/**
 * External API related to archiving
 *
 */
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/archive/ArchiveAPI")
@Export
class ArchiveAPI {

  /**
   * Determines whether the policy term of the policy effective as of the given date is archived.
   *
   * @param policyNumber The policyNumber of the policy to query
   * @param effectiveDate The effective date of the policy term to query
   * @return true if the policy term associated with this policy is archived
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The policyNumber of the policy to query")
  @Param("effectiveDate", "The effective date of the policy term to query")
  @WsiPermissions({SystemPermissionType.TC_VIEWPOLICYFILE})
  @Returns("true if the policy term associated with this policy is archived")
  function isArchived(policyNumber : String, effectiveDate : Date) : boolean {
    SOAPUtil.require(policyNumber, "policyNumber")
    SOAPUtil.require(effectiveDate, "effectiveDate")
    var period = findLatestBoundPeriodInPolicy(policyNumber, effectiveDate)
    return period.PolicyTerm.Archived
  }

  /**
   * Sends a asynchronous request to restore a policy term from the Archive.
   *
   * @param policyNumber The policyNumber of the policy to restore
   * @param effectiveDate The effective date of the policy term to restore
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The policyNumber of the policy to restore")
  @Param("effectiveDate", "The effective date of the policy term to restore")
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
   * Determines whether a policy is suspended from archiving
   *
   * @param policyNumber The policyNumber of the policy to query
   * @return whether policy is suspended from archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The policyNumber of the policy to query")
  @WsiPermissions({SystemPermissionType.TC_VIEWPOLICYFILE})
  @Returns("whether policy is suspended from archiving")
  function isDoNotArchive(policyNumber : String) : boolean {
    SOAPUtil.require(policyNumber, "policyNumber")
    var policy = findPolicy(policyNumber)
    return policy.DoNotArchive
  }


  /**
   * Suspend archiving of terms that are part of the specified Policy.
   *
   * If there are terms that are already archived, suspending archiving will not restore past terms.
   *
   * @param policyNumber The policy number of the policy for which to suspend archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The policy number of the policy for which to suspend archiving")
  @WsiPermissions({SystemPermissionType.TC_ARCHIVEDISABLE})
  function setDoNotArchive(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotArchive(policyNumber, true)
  }

  /**
   * Resume archiving of terms that are part of the specified Policy.
   *
   * If there are terms that are already archived, resuming archiving will not restore past terms.
   *
   * @param policyNumber The policy number of the policy for which to resume archiving
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The policy number of the policy for which to resume archiving")
  @WsiPermissions({SystemPermissionType.TC_ARCHIVEENABLE})
  function unsetDoNotArchive(policyNumber : String) {
    SOAPUtil.require(policyNumber, "policyNumber")
    setDoNotArchive(policyNumber, false)
  }

  /**
   * Private methods
   */
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
      throw new BadIdentifierException(displaykey.ArchiveAPI.Error.InvalidPolicyNumber(policyNumber))
    }

    return resultPolicy.single()
  }

  private function findLatestBoundPeriodInPolicy(policyNumber : String, effectiveDate : Date) : PolicyPeriod {
    var period = entity.Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, effectiveDate)
    if (period == null) {
      throw new BadIdentifierException(displaykey.ArchiveAPI.Error.InvalidPolicyNumberAndEffectiveDate(policyNumber, effectiveDate))
    }
    return period
  }
}
