package gw.rating.worksheet.treenode.builder.populator
uses gw.rating.worksheet.domain.WorksheetOperand
uses gw.rating.worksheet.treenode.builder.WorksheetPopulatorUtil
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetSubroutine
uses java.lang.StringBuilder

@Export
class WorksheetSubroutinePopulator extends WorksheetOperandContainerPopulator<WorksheetSubroutine>  {

  override function populateOperandAndValue(operandContainer : WorksheetSubroutine, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    operandBuilder.append(operandContainer.FunctionName)
    operandBuilder.append("(")
    for (op in operandContainer.WorksheetOperands index i) {
      WorksheetPopulatorUtil.populate(op, operandBuilder, new StringBuilder(), displayArgumentValues)
      if (i < operandContainer.WorksheetOperands.Count - 1) {
        operandBuilder.append(", ")  
      }
    }
    operandBuilder.append(")")
    if (displayArgumentValues) {
      valueBuilder.append(operandContainer.FunctionName)
      valueBuilder.append("(")
      for (op in operandContainer.WorksheetOperands index i) {
        WorksheetPopulatorUtil.populate(op, new StringBuilder(), valueBuilder, displayArgumentValues)
        if (i < operandContainer.WorksheetOperands.Count - 1) {
          valueBuilder.append(", ")  
        }
      }
      valueBuilder.append(")")
    }   
  }

}
