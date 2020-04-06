package gw.account

uses org.apache.commons.lang.StringUtils

enhancement AccountSummaryEnhancement : AccountSummary {
  
  public property get AbbreviatedAccountHolderName() : String {
    return StringUtils.abbreviate(this.getAccountHolderName(), 20)
  }
}
