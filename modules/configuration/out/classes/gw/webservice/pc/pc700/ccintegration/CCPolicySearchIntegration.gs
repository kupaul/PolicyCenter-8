package gw.webservice.pc.pc700.ccintegration

uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPCSearchCriteria
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicy
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummary
uses java.util.ArrayList
uses java.util.Date
uses gw.api.web.producer.ProducerUtil
uses gw.api.web.product.ProducerCodePickerUtil
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPCFilteringCriteria


/**
 * WebService for CC to search and retrieve policies.
 */
@Export
@RpcWebService
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.CCPolicySearchIntegration instead")
class CCPolicySearchIntegration {

  construct() {
  }

  /**
   * Performs a search of policies that match the given criteria.
   *
   * @param criteria Policy search criteria
   * @param filter Data filter used to reduce the amount of data returned with the found policies
   * @return CCPolicySummary[]
   */
  public function searchForPolicies(criteria : CCPCSearchCriteria, filter : CCPCFilteringCriteria) : CCPolicySummary[] {
    // Execute the search
    var policySearchResults = extractSearchCriteria(criteria).performSearch()

    // Determine a date to use for evaluating the policy status.  If an "as of date" was provided as search criteria,
    // then use that date.  Otherwise, use the current date (what is the status now?)
    // Note: this does not control the "slice date" which is used for returning details about the policy as of a
    // given date.
    var statusDate = criteria.AsOfDate;
    if (statusDate == null) { statusDate = gw.api.util.DateUtil.currentDate() }

    // Map the data into return results
    var results = new ArrayList<CCPolicySummary>()
    for (period in policySearchResults.iterator()) {
      // Determine the slice date that should be used for returning summary info about the contents of the policy.
      // If the status date above falls within the policy period, then use that.  Otherwise, if it falls before the start of
      // the period, then use PeriodStart.  If it falls after the end of the period, use a time just prior to PeriodEnd.
      var asOfDate : Date
      if (statusDate < period.PeriodStart) {
        asOfDate = period.PeriodStart
      } else if (statusDate < period.PeriodEnd) {
        asOfDate = statusDate
      } else {
        asOfDate = period.PeriodEnd.addMinutes(-1)  // Period is expired at PeriodEnd, so choose a time 1 minute earlier than that
      }

      // Generate info about the policy to be returned
      results.add(new CCPolicyGenerator(statusDate, filter).generatePolicySummary(period, asOfDate));
    }
    return results.toTypedArray()
  }

  /**
   * Retrieves a policy.
   *
   * @param policyNumber Policy Number for the policy to be retrieved.
   * @param asOfDate The effective date for which you want to retrieve coverage information, such as the loss date of a claim.  This must be a date which falls within the effective period of the policy.
   * @param filter Data filter used to reduce the amount of data returned with the retrieved policy
   * @return CCPolicy
   */
  public function retrievePolicy(policyNumber : String, asOfDate : Date, filter : CCPCFilteringCriteria) : CCPolicy {
    var pcPolicyPeriod = entity.Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, asOfDate)
    var ccPolicyGenerator = new CCPolicyGenerator(asOfDate, filter)
    return ccPolicyGenerator.generatePolicy(pcPolicyPeriod)
  }

  private function extractSearchCriteria(ccCriteria : CCPCSearchCriteria) : PolicySearchCriteria
  {
    var criteria = new PolicySearchCriteria()
    criteria.SearchObjectType = SearchObjectType.TC_POLICY
    criteria.AccountNumber = ccCriteria.AccountNumber
    criteria.AsOfDate = ccCriteria.AsOfDate
    criteria.NonRenewalCode = ccCriteria.NonRenewalCode
    criteria.PolicyNumber = ccCriteria.PolicyNumber
    criteria.PolicyStatus = ccCriteria.PolicyStatus
    criteria.Producer = ProducerUtil.convertValueFromString(ccCriteria.ProducerString, null)
    criteria.ProducerCode = ProducerCodePickerUtil.convertValueFromString( ccCriteria.ProducerCodeString, null )
    criteria.Product = ccCriteria.Product
    criteria.ProductCode = ccCriteria.ProductCode
    criteria.State = ccCriteria.State
    criteria.NameCriteria = new NameCriteria()
    criteria.NameCriteria.FirstName = ccCriteria.FirstName
    criteria.NameCriteria.LastName = ccCriteria.LastName
    criteria.NameCriteria.CompanyName = ccCriteria.CompanyName
    criteria.NameCriteria.OfficialId = ccCriteria.TaxID
    criteria.IncludeArchived = ccCriteria.IncludeArchived
    criteria.PrimaryInsuredCity = ccCriteria.PrimaryInsuredCity
    criteria.PrimaryInsuredState = ccCriteria.PrimaryInsuredState
    criteria.PrimaryInsuredPostalCode = ccCriteria.PrimaryInsuredPostalCode
    criteria.PrimaryInsuredCountry = ccCriteria.PrimaryInsuredCountry

    return criteria
  }

}