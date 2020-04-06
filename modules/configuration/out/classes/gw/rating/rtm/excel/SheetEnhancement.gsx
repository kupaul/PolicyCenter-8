package gw.rating.rtm.excel
uses org.apache.poi.xssf.usermodel.XSSFSheet

enhancement SheetEnhancement : XSSFSheet {

  property get ColumnCount() : int {
    return this.getRow(ExcelHeader.HeaderEndRowIndex).LastCellNum
  }

  property get nonDisplayColumnCount() : int {
    var total = ColumnCount
    for (cell in this.getRow(ExcelHeader.HeaderEndRowIndex).cellIterator()) {
      if (cell.CellComment.String.String != null and cell.CellComment.String.String.contains(displaykey.Web.Rating.Export.DisplayOnly)) {
        total--
      }
    }
    return total
  }

  property get Styles() : ExcelStyles {
    return ExcelStyles.getInstance(this.Workbook)
  }

  property get ExcelHeader() : ExcelHeader {
    return ExcelHeader.getInstance()
  }
}
