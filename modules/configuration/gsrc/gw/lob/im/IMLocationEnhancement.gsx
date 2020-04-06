package gw.lob.im

enhancement IMLocationEnhancement : entity.IMLocation {

  /**
   * Checks the Inland Marine Sign Part for sign exposures
   * @return boolean - true if the sign part contains sign exposures
   */
  function hasSign() : boolean {
    var imLine = this.Location.Branch.IMLine
    var imSingPart = imLine.IMSignPart
    if (imSingPart.IMSigns != null) {
      return imSingPart.IMSigns.where(\ i -> i.IMLocation.PublicID == this.PublicID).Count > 0
    }
    return false
  }

  /**
   * Checks whether or not an {@link entity.IMLocation} is referenced by any accounts receivable exposures in the Account Receivable Part
   * @return boolean - true if any account receivables is referenced by an {@link entity.IMLocation}
   */
  function isReferencedByAccountsReceivable() : boolean {
    if( this.IMLine.IMAccountsRecPart.IMAccountsReceivables != null) {
      return this.IMLine.IMAccountsRecPart.IMAccountsReceivables.where(\ ar -> ar.IMBuilding.IMLocation.FixedId == this.FixedId).Count > 0
    }
     return false
  }

  
}
