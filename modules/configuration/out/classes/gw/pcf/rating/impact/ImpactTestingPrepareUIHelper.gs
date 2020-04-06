package gw.pcf.rating.impact

uses gw.rating.flow.util.QueryUtils
uses gw.rating.impact.ImpactBatchUtil
uses gw.rating.impact.RatingExportUtil
uses gw.rating.rtm.util.WebFileUtil
uses gw.util.concurrent.LocklessLazyVar
uses org.apache.commons.io.IOUtils

uses java.util.Set

@Export
class ImpactTestingPrepareUIHelper {

  var _testCase : ImpactTestingTestCase
  var _policyLinePatternCodes = new LocklessLazyVar<Set<String>>() {
    override function init(): Set<String> {
      return getRelevantLinePatternCodesForRateBooks()
    }
  }

  construct(testCase : ImpactTestingTestCase) {
    _testCase = testCase
  }

  function exportPeriodsToExcel() {
    _testCase.Result = new ImpactTestCaseResult()
    _testCase.Result.Complete = false
    _testCase.Bundle.commit()
    RatingExportUtil.CANCEL_SIGNAL.Cancel = false
    ImpactBatchUtil.startBatchJob(TC_IMPACTTESTINGEXPORT)
  }

  function cancelCreateExportFileJob() : void{
    ImpactBatchUtil.cancelBatchJob(TC_IMPACTTESTINGEXPORT)
    _testCase.Result = null
    RatingExportUtil.CANCEL_SIGNAL.Cancel = true
    _testCase.Bundle.commit()
  }

  function downloadExportFile() {
    // Currently we only support a single ImpactTestingTestCase
    var impactTestCase = new gw.api.database.Query(ImpactTestingTestCase).select().whereTypeIs(ImpactTestingTestCase).first()
    var title = RatingExportUtil.getFileName(impactTestCase)

    // NOTE:  Make sure Download attribute on button is set to TRUE
    var webFile = new WebFileUtil("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "${title}.xlsx")
    try {
      webFile.create()
      IOUtils.copy(impactTestCase.Result.Data.toInputStream(), webFile.Stream)
    } finally {
      webFile.write()
    }
  }

  private function getSelectableBooks(codes : Set<String>) : List<RateBook> {
    if (codes.size() == 0) {
      return QueryUtils.getAllRateBooks()
    } else if (codes.size() == 1) {
      return QueryUtils.getRateBooksForLine(codes.single())
    } else {
      return QueryUtils.getRateBooksForMultipleLines(codes.toTypedArray())
    }
  }

  /**
   * Has side effect of updating TestCase.Progress
   */
  function getAllSelectableActiveRateBooks() : List<RateBook>{
    var books = getSelectableBooks(_policyLinePatternCodes.get())
        .where(\ b -> b.Status == TC_ACTIVE)

    if (_testCase.Ratebooks.Count != 0) {
      books.removeAll(_testCase.Ratebooks.map(\ i -> i.RateBook) as java.util.Collection<entity.RateBook>)
    }
    return books
  }

  function getAllSelectableStageOrApprovedRateBooks() : List<RateBook>{
    var books = getSelectableBooks(_policyLinePatternCodes.get())
        .where(\ b -> b.Status == TC_STAGE or b.Status == TC_APPROVED)

    if (_testCase.Ratebooks.Count != 0) {
      books.removeAll(_testCase.Ratebooks.map(\ i -> i.RateBook) as java.util.Collection<entity.RateBook>)
    }
    return books
  }

  function selectRateBooks(rateBooks : RateBook[]) {
     rateBooks.each(\ c -> {
       var iaRateBook = new ImpactTestingRateBook()
       iaRateBook.ImpactTestingTestCase = _testCase
       iaRateBook.RateBook = c
     })
     invalidateTestQuotes()
     _testCase.Bundle.commit()
  }

  function unselectRateBooks(rateBooks : ImpactTestingRateBook[]) {
    rateBooks.each(\ i -> {
      _testCase.removeFromRatebooks(i)
    })
    invalidateTestQuotes()
    _testCase.Bundle.commit()
  }

  function invalidateTestQuotes() {
     _testCase.Periods.each(\ i -> {i.TestRunProgress = "WAITING"
                                    i.TestRunErrorMessage = null
                                    i.TestRunResult = null
                                    if (i.TestPeriod != null) {
                                      i.TestPeriod.setFieldValue("Locked", false)
                                      i.TestPeriod.edit()
                                    }
     })

  }

  /**
   * Infer the relevant PolicyLinePatternCodes from the PolicyPeriods of the TestCase
   */
  private function getRelevantLinePatternCodesForRateBooks() : Set<String> {
    return _testCase.Periods*.OriginalPeriod*.LinePatterns*.Code.toSet()
  }

  property get SelectedRateBooks()  : ImpactTestingRateBook[] {
    return this._testCase.Ratebooks
  }
}
