package gw.rating.worksheet.treenode
uses java.lang.Object
uses java.lang.String

@Export
/**
 * A leaf in a worksheet tree
 */
class WorksheetTreeNodeLeaf implements IWorksheetTreeNode {
  
  var _instruction : String as Instruction
  var _result : Object as Result
  var _op : String as Operator
  var _operand : String as Operand
  var _operandValue : Object as OperandValue
  var _leftParens : int as LeftParentheses
  var _rightParens : int as RightParentheses
  
  property get LeftParenthesesGroup() : String {
    return "(".repeat(LeftParentheses)
  }
  
  property get RightParenthesesGroup() : String {
    return ")".repeat(RightParentheses)
  }
  
}
