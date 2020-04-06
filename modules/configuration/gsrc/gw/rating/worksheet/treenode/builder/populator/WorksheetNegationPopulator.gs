package gw.rating.worksheet.treenode.builder.populator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.treenode.builder.WorksheetPopulatorUtil
uses gw.rating.worksheet.domain.WorksheetOperand
uses java.lang.StringBuilder
uses gw.rating.worksheet.domain.WorksheetNegation

@Export
class WorksheetNegationPopulator extends WorksheetOperandContainerPopulator<WorksheetNegation> {

  override function populateOperandAndValue(operandContainer : WorksheetNegation, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    operandBuilder.append("not ")
    valueBuilder.append(super.localize(operandContainer))
    WorksheetPopulatorUtil.populate(operandContainer.WorksheetOperands.single(), operandBuilder, new StringBuilder(), displayArgumentValues)
  }

}
