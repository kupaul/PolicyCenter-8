package gw.losshistory

enhancement ClaimSetEnhancement : ClaimSet
{ 
  function initClaimFilter() {
    this.setClaimsFilter(new ClaimPolicyPeriodFilterSet(this.Claims))
  }
  
  function retrieveClaimFilter() : ClaimPolicyPeriodFilterSet {
    return this.getClaimsFilter() as ClaimPolicyPeriodFilterSet
  }
}
