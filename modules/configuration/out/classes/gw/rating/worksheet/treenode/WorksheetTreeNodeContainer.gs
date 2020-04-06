package gw.rating.worksheet.treenode

@Export
/**
 * Parent of a worksheet treenode. Can also be used as a label when WorksheetTreeNodeContainer
 * includes a description and no children.
 */
class WorksheetTreeNodeContainer implements IWorksheetTreeNode {

  var _desc : String as Description
  var _children : List<IWorksheetTreeNode> as Children = {}
  var _expand : boolean as ExpandByDefault
  
  construct() {
    
  }

  construct(d : String) {
    _desc = d
  }
  
  /**
   * Adds a worksheet treenode child to this container.
   * @param child treenode to add
   */
  function addChild(child : IWorksheetTreeNode) {
    _children.add(child)  
  }

  /**
   * Adds a list of worksheet treenodes to this container.
   * @param children treenodes to add
   */  
  function addChildren(c : List<IWorksheetTreeNode>) {
    _children.addAll(c)  
  }

  /**
   * Removes a worksheet treenode child from this container.
   * @param child treenode to remove
   */  
  function removeChild(child : IWorksheetTreeNode) {
    _children.remove(child)  
  }

  /**
   * Removes a list of worksheet treenodes from this container.
   * @param children treenodes to remove
   */  
  function removeChildren(c : List<IWorksheetTreeNode>) {
    _children.removeAll(c)  
  }
}
