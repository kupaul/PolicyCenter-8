package gw.plugin.claimsearch.cc700
uses java.util.List

uses gw.plugin.claimsearch.IClaimSearchPlugin
uses gw.losshistory.ClaimPolicyPeriodFilterSet
uses gw.plugin.claimsearch.NoResultsClaimSearchException
uses gw.plugin.claimsearch.ResultsCappedClaimSearchException
uses gw.plugin.claimsearch.IClaimSearchCriteria
uses gw.plugin.claimsearch.ClaimSearchSpec
uses wsi.remote.gw.webservice.cc.cc700.pcclaimsearchintegrationapi.PCClaimSearchIntegrationAPI
uses wsi.remote.gw.webservice.cc.cc700.pcclaimsearchintegrationapi.types.complex.PCClaim
uses wsi.remote.gw.webservice.cc.cc700.pcclaimsearchintegrationapi.types.complex.PCClaimSearchCriteria
uses wsi.remote.gw.webservice.cc.cc700.pcclaimsearchintegrationapi.anonymous.elements.PCClaimSearchCriteria_PolicyNumbers
uses java.lang.Deprecated

/**
 * GWClaimSearchPlugin uses the PCClaimSearchIntegrationAPI to get claim information from a Guidewire ClaimCenter [CC7]
 * implementation into entities designed for PolicyCenter [PC8].
 *
 * This version of GWClaimSearchPlugin is based on the plugin created for integration between CC7 and PC7.
 * At that time, PC only supported a single currency, so this implementation likewise only supports a single currency
 * as there is no currency information in the CC7 as delivered by Guidewire.
 *
 * To support a multicurrency implementation between CC7 and PC8, one must:
 *  - Add currency information to the API as delivered by CC7, particularly PCClaim and PCClaimDetail
 *  - Replace the use of ofDefaultCurrency() in the following methods to create MonetaryAmounts using the currency information provided:
 *    - getClaimDetail
 *    - addClaimToClaimSet
 */
@Export
class GWClaimSearchPlugin implements IClaimSearchPlugin {

  static var MAX_NUMBER_ALLOWABLE = 100

