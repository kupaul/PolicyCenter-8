package gw.rating

uses gw.rating.worksheet.domain.WorksheetEntryContainer
uses gw.rating.worksheet.domain.WorksheetEntry
uses java.util.LinkedList

@Export
class NoCostWorksheetContainer implements WorksheetEntryContainer{

  var _entries : List<WorksheetEntry> as WorksheetEntries = new LinkedList<WorksheetEntry>() // optimize for append

}
