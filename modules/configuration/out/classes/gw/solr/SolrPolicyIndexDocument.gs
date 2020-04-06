package gw.solr

uses gw.api.config.PCConfigResourceKeys
uses gw.solr.request.AbstractIndexDocument

/**
 * Represents a document in Solr containing the index data for a policy period
 */
@Export
class SolrPolicyIndexDocument extends AbstractIndexDocument {

  construct() {
    super(PCConfigResourceKeys.POLICY_SEARCH_CONFIG.File)
  }

  /**
   * Create a document containing the data for a policy period and its related primary named insured.
   * Use this function to update Solr for contact-related changes that affect muliple periods. 
   * 
   * @param period The policy period
   * @param contact The primary named insured
   * @return the index document
   */
  static function createDocument(period : PolicyPeriod, contact : Contact) : SolrPolicyIndexDocument {
    var document = new SolrPolicyIndexDocument()
    document.constructDocument(period, contact, false)
    return document
  }
  

  private function constructDocument(period : PolicyPeriod, pni : Contact, keyOnly : boolean) {
    addIndexData(period)
    addIndexData("_pniContact", pni)  // TODO remove this when multiple roots are supported by solr platform
    addReferencedBean(period.PolicyAddress.Address)
    populateIndexData(keyOnly) 
  }
  
}