  override function searchForClaims(claimSearchCriteria : IClaimSearchCriteria) : ClaimSet {
    var claimResult = getClaimsFromExternalSystem(claimSearchCriteria.SearchSpecs)
    if (claimResult == null or claimResult.size() == 0) {
      throw new NoResultsClaimSearchException()
    }
    var result : ClaimSet
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      result = new ClaimSet(bundle)
      for (pcClaim in claimResult) {
        var claim = addClaimToClaimSet(pcClaim, result)
        mapClaimToPeriod(claim, pcClaim.PolicyNumber)
      }
      var claimFilter = new ClaimPolicyPeriodFilterSet(result.Claims)
      result.setClaimsFilter(claimFilter)
    })
    return result
  }


  /**
   * Intended override point for tests.
   */
  protected function getClaimsFromExternalSystem(specs : List<ClaimSearchSpec>)  : List<PCClaim> {
    var criteriaForCC = specs.map(\ c -> toPCClaimSearchCriteria(c)).toTypedArray()
    validateCriteria(criteriaForCC)
    var claimCount = ClaimSearchIntegrationAPI.getNumberOfClaimsMultiCriteria(criteriaForCC)    
    if (claimCount == 0 ) {
      return null
    } else if (claimCount > MAX_NUMBER_ALLOWABLE) {
      throw new ResultsCappedClaimSearchException()
    }
      
    return ClaimSearchIntegrationAPI.searchForClaimsMultiCriteria(criteriaForCC).toList()
  }
    /**
     * Sets the policyperiod by first finding the policy that matches the policyNumber
     * and then choosing the most recent bound period associated with that policy with
     * an effective date range containing the lossDate.  This
     * allows the claim to be attached to a period with a different policy number, for example
     * when a new job has been bound that changes the policy number, but the claims system
     * is not aware of the change and returns the prior policy number.
     */
    private function mapClaimToPeriod(claim : Claim, policyNumber : String) {
      // First finds the policy from the policyNumber, then the matching period.
      claim.PolicyPeriod = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, claim.LossDate)
      claim.PolicyInForce = (claim.PolicyPeriod != null)
    }

  private function toPCClaimSearchCriteria(searchSpec : ClaimSearchSpec) :  PCClaimSearchCriteria {
    var pcClaimSearchCriteria = new PCClaimSearchCriteria()
    var dateRange = searchSpec.DateRange
    pcClaimSearchCriteria.BeginDate = dateRange.AllTime ? null : dateRange.BeginDate
    pcClaimSearchCriteria.EndDate = dateRange.AllTime ? null : dateRange.EndDate
    
    // Find all related policy numbers by looking up all policy periods and extracting
    // the unique set of policy numbers relating to those periods
    pcClaimSearchCriteria.PolicyNumbers = new PCClaimSearchCriteria_PolicyNumbers()
    pcClaimSearchCriteria.PolicyNumbers.Entry.addAll(searchSpec.PolicyNumbers.toList())
    pcClaimSearchCriteria.Status = searchSpec.ClaimStatus   
    return pcClaimSearchCriteria
  }
  
  private function validateCriteria(criteria : PCClaimSearchCriteria[]) {
    // Test to see if there are no policy numbers specified
    if (criteria*.PolicyNumbers.Count == 0) {
      throw new NoResultsClaimSearchException()      
    }
  }

  override function giveUserViewPermissionsOnClaim(username: String, claimPublicID: String) {
    ClaimSearchIntegrationAPI.giveUserClaimViewPermission(claimPublicID, username)
  }

  override function getClaimDetail(inclaim: Claim) : ClaimDetail {
    var pcClaimDetail = ClaimSearchIntegrationAPI.getClaimByClaimNumber(inclaim.ClaimNumber)
    if (pcClaimDetail != null) {
      var claimDetail = new ClaimDetail(inclaim)
      claimDetail.Claim = inclaim
      claimDetail.Description = pcClaimDetail.Description
      claimDetail.LossCause = pcClaimDetail.LossCause
      claimDetail.ClaimSecurityType = pcClaimDetail.ClaimSecurityType
      claimDetail.ClaimPublicID = pcClaimDetail.ClaimPublicID
      claimDetail.ClaimInfoPublicID = pcClaimDetail.ClaimInfoPublicID
      claimDetail.Injuries = pcClaimDetail.Injury
      claimDetail.Litigation = pcClaimDetail.Litigation
      claimDetail.Recoveries = pcClaimDetail.Recoveries?.ofDefaultCurrency()
      claimDetail.RemainingReserves = pcClaimDetail.RemainingReserves?.ofDefaultCurrency()
      claimDetail.TotalPaid = pcClaimDetail.TotalPaid?.ofDefaultCurrency()
      return claimDetail
    } 
    return null
  }

  @Deprecated
  override function getClaimDetailByClaimNumber(claim: gw.pc.losshistory.entity.Claim): gw.pc.losshistory.entity.ClaimDetail {
    return getClaimDetail(claim)
  }

  private function addClaimToClaimSet(pcClaim: PCClaim, claimSet: ClaimSet): Claim {
    var claim = new Claim(claimSet)
    claim.ClaimNumber = pcClaim.ClaimNumber
    claim.PolicyType = pcClaim.PolicyTypeName
    claim.LossDate = pcClaim.LossDate
    claim.Status = pcClaim.Status
    claim.TotalIncurred = pcClaim.TotalIncurred?.ofDefaultCurrency()
    claimSet.addToClaims(claim)
    return claim
  }
  
  private property get ClaimSearchIntegrationAPI() : PCClaimSearchIntegrationAPI {
    var config = new gw.xml.ws.WsdlConfig()
    config.Guidewire.Locale = User.util.CurrentLocale.Code
    config.Guidewire.Authentication.Username = "su"
    config.Guidewire.Authentication.Password = "gw"
    config.CallTimeout = 10000
    return new PCClaimSearchIntegrationAPI(config)
  }

}
