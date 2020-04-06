package gw.pcf.rating.impact

uses java.lang.String
uses gw.rating.impact.ImpactTestingSearchCriteria
uses gw.api.productmodel.Product
uses gw.api.database.Query
uses gw.api.database.IQueryBeanResult
uses gw.plugin.util.CurrentUserUtil
uses gw.rating.impact.ImpactBatchUtil
uses gw.rating.RateFlowLogger
uses gw.api.productmodel.ProductLookup

/**
 * Helper class used in the ImpactTestingTest wizard.
 */

@Export
class ImpactTestingSearchUIHelper {

  var _searchCriteria : ImpactTestingSearchCriteria as SearchCriteria
  var _currentUser : User

  /**
   * @param criteria Search criteria used to select the set of periods
   *                 from which the impact testing baseline periods are
   *                 created from.
   * @user userInput The user to associate with the helper class;  typically
   *                 this is the user currently logged in at the time the wizard is
   *                 navigated to.
   */
  construct(criteria: ImpactTestingSearchCriteria, userInput : User){
    SearchCriteria = criteria
    _currentUser = userInput
  }

  /**
   * Adds a jurisdiction to the the associated ImpactTestingSearchCriteria.
   *
   * @param j Jurisdiction to add to the impact testing search criteria.  If null,
   *          it is ignored.
   */
  function addJurisdiction(j : Jurisdiction){
    if(j != null){
      SearchCriteria.Jurisdictions = SearchCriteria.Jurisdictions.concat({j})
    }
  }

  /**
   * Removes specified jurisdictions from the associated ImpactTestingSearchCriteria
   *
   * @param jurisdictions Array of jurisdictions to remove from the associated
   *                      impact testing search criteria.  Jurisdictions specified
   *                      in this parameter which are not found in the impact testing
   *                      search criteria are ignored.
   */
  function removeJurisdictions(jurisdictions : Jurisdiction[]){
    SearchCriteria.Jurisdictions = SearchCriteria.Jurisdictions.subtract(jurisdictions).toTypedArray()
  }

  /**
   * Return the set of jurisdictions on the associated impact testing search criteria
   *
   * @return Jurisdiction[] An array of Jurisdictions associated with the impact testing search
   *                        criteria.
   */
  function availableJurisdictions() : Jurisdiction[]{
    return Jurisdiction.getTypeKeys(false).subtract(SearchCriteria.Jurisdictions.toList()).toTypedArray()
  }

  /**
   * Adds a producer code to the the associated ImpactTestingSearchCriteria.
   *
   * @param p Producer code to add to the impact testing search criteria.  If null,
   *          it is ignored.
   */
  function addProducerCode(p : ProducerCode){
    if(p != null){
      SearchCriteria.ProducerCodes = SearchCriteria.ProducerCodes.concat({p}).toSet().toTypedArray()
    }
  }

  /**
   * Removes specified producer codes from the associated ImpactTestingSearchCriteria
   *
   * @param jurisdictions Array of producer codes to remove from the associated
   *                      impact testing search criteria.  Producer codes specified
   *                      in this parameter which are not found in the impact testing
   *                      search criteria are ignored.
   */
  function removeProducerCodes(ProducerCodes : ProducerCode[]){
    SearchCriteria.ProducerCodes = SearchCriteria.ProducerCodes.subtract(ProducerCodes).toTypedArray()
  }

  /**
   * Adds a product to the the associated ImpactTestingSearchCriteria.
   *
   * @param p Product to add to the impact testing search criteria.  If null,
   *          it is ignored.
   */
  function addProduct(p : Product){
    if(p != null){
      SearchCriteria.Products = SearchCriteria.Products.concat({p})
    }
  }

  /**
   * If more than one product has the same displayname, display with the abbreviation appended.
   *
   * Use case:  if the ISO GL7 line is applied, General Liability shows up twice, once for base GL and once for GL7.
   * Since the rating screen is outside the context of a policy, there's no good way to call the availability logic and discover that the base GL is unavailable.
   * Therefore, the products in a pulldown will be displayed like this:
   *
   * ...
   * Commercial Property
   * General Liability (GL)
   * General Liability (GL7)
   * Inland Marine
   * ...
   *
   * @return The product display name with a product abbreviation appended.
   */
  function lineStyleProductDisplay(p : Product) : String {
    return gw.rating.rtm.util.ProductModelUtils.lineStyleProductDisplay(p)
  }

  /**
   * Removes specified Products from the associated ImpactTestingSearchCriteria
   *
   * @param jurisdictions Array of Products to remove from the associated
   *                      impact testing search criteria.  Products specified
   *                      in this parameter which are not found in the impact testing
   *                      search criteria are ignored.
   */
  function removeProducts(products : Product[]){
    SearchCriteria.Products = SearchCriteria.Products.subtract(products).toTypedArray()
  }

  /**
   * Returns the list of products on the associated impact testing search criteria
   *
   * @return Product[] Array of Product on the associated impact testing search criteria
   */
  function availableProducts() : Product[]{
    return ProductLookup.getAll().subtract(SearchCriteria.Products.toList()).toTypedArray()
  }

  /**
   * Clears the ImpactTestingTestPrep work queue
   */
  static function clearPrepWorkQueue() {
    clearWorkQueue(BatchProcessType.TC_IMPACTTESTINGTESTPREP)
  }

  /**
   * Clears the ImpactTestingTestRun work queue
   */
  static function clearTestRunWorkQueue() {
    clearWorkQueue(BatchProcessType.TC_IMPACTTESTINGTESTRUN)
  }

  /**
   * Removes StandardWorkItems from the database associated with the
   * passed in BatchProcessType.  This call runs in its own bundle, commiting before
   * returning.
   *
   * @param processType The BatchProcessType who's standard work items will be removed
   */
  static function clearWorkQueue(processType : BatchProcessType) {
    var q = Query.make(StandardWorkItem)
    q.compare("QueueType", Equals, processType)
    var rows = q.select().toTypedArray()
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      for (row in rows) {
        var workItem = bundle.loadBean(row.ID) as StandardWorkItem
        RateFlowLogger.Logger.debug("removing workitem ${workItem.PublicID} ${workItem.status.DisplayName} ${workItem.DisplayName}")
        workItem.remove()
      }
    })
  }

  /**
   * Populates the passed in test case with the passed in search results.  Calling this will
   * also call<code>#clearPrepWorkQueue</code> and <code>#clearTestRunWorkQueue</code>.
   *
   * @param testCase The impact testing test case to populate
   * @param searchResult The search results used to populate the impact testing test case testCase
   */
  static function populateTestCasePeriods( testCase : ImpactTestingTestCase, searchResult : IQueryBeanResult<PolicyPeriod> ){

    var runningJob = ImpactBatchUtil.jobBeingProcessed()
    if ( runningJob != null ) {
      ImpactBatchUtil.cancelBatchJob(runningJob)
    }

    testCase.reset()
    testCase.Status = TC_Staged
    testCase.populatePeriods(searchResult)
    testCase.RequestingUser =  CurrentUserUtil.getCurrentUser().User
    testCase.refresh()
    testCase.Bundle.commit()
    clearPrepWorkQueue()
    clearTestRunWorkQueue()
  }

}
