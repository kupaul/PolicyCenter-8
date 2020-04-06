package gw.rating.worksheet.treenode.builder
uses java.util.List
uses gw.rating.worksheet.treenode.builder.WorksheetTreeNodeBuilder
uses gw.rating.worksheet.domain.WorksheetNote
uses gw.rating.worksheet.treenode.IWorksheetTreeNode
uses gw.rating.worksheet.treenode.WorksheetTreeNodeContainer

@Export
class WorksheetNoteTreeNodeBuilder extends WorksheetTreeNodeBuilder<WorksheetNote> {
  
  override function build(entry : WorksheetNote) : List<IWorksheetTreeNode> {
    // notes are displayed as a tree node container with no children and
    // with the note as the desciption
    var results : List<IWorksheetTreeNode> = {}
    var noteNode = new WorksheetTreeNodeContainer(entry.Description)
    results.add(noteNode)  
    return results
  }
}
