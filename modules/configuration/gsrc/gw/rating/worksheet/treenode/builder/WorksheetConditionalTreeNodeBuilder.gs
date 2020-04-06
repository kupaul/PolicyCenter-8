package gw.rating.worksheet.treenode.builder
uses gw.rating.worksheet.domain.WorksheetOperator
uses java.util.List
uses gw.rating.worksheet.treenode.builder.WorksheetTreeNodeBuilder
uses gw.rating.worksheet.treenode.WorksheetTreeNodeLeaf
uses java.lang.StringBuilder
uses gw.rating.worksheet.domain.WorksheetConditional
uses gw.rating.worksheet.domain.WorksheetOperand

@Export
class WorksheetConditionalTreeNodeBuilder extends WorksheetTreeNodeBuilder<WorksheetConditional> {
  var _showConditionals : boolean
  
  construct() {
    this(false)
  }
  
  construct(showConditionals: boolean) {
    _showConditionals = showConditionals
  }
  
  override function build(entry : WorksheetConditional) : List<WorksheetTreeNodeLeaf> {
    // skip if we are not displaying conditionals
    if (not _showConditionals) {
      if (WorksheetConditional.ConditionalType.AllValues.contains(entry.Type)) {
        return {}
      }
    }
    
    var results : List<WorksheetTreeNodeLeaf> = {}
    var node = new WorksheetTreeNodeLeaf() {
      :Instruction = entry.Type.NodeName.toUpperCase(),
      :Result = entry.Result
    }
        
    if (entry.Type == EndIfCondition) {
     node.Result = null 
    }
    
    // all operands of a conditional will be displayed on the same row of the Operand column
    var operandBuilder = new StringBuilder()
    var valueBuilder = new StringBuilder()    
    for (operand in entry.WorksheetOperands index i) {
      if (operand.Operator != null and i > 0) {
        operandBuilder.append(" ${getOperatorForDisplay(operand.Operator)} ")
        valueBuilder.append(" ${getOperatorForDisplay(operand.Operator)} ")    
      }
      WorksheetPopulatorUtil.populate(operand, operandBuilder, valueBuilder, false)      
    }  
    node.OperandValue = valueBuilder.toString()
    node.Operand = operandBuilder.toString()
    results.add(node)       
    
    // add ellipsis to indicate a conditional's path was not taken and omitted
    if (entry.Result == false and entry.Type != EndIfCondition) {
      var moreNode = new WorksheetTreeNodeLeaf() {
        :Operand = "..."  
      }
      results.add(moreNode) 
    }
    
    return results
  }
  
}
