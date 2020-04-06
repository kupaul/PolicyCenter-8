package gw.job.uw

enhancement UWReferralReasonEnhancement : entity.UWReferralReason {
  
  property set Open(isOpen : boolean) {
    this.Status = isOpen ? TC_OPEN : TC_CLOSED
  }
  
  property get Open() : boolean {
    return this.Status == TC_OPEN
  }
  
}
