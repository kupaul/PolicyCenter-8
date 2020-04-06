package gw.lob.bop.financials
uses gw.entity.ILinkPropertyInfo

enhancement BOPAddnlInsuredCostEnhancement : entity.BOPAddnlInsuredCost {
  /**
   * This property is used to return AdditionalInsured in window mode and should be
   * used in place of AdditionalInsured FK (which stores only FixedID) because the 
   * AdditionalInsured may have already been deleted in current slice and this 
   * cost's effective window may span more time than that of the AdditionalInsured
   */
  property get AdditionalInsuredWM() : entity.PolicyAddlInsured{
    if(this.AdditionalInsured != null){
      return this.AdditionalInsured
    }
    var p = BOPAddnlInsuredCost.Type.TypeInfo.getProperty("AdditionalInsured")
    var addInsuredVL = this.getLinkVersionList(p as ILinkPropertyInfo)
    return addInsuredVL.AllVersionsUntyped.last() as PolicyAddlInsured
  }
  
  /**
   * @see AdditionalInsuredWM
   */
  property get DisplayNameWM() : String{
    return displaykey.Web.Financials.BOP.AdditionalInsuredFlatCharge( this.AdditionalInsuredWM )
  }
}
