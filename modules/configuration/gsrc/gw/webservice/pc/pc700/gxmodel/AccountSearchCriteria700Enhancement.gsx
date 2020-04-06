package gw.webservice.pc.pc700.gxmodel
uses gw.webservice.pc.pc700.account.AccountSearchCriteria700

@Deprecated("AccountSearchCriteria700 is deprecated as of 8.0")
enhancement AccountSearchCriteria700Enhancement : gw.webservice.pc.pc700.gxmodel.accountsearchcriteriamodel.types.complex.AccountSearchCriteria700 {

  function populateCriteria(criteria : AccountSearchCriteria700    ){
    SimpleValuePopulator.populate(this, criteria)
    criteria.setProducerCodeByCode(this.ProducerCode.Code)
    criteria.setProducerByPublicID(this.Producer.PublicID)
    criteria.setIndustryCodeByCode(this.IndustryCode.Code)
  }
}
