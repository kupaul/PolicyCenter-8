package gw.rating.worksheet.treenode.builder.populator
uses gw.rating.worksheet.treenode.builder.WorksheetPopulatorUtil
uses gw.rating.worksheet.domain.WorksheetOperand
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetFunction
uses java.lang.StringBuilder

@Export
class WorksheetFunctionPopulator extends WorksheetOperandContainerPopulator<WorksheetFunction> {

  override function populateOperandAndValue(operandContainer : WorksheetFunction, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    operandBuilder.append(operandContainer.Name)
    operandBuilder.append("(")

    if (isMinFunction(operandContainer) or isMaxFunction(operandContainer)) {
      operandBuilder.append(operandContainer.ObjectName)
      operandBuilder.append(", ")
      WorksheetPopulatorUtil.populate(operandContainer.WorksheetOperands.single(), operandBuilder, new StringBuilder(), false)
    } else {
      for (op in operandContainer.WorksheetOperands index i) {
        WorksheetPopulatorUtil.populate(op, operandBuilder, new StringBuilder(), false)
        if (i < operandContainer.WorksheetOperands.Count - 1) {
          operandBuilder.append(", ")  
        }
      }
    }
    operandBuilder.append(")")
    
    if (displayArgumentValues) {
      valueBuilder.append(operandContainer.Name)
      valueBuilder.append("(")
      if (isMinFunction(operandContainer) or isMaxFunction(operandContainer)) {
        valueBuilder.append(operandContainer.ObjectValue)
        valueBuilder.append(", ")
        WorksheetPopulatorUtil.populate(operandContainer.WorksheetOperands.single(), new StringBuilder(), valueBuilder, false) 
      } else {
        for (op in operandContainer.WorksheetOperands index i) {
          WorksheetPopulatorUtil.populate(op, new StringBuilder(), valueBuilder, false)
          if (i < operandContainer.WorksheetOperands.Count - 1) {
            valueBuilder.append(", ")  
          }
        }
      }
      valueBuilder.append(") = ${super.localize(operandContainer)}")
    } else {
      valueBuilder.append(super.localize(operandContainer))
    }
  }
  
  private function isMinFunction(worksheetFunction : WorksheetFunction) : boolean {
    var functionName = worksheetFunction.Name
    var className = worksheetFunction.ClassName
    return "min" == functionName and className == "java.math.BigDecimal"
  }
  
  private function isMaxFunction(worksheetFunction : WorksheetFunction) : boolean {
    var functionName = worksheetFunction.Name
    var className = worksheetFunction.ClassName
    return "max" == functionName and className == "java.math.BigDecimal"
  }
  
}
