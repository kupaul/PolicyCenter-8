package gw.lob.ba

enhancement BAJurisdictionEnhancement : BAJurisdiction {
  
  property get HiredAutoCoverageSelected() : boolean {
    return this.HiredAutoBasis != null
  }
  
  property set HiredAutoCoverageSelected(selected : boolean) {
    if (selected != HiredAutoCoverageSelected) {
      // Only do something if the value is changing  
      if (selected) {
        this.HiredAutoBasis = new BAHiredAutoBasis(this.Branch)
      } else {
        this.HiredAutoBasis.remove()
        this.HiredAutoBasis = null
      }
    }  
  }
  
  property get NonOwnedCoverageSelected() : boolean {
    return this.NonOwnedBasis != null
  }
  
  property set NonOwnedCoverageSelected(selected : boolean) {
    if (selected != NonOwnedCoverageSelected) {
      // Only do something if the value is changing  
      if (selected) {
        this.NonOwnedBasis = new BANonOwnedBasis(this.Branch)
      } else {
        this.NonOwnedBasis.remove()
        this.NonOwnedBasis = null
      }      
    }  
  }

  property get BusinessAutoLine() : productmodel.BusinessAutoLine {
    return this.BALine as productmodel.BusinessAutoLine
  }
}
