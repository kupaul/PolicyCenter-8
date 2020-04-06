package gw.contact

enhancement PolicyAddlInsuredEnhancement : PolicyAddlInsured
{
  function additionalInsuredTypeExistsOnRole(type : AdditionalInsuredType) : Boolean { 
    return this.PolicyAdditionalInsuredDetails.hasMatch( \ p -> p.AdditionalInsuredType == type )
  }
  
  function addNewAdditionalInsuredDetail() : PolicyAddlInsuredDetail {
    var policyAdditionalInsuredDetail = new PolicyAddlInsuredDetail(this.Branch)
    policyAdditionalInsuredDetail.PolicyAddlInsured = this
    this.addToPolicyAdditionalInsuredDetails( policyAdditionalInsuredDetail )
    return policyAdditionalInsuredDetail
  }
  
  property get AvailableAdditionalInsuredTypes() : typekey.AdditionalInsuredType[] {
    var filteredTypes = AdditionalInsuredType.getTypeKeys( false ).where( \ i -> i.hasCategory( this.PolicyLine.Subtype ))
    var existingTypes = this.PolicyAdditionalInsuredDetails.map( \ p -> p.AdditionalInsuredType )
    return filteredTypes.subtract(existingTypes.toList()).toTypedArray()
  }

  /**
   * Remove the detail from this PolicyAddlInsured, and furthermore remove this PolicyAddlInsured
   * if it is the very last detail.  NOTE: use this method instead of removeFromPolicyAdditionalInsuredDetails.
   */
  function removeDetail(toRemove : PolicyAddlInsuredDetail) {
    this.removeFromPolicyAdditionalInsuredDetails(toRemove)
    if (this.PolicyAdditionalInsuredDetails.Count == 0) {
      this.Branch.removeFromPolicyContactRoles(this)
    }
  }
  
}
