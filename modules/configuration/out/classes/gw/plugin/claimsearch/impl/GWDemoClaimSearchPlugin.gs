package gw.plugin.claimsearch.impl

uses gw.plugin.claimsearch.cc800.GWClaimSearchPlugin
uses java.util.Random
uses gw.plugin.claimsearch.NoResultsClaimSearchException
uses gw.plugin.claimsearch.IClaimSearchCriteria
uses java.math.BigDecimal

@Export
class GWDemoClaimSearchPlugin extends GWClaimSearchPlugin {

  override function searchForClaims( claimsSearchCriteria : IClaimSearchCriteria) : ClaimSet {
    throw new NoResultsClaimSearchException()
  } 

  override function giveUserViewPermissionsOnClaim( username: String, claimNumber: String ) {
    //## do nothing for demo plugin
  }

  override function getClaimDetail(inClaim: Claim ) : ClaimDetail {
    var random = new Random()
    var claimDetail = new ClaimDetail(inClaim.Bundle)
    claimDetail.Claim = inClaim
    claimDetail.Description = "Description " + random.nextInt(56666)
    claimDetail.ClaimPublicID = "testClaim:" + random.nextInt(20000)
    claimDetail.ClaimInfoPublicID = "testClaimInfo:" + random.nextInt(20000)
    claimDetail.ClaimSecurityType = random.nextBoolean() ? "sensitiveclaim" : "unsecuredclaim" 
    claimDetail.Injuries = random.nextBoolean() ? true : false
    claimDetail.Litigation = random.nextBoolean() ? true : false
    claimDetail.Recoveries = new BigDecimal(random.nextInt(1000000)).ofDefaultCurrency()
    claimDetail.RemainingReserves = new BigDecimal(random.nextInt(1000000)).ofDefaultCurrency()
    claimDetail.TotalPaid = new BigDecimal(random.nextInt(1000000)).ofDefaultCurrency()
    return claimDetail
  }
}
