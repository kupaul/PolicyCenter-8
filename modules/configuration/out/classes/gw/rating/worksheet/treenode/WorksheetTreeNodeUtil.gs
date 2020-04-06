package gw.rating.worksheet.treenode
uses gw.rating.worksheet.treenode.builder.WorksheetSubroutineTreeNodeBuilder
uses gw.rating.worksheet.treenode.builder.WorksheetRoutineTreeNodeBuilder
uses gw.rating.worksheet.treenode.builder.WorksheetNoteTreeNodeBuilder
uses gw.api.tree.RowTreeRootNode
uses gw.rating.worksheet.treenode.builder.WorksheetTreeNodeBuilder
uses gw.rating.worksheet.treenode.builder.WorksheetCalculationTreeNodeBuilder
uses gw.rating.worksheet.treenode.builder.WorksheetConditionalTreeNodeBuilder
uses gw.rating.worksheet.domain.WorksheetEntry
uses gw.rating.worksheet.domain.WorksheetCalculation
uses gw.rating.worksheet.domain.WorksheetConditional
uses gw.rating.worksheet.domain.WorksheetNote
uses gw.rating.worksheet.domain.WorksheetRoutine
uses java.util.Collection
uses gw.rating.worksheet.WorksheetUtil
uses gw.rating.worksheet.domain.WorksheetInstanceSubroutine
uses gw.rating.worksheet.domain.WorksheetFunctionReturn
uses gw.rating.worksheet.treenode.builder.WorksheetFunctionReturnTreeNodeBuilder
uses gw.rating.worksheet.domain.WorksheetFunction
uses gw.rating.worksheet.domain.WorksheetEntryContainer
uses java.util.Map
uses gw.xml.parser2.PLXMLNode
uses gw.rating.worksheet.domain.Worksheet

@Export
class WorksheetTreeNodeUtil {

  /**
   * Build a RowTreeRootNode suitable for displaying the diagnostic worksheet(s) associated with the given policy lines
   * @param diagWorksheets A list of one or more DiagnosticRatingWorksheets for which we want a RowTreeRootNode
   * @return a row tree root node.
   */
  static function buildRootNodeForDiagWorksheets(diagWorksheets : Collection<DiagnosticRatingWorksheet>, showConditionals: boolean) : RowTreeRootNode {
    var treeNodes = diagWorksheets.where(\ w -> w.TextData != null).map(\ w -> buildTreeNode(w, showConditionals))

    return buildRootNode(treeNodes)
  }

  /**
   * Build a RowTreeRootNode suitable for displaying the worksheets from a collection of costs.
   * @param costs Collection of costs whose worksheets will be children in the RowTreeRootNode
   * @param showConditionals flag to indicate whether conditionals are displayed
   * @return a row tree root node.
   */
  static function buildRootNode(costs : Collection<Cost>, showConditionals: boolean) : RowTreeRootNode {
    var treeNodes = costs.map(\ c -> buildTreeNode(c, showConditionals)).where(\ ws -> ws != null)

    return buildRootNode(treeNodes)
  }

  /**
   * Build a RowTreeRootNode suitable for displaying the worksheets from a collection of costs.
   * @param beans Collection of beans whose worksheets will be children in the RowTreeRootNode
   * @param showConditionals flag to indicate whether conditionals are displayed
   * @return a row tree root node.
   */
  static function buildRootNode(beans : Map<EffDated, List<Worksheet>>, showConditionals : boolean) : RowTreeRootNode {
    var entries = beans.entrySet().orderBy(\ e -> e.Key.DisplayName)
    var treeNodes = entries.flatMap( \ e -> e.Value.map(\ ws -> buildTreeNode(ws, showConditionals)))

    return buildRootNode(treeNodes)
  }

  /**
   * Build a RowTreeRootNode suitable for displaying the worksheets from a list of WorksheetTreeNodeContainers.
   * @param treeNodes List of WoskheetTreeNodeContainers that will be children in the RowTreeRootNode
   * @return a row tree root node.
   */
  static function buildRootNode(treeNodes : List<WorksheetTreeNodeContainer>) : RowTreeRootNode {
    return new RowTreeRootNode(
            treeNodes,
            \ o -> (o typeis WorksheetTreeNodeContainer) ? o.Children : {},
            \ o -> (o typeis WorksheetTreeNodeContainer) ? o.ExpandByDefault : false)
  }

