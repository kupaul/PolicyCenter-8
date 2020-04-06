package gw.rating.rtm.query

uses java.io.Serializable
uses java.util.Date
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.productmodel.PolicyLinePattern
uses gw.search.EntitySearchCriteria
uses gw.api.productmodel.PolicyLinePatternLookup

@Export
class RateBookSearchCriteria extends EntitySearchCriteria<RateBook> {
  var _policyLine : String as PolicyLine
  var _code : String
  var _name : String
  var _uwCompany : entity.UWCompany as UWCompany
  var _jurisdiction : typekey.Jurisdiction as Jurisdiction
  var _offering : String
  var _status : typekey.RateBookStatus as Status
  var _effectiveDate: Date as EffectiveDate
  var _beforeDate : Boolean as BeforeDate
  var _lastStatusChangeDate: Date as LastStatusChangeDate
  
  construct() {
    _code = ""
    _name = ""
    _beforeDate = true
  }

  property set BookCode(code : String) {
    _code = code ?: ""
  }
  
  property get BookCode() : String {
    return _code
  }
  
  property set BookName(name : String) {
    _name = name ?: ""
  }
  
  property get BookName() : String {
    return _name
  }
  
  property set BookOffering(offering : String) {    
    _offering = offering ?: ""
  }
  
  property get BookOffering() : String {
    return _offering
  }
  
  protected override function doSearch() : IQueryBeanResult<RateBook> {
    var query = Query.make<RateBook>(RateBook)
    if (PolicyLine.NotBlank)           query.compare("PolicyLine", Equals, PolicyLine)
    if (BookCode.NotBlank)             query.contains("BookCode", BookCode, true)
    if (BookName.NotBlank)             query.contains("BookName", BookName, true)
    if (Jurisdiction.Code.NotBlank)    query.compare("BookJurisdiction", Equals, Jurisdiction)
    if (BookOffering.NotBlank)         query.compare("BookOffering", Equals, BookOffering)
    if (Status.Code.NotBlank)          query.compare("Status", Equals, Status)
    if (!BeforeDate and EffectiveDate != null)         query.compare("EffectiveDate", GreaterThanOrEquals, EffectiveDate)
    if (BeforeDate and EffectiveDate != null)         query.compare("EffectiveDate", LessThanOrEquals, EffectiveDate)
    if (LastStatusChangeDate != null)  query.compare("LastStatusChangeDate", GreaterThanOrEquals, LastStatusChangeDate)
    if (UWCompany != null) {
      var uwcTable = query.join("UWCompany")
      uwcTable.compare("Code", Equals, this.UWCompany.Code)
    }
    return query.select()
  }

  // note: this is a copy & paste of the policyLineCodeToDescription function in RateBookEnhancement
  function policyLineCodeToDescription(code : String) : String {
    return PolicyLinePatternLookup.getByCode(code).DisplayName
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
