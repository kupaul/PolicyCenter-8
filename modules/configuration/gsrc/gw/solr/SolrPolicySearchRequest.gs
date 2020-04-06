package gw.solr

uses gw.api.config.PCConfigResourceKeys
uses gw.plugin.solr.SolrSearchStore
uses gw.solr.request.AbstractSearchRequest
uses gw.plugin.solr.ISolrSearchPlugin
uses gw.plugin.Plugins

/**
 * Represents a PC solr search request
 */
@Export
class SolrPolicySearchRequest extends AbstractSearchRequest<SolrPolicyResultDocument> {

  var _searchCriteria : SolrPolicySearchCriteria
  var _store = SolrSearchStore.ACTIVE
  
  construct(searchCriteria : SolrPolicySearchCriteria) {
    super(PCConfigResourceKeys.POLICY_SEARCH_CONFIG.File, {})
    _searchCriteria = searchCriteria
  }
  
  override function getDocumentType() : String {
    return Plugins.get(ISolrSearchPlugin).DocumentType + _store.suffix()
  }

  // ------------------------------------------------------------------
  // Query construction
  // ------------------------------------------------------------------

  override function createSearchCriteria() {
    addCriterion(SolrPolicySearchCriteria.Type.Name, _searchCriteria)
    addCriterion(_searchCriteria.NameCriteria)
  }
  
  // ------------------------------------------------------------------
  // Query result processing
  // ------------------------------------------------------------------

  override function createResultRow() : SolrPolicyResultDocument {
    return new SolrPolicyResultDocument()
  }

  override function filterDocument( result : SolrPolicyResultDocument, store : SolrSearchStore ) : boolean {
    // TODO security or other filtering here
    // TODO need key marker in result map to indicate which entry(s) correspond to security keys
    // var claim = Claim.finder.findClaimByClaimNumber(claimNumber)
    // shouldFilter = claim != null && !perm.Claim.view(claim)

    return super.filterDocument( result, store )
  }

}
