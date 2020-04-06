package gw.solr

uses gw.solr.utils.PCSolrUtils
uses gw.plugin.solr.SolrSearchStore
uses gw.solr.request.AbstractIndexRequest

uses gw.plugin.Plugins
uses gw.plugin.solr.ISolrSearchPlugin
uses gw.solr.utils.SolrIndexContext
uses java.util.Date
uses java.util.Set
uses gw.api.database.Query

/**
 * Represents a PC document index request containing one or more documents to add/update
 */
@Export
class SolrPolicyIndexRequest extends AbstractIndexRequest {
  
  static final var _store = SolrSearchStore.ACTIVE
  static final var _logger : org.slf4j.Logger = PCSolrUtils.Logger

  // This is probably quicker than period.AllEffectiveDates (which scans every bean in the policy graph!)
  // and its behavior should exactly match what our batchload query generates.
  // IT IS NOT A GENERAL REPLACEMENT FOR period.AllEffectiveDates !!!
  static function effDatesForPeriod(period : PolicyPeriod) : Set<Date> {
    return Query.make(PolicyPeriod)
                .compare("Policy",          Equals, period.Policy)
                .compare("Status",          Equals, period.Status)
                .compare("ArchiveState",    Equals, null)
                .compare("Preempted",       Equals, false)
                .compare("TemporaryBranch", Equals, false)
                .compare("TermNumber", Equals, period.TermNumber)
                .select().toTypedArray()
      .map(\ p -> p.EditEffectiveDate)
      .where(\ d -> d >= period.PeriodStart and d < period.PeriodEnd)
      .toSet()  // remove duplicates
      .union({period.EditEffectiveDate})        // include this in case it's uncommitted
  }

  function processContact(contact : Contact, solrContext : SolrIndexContext){
    PCSolrUtils.getAllRelatedPolicyPeriods(contact)
      .where(\ p -> !solrContext.beanIsInBundle(p) and p.Policy.Account == solrContext.Account)
      .map(\ p -> contact.Bundle.add(p)) 
      .each(\ p -> {
        processPeriod(p, solrContext)  
    })
  }
  
  function processPeriod(period : PolicyPeriod, solrContext : SolrIndexContext){
    indexPeriod(period, solrContext)
    PCSolrUtils.getAllRelatedPolicyPeriods(period)
      .where(\ p -> !solrContext.beanIsInBundle(p) and p.Policy.Account == solrContext.Account)
      .each(\ p -> {
        indexPeriod(p, solrContext)  
    })
  }
  
  private function indexPeriod(period : PolicyPeriod, solrContext : SolrIndexContext){
    
    // If the contact is modified in the bundle, the most recent information will be on the contact in the bundle
    // rather than on the period's contact denorm
    var contact = solrContext.getBeanFromBundle(period.PNIContactDenorm) as Contact ?: period.PNIContactDenorm

    if (!PCSolrUtils.shouldIndexPeriod(period)) {
      _logger.warn("Received a request to index an unsuitable period: ${period.PublicID} ")
    }
    
    if (solrContext.ProcessedUpdates.contains(period.ID)){
      _logger.debug("Already processed period: ${period.PublicID} ") 
      return
    }
    solrContext.ProcessedUpdates.add(period.ID)
    
    _logger.debug("Indexing period: ${period.PublicID} ") 
          
    if (period.Status != TC_Bound){
      
      indexDocument(SolrPolicyIndexDocument.createDocument(period.getSlice(period.EditEffectiveDate), contact), solrContext)
      
    } else {
      
      if (period.Job typeis Submission) {
                
        // Only index the single slice for submissions or cancellations
        indexDocument(SolrPolicyIndexDocument.createDocument(period.getSlice(period.PeriodStart), contact), solrContext)
        
      } else {
        // Create an index document for each slice of the bound period.
        // This originally used period.AllEffectiveDates, but effDatesForPeriod is probably faster.
        effDatesForPeriod(period)
          .orderByDescending(\ d -> d)
          .each(\ d -> {
            indexDocument(SolrPolicyIndexDocument.createDocument(period.getSlice(d), contact), solrContext)
        })
      }
    }
  }
   
  private function indexDocument(doc : SolrPolicyIndexDocument, solrContext : SolrIndexContext){
    if(doc != null) {
      var json = doc.asJSON()
      var urn = json.get("urn") as String
      if (!solrContext.URNs.contains(urn)) {
        addDocument(doc)
        solrContext.URNs.add(urn)
      }
    }
  }

  // override of function cannot be replaced with property
  override function getDocumentType() : String {
    return Plugins.get(ISolrSearchPlugin).DocumentType + _store.suffix()
  }
      
}