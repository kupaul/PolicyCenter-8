package gw.solr
uses gw.solr.request.AbstractDeleteRequest
uses gw.plugin.solr.SolrSearchStore
uses gw.plugin.Plugins
uses gw.plugin.solr.ISolrSearchPlugin
uses gw.solr.utils.PCSolrUtils
uses gw.solr.utils.SolrIndexContext

@Export
class SolrPolicyDeleteRequest extends AbstractDeleteRequest {
  static final var _store = SolrSearchStore.ACTIVE
  static final var _logger : org.slf4j.Logger = PCSolrUtils.Logger

  function processContact(contact : Contact, solrContext : SolrIndexContext){
    var periods = PCSolrUtils.getAllRelatedPolicyPeriods(contact)
    periods
      .where(\ p -> !solrContext.beanIsInBundle(p) and p.Policy.Account == solrContext.Account)
      .each(\ p -> {
        processPeriod(p, solrContext)
      })
  }

  function processPeriod(period : PolicyPeriod, solrContext : SolrIndexContext, isPurged : boolean= false){
    addDeleteQuery(period, solrContext, isPurged) 
  }

  private function addDeleteQuery(period : PolicyPeriod, solrContext : SolrIndexContext, isPurged : boolean){
    
    if (solrContext.ProcessedDeletes.contains(period.ID)){
      _logger.debug("Already processed deletion for period: ${period.PublicID} ") 
      return
    }
    solrContext.ProcessedDeletes.add(period.ID)

    _logger.debug("Adding delete query for : ${period.PublicID} ") 
    
    
    // TODO Investigate whether we ever need to issue a delete instruction for unbound jobs because they always overwrite previous saves due to consistent urns
    if(isPurged) {
      addQuery("periodID", period.PublicID, solrContext)
    } else if (!period.New){
      if (period.Job typeis Submission or period.Job typeis Rewrite) {
        // delete any existing solr document with the same period id
        addQuery("periodID", period.PublicID, solrContext)
      } else {
        // when saving policy changes, renewals or cancellations, delete all solr documents sharing the same policy id
        addQuery("policyPublicID", period.Policy.PublicID, solrContext)
      }
    }    
  }
  
  private function addQuery(fieldName : String, fieldValue : String, solrContext : SolrIndexContext){
    
    var queryKey = fieldName + "=" + fieldValue
    if (!solrContext.DeleteQueries.contains(queryKey)) { 
      addQuery(fieldName,  "\\\"" + fieldValue + "\\\"") // quote fieldValue, because it contains :  
      solrContext.DeleteQueries.add(queryKey)  
    }
    
  }

  // override of function cannot be replaced with property
  override function getDocumentType() : String {
    return Plugins.get(ISolrSearchPlugin).DocumentType + _store.suffix()
  }
}
