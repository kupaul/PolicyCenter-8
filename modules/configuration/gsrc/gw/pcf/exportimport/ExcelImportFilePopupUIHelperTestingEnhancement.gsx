package gw.pcf.exportimport

uses gw.exportimport.ExcelImporter
uses gw.api.web.job.JobWizardHelper

/**
* The methods provided by this enhancement are designed for use by smoke tests and are not expected to be a part
* of normal UI operation
**/
enhancement ExcelImportFilePopupUIHelperTestingEnhancement: gw.pcf.exportimport.ExcelImportFilePopupUIHelper {

  function importSynchronously(jobWizardHelper : JobWizardHelper) {
    var importer = new ExcelImporter()
    this.ValidationResult = importer.import(this.getImportStream(), this.Period)
    this.displayResults(jobWizardHelper)
    this.IsImported = true
    this.Waiting = false
  }

}
