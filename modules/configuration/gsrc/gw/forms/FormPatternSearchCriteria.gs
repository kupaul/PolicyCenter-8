package gw.forms
uses gw.api.database.IQueryBeanResult
uses gw.api.productmodel.Product
uses gw.api.database.Query
uses gw.search.EntitySearchCriteria

@Export
class FormPatternSearchCriteria extends EntitySearchCriteria<FormPattern> {

  var _formNumber : String 
  var _formName : String
  var _groupCode : String
  property get FormNumber() : String { return _formNumber }
  property set FormNumber(value : String) { _formNumber = (value != null) ? value.trim() : null }
  property get FormName() : String  { return _formName }
  property set FormName(value : String) { _formName = (value != null) ? value.trim() : null }  
  property get GroupCode() : String  { return _groupCode }
  property set GroupCode(value : String) { _groupCode = (value != null) ? value.trim() : null }  
  var _product : Product as Product

  
  override protected function doSearch() : IQueryBeanResult<FormPattern> {
    return makeQuery().select() 
  }
  
  private function makeQuery() : Query<FormPattern> {
    var query = new Query<FormPattern>(FormPattern)
    
    if (FormNumber.NotBlank) {
      query.startsWith("FormNumber", FormNumber, true)
    }
    
    if (FormName.NotBlank) {
      query.startsWith("Description", FormName, true)
    }
    
    if (GroupCode.NotBlank) {
      query.startsWith("InternalGroupCode", GroupCode, true)
    }
    
    if (Product != null) {
      var formPatternProductQuery = new Query<FormPatternProduct>(FormPatternProduct)
      formPatternProductQuery.compare("ProductCode", Equals, Product.Code)
      query.subselect("ID", CompareIn, formPatternProductQuery, "FormPattern")
    }
    return query
  }

  private function hasContentInFormNumber() : boolean {
    return FormNumber.NotBlank 
  }
  
  private function hasAtLeastThreeCharactersInFormNumber() : boolean {
    return hasContentInFormNumber() and FormNumber != null and FormNumber.length < 3
  }
  
  private function hasAtLeastThreeCharactersInFormName() : boolean {
    return hasContentInFormName() and FormName != null and FormName.length < 3
  }
  
  private function hasAtLeastThreeCharactersInGroupCode() : boolean {
    return hasContentInGroupCode() and GroupCode != null and GroupCode.length < 3
  }
  
  private function hasContentInFormName() : boolean {
    return FormName.NotBlank 
  }
  
  private function hasContentInGroupCode() : boolean {
   return GroupCode.NotBlank 
  }
  
  private function hasProduct() : boolean {
    return Product != null 
  }  

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    if (!hasContentInFormNumber() and  !hasProduct() and !hasContentInFormName() and !hasContentInGroupCode()) {
      return displaykey.Web.FormPatternSearch.MinimumSearchCriteriaRequirement
    } 
    if (hasAtLeastThreeCharactersInFormNumber()) {
      return (hasProduct()or hasContentInFormName() or hasContentInGroupCode()) ? null : displaykey.Web.FormPatternSearch.AtLeastThreeCharactersFormNumber  
     } 
    if(hasAtLeastThreeCharactersInFormName()) { 
       return (hasProduct() or hasContentInFormNumber() or hasContentInGroupCode()) ? null : displaykey.Web.FormPatternSearch.AtLeastThreeCharactersFormName
    }
    if(hasAtLeastThreeCharactersInGroupCode()) {
       return (hasProduct() or hasContentInFormName() or hasContentInFormNumber()) ? null : displaykey.Web.FormPatternSearch.AtLeastThreeCharactersGroupCode 
    }
    return null
  }

}
