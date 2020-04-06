package gw.rating.impact
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.util.DisplayableException
uses gw.rating.RateFlowLogger

enhancement ImpactTestingTestCaseEnhancement : entity.ImpactTestingTestCase {

  /**
   * Save the set of periods to the test case and promotes the status
   * of the test case to "staged"
   *
   * @param The query results
   *
   */
  function populatePeriods(searchResult : IQueryBeanResult<PolicyPeriod>){

    if (this.Periods.Count > 0) {
      throw new DisplayableException(displaykey.RatingImpact.Count)
    }

    searchResult.setPageSize(ImpactTestingSearchCriteria.getImpactTestingPageSize())

    // Add the new periods
    searchResult.each(\ p -> {
      var analysisPeriod = new ImpactTestingPolicyPeriod(this.Bundle)
      analysisPeriod.OriginalPeriod = p
      analysisPeriod.AccountNumber = p.Policy.Account.AccountNumber
      analysisPeriod.PolicyNumber = p.PolicyNumber
      this.addToPeriods(analysisPeriod)
    })

  }

  /** Resets the test case and moves it back to "draft" status
   *
   */
  function reset(){

    // Clear out the existing periods (if any)
    RateFlowLogger.Logger.info("before removing test periods ")

    this.Periods.each(\ i -> {
      i.refresh()
      this.removeFromPeriods(i)
    })

    this.Status = TC_Draft

  }

  /**
   * @return the singleton test case
   */
  static function getSingletonTestCase() : ImpactTestingTestCase{

    var testCase : ImpactTestingTestCase
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {

      var rs = Query.make(ImpactTestingTestCase).select()

      // Presently, only one test case in the db is supported
      if(rs.Count > 1){
        throw new DisplayableException(displaykey.RatingImpact.Count)
      }

      // If one exists, return it
      if (rs.HasElements) {
        testCase = bundle.add(rs.single())
      } else {
        testCase = new ImpactTestingTestCase(bundle)
        testCase.Name = "Singleton test case"
        testCase.Status = TC_Draft
      }
    })

    return testCase

  }

  /**
   * @return the impact periods processed during testcase prep, including errors
   */
  property get TestPrepProcessedCount() : int{
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestPrepProgress", Equals, ImpactTestingJobProgress.TC_PROCESSED)
    return periodQuery.select().Count
  }

  /**
   * @return the impact periods not processed during testcase prep
   */
  property get TestPrepUnprocessedCount() : int{
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.or(\ restriction -> {
      restriction.compare("TestPrepProgress", NotEquals, ImpactTestingJobProgress.TC_PROCESSED)
      restriction.compare("TestPrepProgress", Equals, null)
    })
    return periodQuery.select().Count
  }

  /**
   * @return the number of errors that occurred during testcase prep
   */
  property get TestPrepErrorCount() : int{
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestPrepErrorMessage", NotEquals, null)
    return periodQuery.select().Count
  }

  /**
   * @return the number of successful periods processed during testcase prep
   */
  property get TestPrepSuccessCount() : int{
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestPrepResult", Equals, ImpactTestingPrepResult.TC_SUCCESS)
    return periodQuery.select().Count
  }

  /**
   * @return the number of successful periods processed during testcase prep
   */
  property get TestPrepPercentComplete() : int{
    if (this.Periods.Count == 0){
      return 0
    }
    return TestPrepProcessedCount * 100 / this.Periods.Count
  }

  /**
   * @return true if the test prep is complete
   */
  property get IsTestPrepComplete() : boolean{
    return TestPrepPercentComplete == 100
  }

  /** Test run period processing status properties **/

  /**
   * @return the total number of test periods processed during the test run, including errors
   */
  property get TestRunProcessedCount() : int {
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestRunProgress", Equals, ImpactTestingJobProgress.TC_PROCESSED)
    return periodQuery.select().Count
  }

  /**
   * @return the impact periods not processed during testcase run
   */
  property get TestRunUnprocessedCount() : int{
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.or(\ restriction -> {
      restriction.compare("TestRunProgress", NotEquals, ImpactTestingJobProgress.TC_PROCESSED)
      restriction.compare("TestRunProgress", Equals, null)
    })
    return periodQuery.select().Count
  }

  /**
   * @return the total number of test periods successfully quoted during the test run
   */
  property get TestRunSuccessCount() : int {
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestRunResult", Equals, ImpactTestingRunResult.TC_SUCCESS)
    return periodQuery.select().Count
  }


  /**
   * @return the number of errors encountered during the test run
   */
  property get TestRunErrorCount() : int {
    var periodQuery = Query.make(ImpactTestingPolicyPeriod)
    periodQuery.compare("TestCase", Equals, this)
    periodQuery.compare("TestRunErrorMessage", NotEquals, null)
    return periodQuery.select().Count
  }

  /**
   * @return the number of successful periods processed during test run
   */
  property get TestRunPercentComplete() : int{
    if (this.Periods.Count == 0) {
      return 0
    }
    return TestRunProcessedCount * 100 / this.Periods.Count
  }

  /**
   * @return true if the test run is complete
   */
  property get IsTestRunComplete() : boolean{
    return TestRunPercentComplete == 100
  }

}
