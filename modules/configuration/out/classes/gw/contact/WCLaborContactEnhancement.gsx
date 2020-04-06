package gw.contact

enhancement WCLaborContactEnhancement : entity.WCLaborContact {
  
  /**
   * Adds a newly created WCLaborContactDetail for this WCLaborContact,
   * in this WCLaborContact's branch and bundle.  The detail's contract effective
   * period is initialized to the branch's policy period.
   */
  function addNewDetail() : WCLaborContactDetail {
    var wcLaborContactDetail = new WCLaborContactDetail(this.Branch)
    wcLaborContactDetail.ContractEffectiveDate  = this.Branch.PeriodStart
    wcLaborContactDetail.ContractExpirationDate = this.Branch.PeriodEnd
    this.addToDetails(wcLaborContactDetail)
    return wcLaborContactDetail
  }

  /**
   * Remove the detail from this WCLaborContact, and furthermore remove this WCLaborContact
   * if it is the very last detail.  NOTE: use this method instead of removeFromDetails.
   */
  function removeDetail(toRemove : WCLaborContactDetail) {
    this.removeFromDetails(toRemove)
    if (this.Details.Count == 0) {
      this.Branch.removeFromPolicyContactRoles(this)
    }
  }
  
}