  /**
   * Build the worksheet treenodes associated to this cost's worksheet.
   * @param cost cost whose worksheet will be used to create its associated treenodes
   * @param showConditionals flag to indicate whether conditionals are displayed
   * @return a list of worksheet treenodes
   */
  static function buildTreeNodes(cost : Cost, showConditionals : boolean) : List<IWorksheetTreeNode> {
    var wsNode = (cost.BranchUntyped as PolicyPeriod).getWorksheetFor(cost)
    if (wsNode != null) {
      return buildTreeNodes(wsNode, showConditionals)
    }
    return {}
  }

  /**
   * Build the worksheet treenodes associated to this worksheet container.
   * @param worksheet worksheet cointainer used to create its associated treenodes
   * @param showConditionals flag to indicate whether conditionals are displayed
   * @return a list of worksheet treenodes
   */
  static function buildTreeNodes(worksheetContainer : WorksheetEntryContainer, showConditionals: boolean) : List<IWorksheetTreeNode> {
    return buildTreeNodes(worksheetContainer, showConditionals, true)
  }
  /**
   * Build the worksheet treenodes associated to this worksheet container.
   * @param worksheet worksheet cointainer used to create its associated treenodes
   * @param showConditionals flag to indicate whether conditionals are displayed
   * @param filterFunctionChildern flag to filter out children of worksheet functions
   * @return a list of worksheet treenodes
   */
  static function buildTreeNodes(worksheet : WorksheetEntryContainer, showConditionals: boolean, filterFunctionChildren : boolean) : List<IWorksheetTreeNode> {
    var treeNodes : List<IWorksheetTreeNode> = {}
    // removing entries that belong to a worksheet function as they will be expanded separately
    var worksheetEntries = worksheet.AllWorksheetEntries
    if (filterFunctionChildren) {
      worksheetEntries = worksheetEntries.where(\ entry ->
            entry.Parent == null or typeof entry.Parent != WorksheetFunction)
    }
    for (entry in worksheetEntries) {
      var builder = getWorksheetTreeNodeBuilder(entry, showConditionals)
      treeNodes.addAll(builder.build(entry))
    }
    return treeNodes
  }

  static function buildTreeNode(worksheet : WorksheetEntry, showConditionals : boolean) : WorksheetTreeNodeContainer {
    var worksheetNode = new WorksheetTreeNodeContainer(worksheet.Description)
    worksheetNode.addChildren(buildTreeNodes(worksheet, showConditionals))

    return worksheetNode
  }

  private static function buildTreeNode(ws : DiagnosticRatingWorksheet, showConditionals: boolean) : WorksheetTreeNodeContainer {
    return ws == null ? null : buildTreeNode(WorksheetUtil.deserialize(ws.TextData) as WorksheetEntry, showConditionals)
  }

  private static function buildTreeNode(cost : Cost, showConditionals : boolean) : WorksheetTreeNodeContainer {
    var worksheet = (cost.BranchUntyped as PolicyPeriod).getWorksheetFor(cost)
    return worksheet == null ? null : buildTreeNode(worksheet, showConditionals)
  }

  private static function getWorksheetTreeNodeBuilder(entry : WorksheetEntry, showConditionals: boolean) : WorksheetTreeNodeBuilder {
      switch (typeof entry) {
        case WorksheetCalculation:
          return new WorksheetCalculationTreeNodeBuilder()
        case WorksheetConditional:
          return new WorksheetConditionalTreeNodeBuilder(showConditionals)
        case WorksheetNote:
          return new WorksheetNoteTreeNodeBuilder()
        case WorksheetRoutine:
          return new WorksheetRoutineTreeNodeBuilder()
        case WorksheetInstanceSubroutine:
          return new WorksheetSubroutineTreeNodeBuilder()
        case WorksheetFunctionReturn:
          return new WorksheetFunctionReturnTreeNodeBuilder()
        default: throw "Unexpected WorksheetEntry type ${typeof entry}"
    }
  }

}
