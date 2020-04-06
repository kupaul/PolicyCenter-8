package gw.rating.worksheet.treenode.builder
uses java.util.List
uses gw.rating.worksheet.treenode.builder.WorksheetTreeNodeBuilder
uses gw.rating.worksheet.domain.WorksheetSubroutine
uses gw.rating.worksheet.treenode.IWorksheetTreeNode

@Export
class WorksheetSubroutineTreeNodeBuilder extends WorksheetTreeNodeBuilder<WorksheetSubroutine> {
  
  override function build(entry : WorksheetSubroutine) : List<IWorksheetTreeNode> {
    return {}    
  }
}
