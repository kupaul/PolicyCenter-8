package gw.rating.worksheet.treenode.builder

uses gw.plugin.rateflow.ICostDataWrapper
uses gw.rating.flow.util.TypeMaps
uses gw.rating.worksheet.domain.WorksheetArgument
uses gw.rating.worksheet.domain.WorksheetCalculation
uses gw.rating.worksheet.domain.WorksheetFunction
uses gw.rating.worksheet.domain.WorksheetOperand
uses gw.rating.worksheet.treenode.IWorksheetTreeNode
uses gw.rating.worksheet.treenode.WorksheetTreeNodeContainer
uses gw.rating.worksheet.treenode.WorksheetTreeNodeLeaf
uses gw.rating.worksheet.treenode.WorksheetTreeNodeUtil

uses java.lang.StringBuilder
uses java.util.List


@Export
class WorksheetCalculationTreeNodeBuilder extends WorksheetTreeNodeBuilder<WorksheetCalculation> {
  
  override function build(entry : WorksheetCalculation) : List<IWorksheetTreeNode> {
    var results : List<IWorksheetTreeNode> = {}
    var node = new WorksheetTreeNodeLeaf()
    
    if (entry.StorePropertyName.HasContent) {
      // calculation is stored in a object property if StorePropertyName has content 
      if (isCostDataCalculation(entry)) {
        node.Instruction = entry.StorePropertyName  
      } else {
        node.Instruction = "${entry.StoreObjectName}.${entry.StorePropertyName}"
      }
    } else {
      node.Instruction = entry.StoreLocation
    }
    
    results.add(node)
    var roundingFunction : WorksheetFunction
    for (operand in entry.WorksheetOperands index i) {
      var worksheetOperands: List<WorksheetOperand>
      
      if (operand typeis WorksheetFunction and operand.Type == "Rounding") {
        roundingFunction = operand
        //the operands to parse and display are contained in the rounding function's first argument
        worksheetOperands = operand.WorksheetOperands.get(0).WorksheetOperands
      } else {
        worksheetOperands = {operand}
      }
         
      if (i == 0) {
          // the first operand is displayed on the same row as the worksheet calculation
          node.Result = entry.Result
          node.Operator = getOperatorForDisplay(null)
          var additionalNodes = populate(worksheetOperands.first(), node)
          results.addAll(additionalNodes)
          results.addAll(createOperandTreeNodes(worksheetOperands.subList(1, worksheetOperands.Count)))
        } else {
          // all others are displayed on a new row
          results.addAll(createOperandTreeNodes(worksheetOperands))
        }
    }
    // rounding is always the last step
    if (roundingFunction != null) {
      var roundingNode = new WorksheetTreeNodeLeaf()
      populateRoundingNode(roundingFunction, roundingNode)
      results.add(roundingNode)      
    }
    return results
  }
  
  function createOperandTreeNodes(worksheetOperands : List<WorksheetOperand>) : List<IWorksheetTreeNode> {
    var results : List<IWorksheetTreeNode> = {}
    worksheetOperands.each(\ worksheetOperand -> {
      var operandNode = new WorksheetTreeNodeLeaf()
      operandNode.Operator = getOperatorForDisplay(worksheetOperand.Operator)
      var additionalNodes = populate(worksheetOperand, operandNode)
      results.add(operandNode)
      results.addAll(additionalNodes)
    })
    return results       
  }

  //TODO: Should recode so that the writer does not put the text to the
  //  worksheet data, but the type instead
  function populateRoundingNode(operand : WorksheetFunction, roundingNode : WorksheetTreeNodeLeaf) {
    // scale and mode are stored as the rating function's 2nd and 3rd argument
    var scale = operand.WorksheetOperands.get(1) as WorksheetArgument
    roundingNode.Operand = scale.Value.toString() 
    roundingNode.OperandValue = operand.Value.toString()
    roundingNode.Operator = getRoundingModeOperator(operand.WorksheetOperands.get(2).Value as RoundingModeType)
  }
  
  function populate(operand : WorksheetOperand, node : WorksheetTreeNodeLeaf) : List<IWorksheetTreeNode> {
    var additionalNodes : List<IWorksheetTreeNode> = {}
    node.OperandValue = operand.Value
    node.LeftParentheses = operand.LeftParentheses
    node.RightParentheses = operand.RightParentheses
    
    var operandBuilder = new StringBuilder()
    var valueBuilder = new StringBuilder()
    WorksheetPopulatorUtil.populate(operand, operandBuilder, valueBuilder, true)
    node.Operand = operandBuilder.toString()
    node.OperandValue = valueBuilder.toString()
    
    if (operand typeis WorksheetFunction and operand.AllWorksheetEntries.Count > 0) {
      // create expansion node for function
      var functionNode = createFunctionExpansionTreeNodeContainer(operand, operandBuilder)
      additionalNodes.add(functionNode)
    }
    return additionalNodes
  }
  
  private function createFunctionExpansionTreeNodeContainer(functionOperand : WorksheetFunction, operandBuilder : StringBuilder) : WorksheetTreeNodeContainer {
    var functionExpansionLabel = displaykey.Web.Policy.RatingWorksheet.Node.FunctionExpansionLabel(operandBuilder.toString())
    var functionIndicator = displaykey.Web.Policy.RatingWorksheet.Node.FunctionExpansionIndicator
    var functionNode = new WorksheetTreeNodeContainer(functionExpansionLabel)
    var children = WorksheetTreeNodeUtil.buildTreeNodes(functionOperand, false, false)
    children.each(\ c -> {
      switch (typeof c) {
        case WorksheetTreeNodeContainer:
          if (c.Description.HasContent) {
            c.Description = "${functionIndicator} ${c.Description}"
          } else {
            c.Description = "${functionIndicator} "  
          }
          break
        case WorksheetTreeNodeLeaf:
          if (c.Instruction.HasContent) {
            c.Instruction = "${functionIndicator} ${c.Instruction}"
          } else {
            c.Instruction = "${functionIndicator} "
          }
          break
      }
    })
    functionNode.addChildren(children)
    // add line break
    functionNode.addChild(new WorksheetTreeNodeContainer())
    return functionNode 
  }
  
  private function isCostDataCalculation(entry : WorksheetCalculation) : boolean {
    return ICostDataWrapper.Type.isAssignableFrom(TypeMaps.parseType(entry.StoreObjectType))
  }
}
