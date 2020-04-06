package gw.rating.worksheet.treenode.builder.populator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetArgument
uses java.lang.StringBuilder
uses gw.rating.worksheet.treenode.builder.WorksheetPopulatorUtil

@Export
class WorksheetArgumentPopulator extends WorksheetOperandContainerPopulator<WorksheetArgument> {

  override function populateOperandAndValue(operandContainer : WorksheetArgument, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    var op = operandContainer.WorksheetOperands.first()
    if (op != null) {
      WorksheetPopulatorUtil.populate(op, operandBuilder, valueBuilder, displayArgumentValues)
    } else {
      operandBuilder.append(operandContainer.Name)  
      valueBuilder.append(super.localize(operandContainer))
    }
  }

}
