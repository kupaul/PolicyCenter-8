package gw.rating.worksheet.treenode.builder.populator

uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetConstant
uses java.lang.StringBuilder

@Export
class WorksheetConstantPopulator extends WorksheetOperandContainerPopulator<WorksheetConstant> {

  override function populateOperandAndValue(operandContainer : WorksheetConstant, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    var localizedOperandValue = super.localize(operandContainer)
    operandBuilder.append(localizedOperandValue)
    valueBuilder.append(localizedOperandValue)
  }
}
