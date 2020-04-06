package gw.webservice.pc.pc700.policysearch

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.webservice.SOAPUtil
uses gw.xml.ws.annotation.WsiWebService

uses java.util.Date
uses java.lang.IllegalArgumentException

/**
 * External API for searching for and retrieving policies within PolicyCenter.
 *
 * @see PolicyPeriodAPI
 */
@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/policysearch/PolicySearchAPI" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.policysearch.PolicySearchAPI instead")
class PolicySearchAPI {

  /**
   * This method performs the search <em>only</em> against policy periods stored
   * in PolicyCenter. So if PolicyCenter is not the system of record for the given
   * policy, it may fail to return the latest most recent period bound prior to
   * <em>asOfDate</em>, or it may return <code>null</code> even though a bound policy
   * does exist in the remote system.
   *
   * @param policyNumber The number of the policy to be found Acc
   *
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
  function findPolicyPeriodPublicIdByPolicyNumberAndDate(policyNumber : String, asOfDate : Date) : String {
    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, asOfDate)
    return period.PublicID
  }

  /**
   * This method searches for a policy by a specified policy number.
   *
   * @param policyNumber The number of the policy to be searched for
   * @return the PublicId of the Policy by this number or <code>null</code>
   * if there is no Policy by this number.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(IllegalArgumentException, "If an illegal field value is supplied.")
  function findPolicyPublicIdByPolicyNumber(policyNumber: String): String {
    SOAPUtil.require(policyNumber, "policyNumber")
    var aPolicy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    return aPolicy.PublicID
  }
}
