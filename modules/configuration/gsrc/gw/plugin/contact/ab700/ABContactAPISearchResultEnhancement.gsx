package gw.plugin.contact.ab700

uses java.lang.String
uses typekey.PrimaryPhoneType

uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.ABContactAPISearchResult

@Deprecated("Since 8.0.0.  Please use the ab800 package.")
enhancement ABContactAPISearchResultEnhancement : ABContactAPISearchResult {
  
  property get PrimaryPhoneValue() : String {
    if (this.PrimaryPhone == null)
      return null
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_HOME.Code) 
      return this.HomePhone
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_MOBILE.Code)
      return this.CellPhone
    if (this.PrimaryPhone == typekey.PrimaryPhoneType.TC_WORK.Code) 
      return this.WorkPhone
    return null
  }
  
}
