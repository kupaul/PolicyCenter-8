package gw.solr.utils

uses gw.api.database.Query
uses gw.api.system.PCLoggerCategory
uses gw.api.web.policy.ViewablePolicyPeriodQueryFilter
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.solr.ISolrMessageTransportPlugin
uses gw.solr.SolrPolicyDeleteRequest
uses gw.solr.SolrPolicyIndexRequest

uses java.lang.InterruptedException
uses java.lang.Iterable
uses java.util.Collection
uses java.util.HashSet

@Export
class PCSolrUtils extends PLSolrUtils {

  /** 
   * Update the policy periods on the SOLR server.
   */
  static function reloadPolicies(){
    indexPolicies(Query.make(PolicyPeriod).select())
  }

  static function reloadPolicies(publicIds : String[]){
    indexPolicies(
      Query.make(PolicyPeriod)
       .compareIn("PublicID", publicIds)
       .select()
     )
  }
  
  private static function indexPolicies(periods : Iterable<PolicyPeriod>){
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {     
      periods        
        .where(\ p -> shouldIndexPeriod(p))        
        .orderBy(\ p -> p.Policy.ID)
        .thenBy(\ p -> p.TermNumber?:0)
        .each(\ p -> {
          indexPeriod(p, new SolrIndexContext(bundle, p.Policy.Account))  
        })      
    })
  }
    
  static function waitforSolrServerLatency(){
    
    new SolrClient().commit()
    
  }
  
  static function indexPeriod(period : PolicyPeriod, solrContext : SolrIndexContext) {
    
    var transport = Plugins.get(ISolrMessageTransportPlugin)
            
    var deleteRq = new SolrPolicyDeleteRequest()
    deleteRq.processPeriod(period, solrContext)
    var deleteMessage = deleteRq.toMessage() 
    
    var indexRq = new SolrPolicyIndexRequest()
    indexRq.processPeriod(period, solrContext)
    var indexMessage = indexRq.toMessage() 

    // In order to create Message objects, we need to put them into their own bundle.   We're going to send immediately,
    // so we don't want to commit the bundle; instead, throw an exception to prevent the commit, and silently catch the exception.
    try {
      gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
        transport.send(new Message(bundle) {:Account = solrContext.Account}, deleteMessage)
        transport.send(new Message(bundle) {:Account = solrContext.Account}, indexMessage)
        throw new InterruptedException("Prevent the transaction from committing")
      })
    } catch (ie : InterruptedException) {
      // expected.
    }
  }
    
  /**
   * Delete all policies
   * 
   */
  static function deleteAllPolicies(){
  
    var client = new SolrClient()
    client.dropdb()
      
  }

 /**
   * Returns the all PolicyPeriods that are linked to the contact.
   * The database is queried directly, so changes in the current bundle 
   * are not reflected in the results.
   */
  static function getAllRelatedPolicyPeriods(contact : Contact) : Collection<PolicyPeriod> {
    if (contact.New) {
      return new HashSet<PolicyPeriod>()
    } else {
      var query = Query.make(PolicyPeriod).withDistinct(true)

      // "BranchValue" is the name of the property for the BranchID column
      query.join(PolicyContactRole, "BranchValue")
           .join("AccountContactRole")
           .join("AccountContact")
           .compare("Contact", Equals, contact)
           
      // filterNew doesn't always mutate the query passed in, so use the return value
      var filteredQuery = new ViewablePolicyPeriodQueryFilter().filterNewQuery(query)
      
      return filteredQuery
        .select()
        .where(\ p -> shouldIndexPeriod(p))

    }
  }  


  /**
   * Returns all the most recent models of each term and all the unbound policy periods
   */
  static function getAllRelatedPolicyPeriods(period : PolicyPeriod) : Collection<PolicyPeriod> {
    
    return period.Policy.Periods.where(\ p -> shouldIndexPeriod(p) and p.PublicID != period.PublicID).toList()
        
  }  
  
  /**
   * returns true if the period should be indexed
   */
  static function shouldIndexPeriod(period : PolicyPeriod) : boolean{
    if (period.Status == TC_Quoting or period.ArchiveState != null or period.Job == null or period.Job typeis Audit) {
      return false // Do not index quoting or Archived periods or an audit
    }
    if (period.Status != TC_Bound) {
      return !(period.Job typeis Cancellation) and !(period.Preempted) // Index all unbound periods except cancellations and preempted periods
    }
    return period.MostRecentModel // Only index most recent models
  }

  /**
   * Run a solr consistency check
   * @return report
   */
  static function runConsistencyCheck() : SolrConsistencyReport{
    
    var consistencyChecker = new SolrConsistencyChecker(25) { :TrackProcessedUrns = false }
    return consistencyChecker.check()
      
  }
  

  static property get Logger() : org.slf4j.Logger {
    return PCLoggerCategory.SOLR_INDEXING
  }

   static function getBeanFromBundle(bean : KeyableBean, bundle : Bundle) : KeyableBean{
    
    var found = bundle.UpdatedBeans.firstWhere(\ k -> k.ID == bean.ID) 
    if (found != null){
      return found
    }
    found = bundle.InsertedBeans.firstWhere(\ k -> k.ID == bean.ID)
    if (found != null){
      return found
    }
    found = bundle.RemovedBeans.firstWhere(\ k -> k.ID == bean.ID )
    if (found != null){
      return found
    }
    return null          
    
  }  
  
}
