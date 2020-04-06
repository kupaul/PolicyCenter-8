package gw.solr

uses gw.api.solr.SolrSearchCriteria
uses gw.api.productmodel.Product
uses java.util.Date
uses gw.api.util.DisplayableException
uses gw.plugin.Plugins
uses gw.plugin.solr.ISolrSearchPlugin

/**
 * The search criteria
 */
@Export
class SolrPolicySearchCriteria implements SolrSearchCriteria {

  var _nameCriteria : String as NameCriteria
  var _policyCriteria : String as PolicyCriteria
  var _streetCriteria : String as StreetCriteria
  var _cityCriteria : String as CityCriteria
  var _stateCriteria : State as StateCriteria
  var _postalCodeCriteria : String as PostalCodeCriteria
  var _countryCriteria : Country as CountryCriteria
  var _productCriteria : Product as ProductCriteria
  var _jurisdictionCriteria : Jurisdiction as JurisdictionCriteria
  var _producerCriteria : Organization as ProducerCriteria  
  var _producerCodeCriteria : ProducerCode as ProducerCodeCriteria
  var _phoneCriteria : String as PhoneCriteria
  var _inForceOnDateCriteria : Date as InForceOnDateCriteria
  var _officialIdCriteria : String as OfficialIdCriteria
  
  // TODO: what we are returning now is a straight list; I removed the pagination from the ListView
  // so we could just see everything.    Solr supports paginated searches, and when we get to that story,
  // it seems likely that we want to support pagination using the server, rather than having it send over
  // a whole bucketload of results at once.
  
  // My guess is that the createQuery API will get additional parameters for pagination, which it will
  // pass through to our search plugin.
  
  /** 
   * Create a query based on the solr search results
   * 
   * @param searchCriteria The search criteria
   * @returns the query 
   */
  function performSearch() : List<SolrPolicyResultDocument> {
    
    if (!meetsMinimumSearchCriteria()){
      throw new DisplayableException(displaykey.Web.PolicySearch.Solr.NeedSearchCriteria) 
    }
       
    var plugin = Plugins.get(ISolrSearchPlugin<SolrPolicySearchCriteria, SolrPolicyResultDocument>)
    var response = plugin.search(this) 
      
    return response.Results 
       
  }

  private function meetsMinimumSearchCriteria() : boolean {
    
    return PolicyCriteria.NotBlank or
           NameCriteria.NotBlank or
           PhoneCriteria.NotBlank or
           OfficialIdCriteria.NotBlank or
           StreetCriteria.NotBlank or
           CityCriteria.NotBlank
               
  }  
}
