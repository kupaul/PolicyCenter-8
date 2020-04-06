package gw.webservice.pc.pc800.policysearch

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.IllegalArgumentException
uses java.util.Date
uses gw.xml.ws.annotation.WsiPermissions

/**
 * External API for searching for and retrieving policies within PolicyCenter.
 *
 * @see PolicyPeriodAPI
 */
@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/policysearch/PolicySearchAPI" )
@Export
class PolicySearchAPI {

  /**
   * This method performs the search <em>only</em> against policy periods stored
   * in PolicyCenter. So if PolicyCenter is not the system of record for the given
   * policy, it may fail to return the latest most recent period bound prior to
   * <em>asOfDate</em>, or it may return <code>null</code> even though a bound policy
   * does exist in the remote system.
   *
   * @param policyNumber The number of the policy to be found
   * @param asOfDate A date on which the policy to find is in effect.
   *
   * @return String that holds the public ID of the most recent policy period associated with policy
   * number <code>policyNumber</code> that was in effect on or after <code>asOfDate</code>,
   * or <code>null</code> if there is no such policy period. Warning: The policy period returned
   * might be archived. This status will not be signaled by this method.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("policyNumber", "The number of the policy to be found")
  @Param("asOfDate", "A date on which the policy to find is in effect.")
  @WsiPermissions({SystemPermissionType.TC_SEARCHPOLS})
  @Returns("the public ID of the most recent policy period associated with policy number, or null if no policy period found")
  function findPolicyPeriodPublicIdByPolicyNumberAndDate(policyNumber : String, asOfDate : Date) : String {
    SOAPUtil.require(policyNumber, "policyNumber");
    SOAPUtil.require(asOfDate, "asOfDate");
    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, asOfDate)
    return period.PublicID
  }

  /**
   * Search for a policy by a specified policy number.
   *
   * @param policyNumber The number of the policy to be found
   * @return the PublicId of the Policy by this number or <code>null</code>
   * if there is no Policy by this number.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(IllegalArgumentException, "If an illegal field value is supplied.")
  @Param("policyNumber", "The number of the policy to be found")
  @WsiPermissions({SystemPermissionType.TC_SEARCHPOLS})
  @Returns("the PublicId of the Policy by this number or null if there is no Policy by this number.")
  function findPolicyPublicIdByPolicyNumber(policyNumber: String): String {
    SOAPUtil.require(policyNumber, "policyNumber")
    var aPolicy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    return aPolicy.PublicID
  }
}