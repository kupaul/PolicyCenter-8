package gw.exportimport

uses org.apache.poi.xssf.usermodel.XSSFWorkbook
uses org.apache.poi.xssf.usermodel.XSSFCellStyle
uses org.apache.poi.xssf.usermodel.XSSFColor
uses java.lang.IllegalStateException

/**
 * Class used to export KeyableBeans (in ExportData format) to Excel.
 */
@Export
class ExcelExporter extends ExcelExporterBase {

  //password to unprotect spreadsheet
  var _password : String as readonly SpreadSheetPassword = "1234"
  var _columnHeaderStyle : XSSFCellStyle as readonly ColumnHeaderStyle
  var _lockedDataStyle : XSSFCellStyle as readonly LockedDataStyle
  var _unlockedDataStyle : XSSFCellStyle as readonly UnlockedDataStyle

  construct(exportData : ExportData<? extends KeyableBean>) {
    this(exportData, null)
  }

  /**
   * @param data The ExportData
   * @param listener An optional RowProcessedListener
   */
  internal construct(exportData : ExportData<? extends KeyableBean>, listener : RowProcessedListener) {
    super(exportData, listener)
  }

  override function validateBeforeExport(template : boolean) {
    if (not template and Data.SpreadSheetVariables.get(ExportImportConstants.PERIOD_ID_EXCEL_VARIABLE) == null) {
      throw new IllegalStateException(displaykey.Import.Validation.FatalErrors.NoPeriodID)
    }
  }

  override function initStyles(workbook : XSSFWorkbook) {
    //set cell format to text
    var format = workbook.createDataFormat().getFormat("@")

    //locked cell format
    _columnHeaderStyle = workbook.createCellStyle()
    _columnHeaderStyle.Locked = true
    _columnHeaderStyle.setDataFormat(format)

    //unlocked cell format
    _unlockedDataStyle = workbook.createCellStyle()
    _unlockedDataStyle.Locked = false
    _unlockedDataStyle.setDataFormat(format)

    //locked data cell format
    var italicFont = workbook.createFont()
    italicFont.Italic = true
    _lockedDataStyle = workbook.createCellStyle()
    _lockedDataStyle.Locked = true
    _lockedDataStyle.setFont(italicFont)
    var lockedColor = new XSSFColor(new java.awt.Color(230, 230, 230))
    _lockedDataStyle.setFillForegroundColor(lockedColor)
    _lockedDataStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND)
    _lockedDataStyle.setDataFormat(format)
  }

  override function sheetName(type : Type) : String {
    var name = ExportLocaleUtil.lookupEntityTypeDisplayName(type)
    return org.apache.poi.ss.util.WorkbookUtil.createSafeSheetName(name)
  }
}