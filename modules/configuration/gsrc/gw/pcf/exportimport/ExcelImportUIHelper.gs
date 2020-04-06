package gw.pcf.exportimport

uses gw.rating.rtm.util.WebFileWrapper
uses pcf.api.Location
uses pcf.RateTableFactorList
uses gw.rating.rtm.excel.ExcelPopulator
uses gw.api.web.WebFile
uses gw.api.util.DisplayableException
uses gw.rating.rtm.domain.RateTableFactorListController

@Export
class ExcelImportUIHelper {

  /**
   * This code enables testing of the import feature. It checks if we are in 'Test' mode
   * and if so reads the path from a different widget (HIdden Input) that is accessible
   * to our smoke tests.
   */
  function doImport(testPath : String, excelFile : WebFileWrapper, rateTable : RateTable) : Location {
    checkValidPath(testPath, excelFile)
    var populator = createPopulator(testPath, excelFile)
    validateStructure(populator, rateTable)
    var controller = createController(populator)
    return RateTableFactorList.go(controller, rateTable, rateTable.RateBook)
  }

  private function checkValidPath(testPath : String, excelFile : WebFileWrapper) {
    if (testPath.Empty and excelFile.File == null) {
      throw new gw.api.util.DisplayableException("Import file path is required")
    }
  }

  private function createPopulator(testPath : String, excelFile : WebFileWrapper) : ExcelPopulator {
    var importFile = inTestMode(excelFile) ? getTestFile(testPath) : getImportFile(excelFile)
    return gw.rating.rtm.excel.ExcelPopulator.create(importFile.InputStream)
  }

  private function inTestMode(excelFile : WebFileWrapper) : boolean {
    return excelFile.File == null
  }

  private function getTestFile(testPath : String) : WebFile {
    var is = new java.io.FileInputStream(new java.io.File(testPath))
    return new gw.rating.rtm.mock.MockWebFile(is)
  }

  private function getImportFile(excelFile : WebFileWrapper) : WebFile {
    return excelFile.File
  }

  private function validateStructure(populator : ExcelPopulator, rateTable : RateTable) {
    if (!populator.isCompatibleTable(rateTable)) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.IncompatibleExcelFile(rateTable.Definition.TableName))
    }
  }

  private function createController(populator : ExcelPopulator) : RateTableFactorListController {
    return gw.rating.rtm.domain.RateTableFactorListController.createExcelBasedController(populator)
  }
}
