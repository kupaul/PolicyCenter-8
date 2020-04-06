package gw.pcf.rating.ratebook

uses gw.rating.rtm.domain.migration.RateBookImporter
uses gw.rating.rtm.util.WebFileWrapper
uses gw.api.web.WebFile
uses java.io.FileInputStream
uses gw.rating.rtm.mock.MockWebFile
uses java.io.File
uses gw.api.system.PCLoggerCategory

@Export
class RateBookXMLImportUIHelper {
  var _importer : RateBookImporter as Importer
  var _importFile : WebFileWrapper as ImportFileWrapper
  var _testPath : String as TestPath
  var _errorLogs : String[] as ErrorLogs

  construct(importer : RateBookImporter, importFile : WebFileWrapper, testPath : String, errorLogs : String[]) {
    _importer = importer
    _importFile = importFile
    _testPath = testPath
    _errorLogs = errorLogs
  }

  //Creating a test import because tests will complain for unknown gosu/class if we use "doImport" for testFile.
  function doTestImport() {
    var book = Importer.import(getImportFile())
    if (book == null) {
      throw new gw.api.util.DisplayableException("The Rate Book being imported already exists")
    }
    pcf.RateBookDetail.go(book, true, Importer.getWarnings())
    return
  }

  /**
   * This code enables testing of the import feature. It checks if we are in 'Test' mode
   * and if so reads the path from a different widget (HIdden Input) that is accessible
   * to our smoke tests.
   */
  function doImport() {

    checkValidPath()
    if(!inTestMode()and Importer.isValidBeforeCommit(getImportFile())) {
      Importer.import()
      var book = Importer.ImportedBook
      if (book == null) {
        throw new gw.api.util.DisplayableException(displaykey.Web.Rating.Import.RateBookAlreadyExists)
      }
      pcf.RateBookDetail.go(book, true, Importer.getWarnings())
    } else {
      ErrorLogs = Importer.getPLLevelErrors()
      ErrorLogs.each(\ error -> PCLoggerCategory.RATING.error(error))
    }
  }

  private function checkValidPath() {
    if (TestPath.Empty and getImportFile() == null) {
      throw new gw.api.util.DisplayableException("Import file path is required")
    }
  }

  function getImportFile() : WebFile {
    return inTestMode() ? getTestFile() : ImportFileWrapper.File
  }

  private function inTestMode() : boolean {
    return ImportFileWrapper == null || ImportFileWrapper.File == null
  }

  private function getTestFile() : gw.api.web.WebFile {
    var is = new FileInputStream(new File(TestPath))
    return new MockWebFile(is)
  }

}