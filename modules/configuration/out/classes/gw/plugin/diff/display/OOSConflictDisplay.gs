package gw.plugin.diff.display

uses gw.diff.tree.DiffTree
uses java.util.ArrayList
uses gw.api.diff.DiffItem
uses gw.api.diff.node.IDiffTreeNode
uses gw.api.diff.node.TitleDiffTreeNode
uses gw.api.system.PCConfigParameters
uses gw.api.util.StringUtil
uses gw.api.diff.node.IDiffItemTreeNode

/**
 * Represents a set of OOS Conflict differences for display in the UI.
 */
@Export
class OOSConflictDisplay {
  var _policyPeriod : PolicyPeriod
  var _diffTreeConfig : String
  var _diffTree : DiffTree
  var _sourceDiffs : List<DiffItem>
  
  construct(policyPeriod : PolicyPeriod, diffItems : List<DiffItem>) {
    _policyPeriod = policyPeriod
    _diffTreeConfig = policyPeriod.Policy.Product.DiffTreeConfig
    _diffTree = new DiffTree(diffItems, _diffTreeConfig, null)
    _sourceDiffs = diffItems
  }

  property get ConflictNodes() : List<IDiffItemTreeNode> {
    var allNodes = createFormattedConflictNodes()
    var unformattedNodes = createUnformattedConflictNodes(allNodes.map(\ node -> node.DiffItem))
    allNodes.addAll(unformattedNodes)
    return allNodes
  }
  
  /**
   * @return a list of {@link ConflictInfo} nodes containing information for presenting a human readable set of OOS Conflicts
   */
  function listConflicts() : List<ConflictInfo> {
    var formattedNodes = createFormattedConflictNodes()
    var allConflicts = formattedNodes.map( \ node -> getConflictInfo(node, true))
    var unformattedNodes = createUnformattedConflictNodes(formattedNodes.map(\ node -> node.DiffItem))
    allConflicts.addAll(unformattedNodes.map(\ node -> getConflictInfo(node, false)))
    return allConflicts
  }

  private function getConflictInfo(node : IDiffItemTreeNode, useDiffTree : boolean) : ConflictInfo {
    var diffItem = node.DiffItem
    var conflictVersions = diffItem.asProperty().getOOSConflictingVersions()
    var effDateDisplay = conflictVersions.map(\ bean -> StringUtil.formatDate(bean.EffectiveDate, PCConfigParameters.DefaultDiffDateFormat.Default)).join("; ")
    var prop = diffItem.asProperty().PropertyInfo
    var conflictDisplay : String
    if (useDiffTree){
      conflictDisplay = conflictVersions.map(\ conflict -> formatString(_diffTree.getPropertyValueAsString(conflict, prop))).join("; ")  
    } else {
      conflictDisplay = conflictVersions.map(\ conflict -> formatString(prop.Accessor.getValue(conflict) as String)).join("; ")  
    }
    return new ConflictInfo(conflictDisplay, effDateDisplay, node)
  }

  function getToolTip(node : IDiffTreeNode) : String {
    var path = new ArrayList<String>()
    while (node.Parent != null) {
      if (!(node typeis TitleDiffTreeNode)) { 
        path.add(0, node.Parent.Label)
      }
      node = node.Parent
    }
    return path.join("\n")
  }
  
  private function createFormattedConflictNodes() : List<IDiffItemTreeNode>{
    return _diffTree.getDiffItemDiffTreeNodes(_diffTree.RootNode, new ArrayList<IDiffItemTreeNode>())
  }
  
  private function createUnformattedConflictNodes(formattedDiffItems : List<DiffItem>) : List<IDiffItemTreeNode> {
    var diffs = new ArrayList<DiffItem>(_sourceDiffs)
    for (aNode in formattedDiffItems){
      diffs.remove(aNode)
    }
    var nodes = new ArrayList<IDiffItemTreeNode>()
    for (otherDiff in diffs){
      var effDate : java.util.Date = null
      var beanEffDate = otherDiff.EffDatedBean.EffectiveDate
      if (beanEffDate != _policyPeriod.EditEffectiveDate){
        effDate = beanEffDate
      }
      nodes.add(new DefaultConflictDisplayNode(otherDiff, effDate))
    }
    return nodes
  }

  /**
   * Format a null value as the empty string.
   */
  function formatString(text : String) : String {
    if (text == null) {
      return "";
    } else {
      return text;
    } 
  }  

  /**
   * Class for presenting DiffNodes.
   */
  class ConflictInfo {
    var _conflictDisplay : String
    var _conflictEffDate : String
    var _node : IDiffItemTreeNode
    
    construct(display : String, effDate : String, aNode : IDiffItemTreeNode) {
      _conflictDisplay = display
      _conflictEffDate = effDate
      _node = aNode
    }
    
    property get Node() : IDiffItemTreeNode {
      return _node
    }
    
    property get ConflictDisplay() : String {
      return _conflictDisplay
    }    
    
    property get ConflictEffDate() : String {
      return _conflictEffDate
    }
  }
}
