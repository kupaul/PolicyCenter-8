package gw.losshistory

enhancement ClaimDetailEnhancement : entity.ClaimDetail
{
  function isRestrictedClaim() : boolean {
    return ClaimSecuirty.isRestricted( this.ClaimSecurityType )
  }

  function isClaimLinkAvailable() : boolean {
    return gw.api.system.PCConfigParameters.ClaimSystemURL.Value.HasContent and
          !isArchivedClaim() and
          (isRestrictedClaim() ? perm.System.viewrestrictedclaim and perm.System.viewclaimsystem : perm.System.viewclaimsystem)
  }

  function isArchivedClaim() : boolean {
    // archive claim will not have claimPublicID associated to it, instead it will have claimInfoPublicID
    return (this.ClaimPublicID == null)
  }
}
