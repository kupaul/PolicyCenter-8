package gw.rating.worksheet.treenode.builder.populator

uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetVariable
uses java.lang.StringBuilder

@Export
class WorksheetVariablePopulator extends WorksheetOperandContainerPopulator<WorksheetVariable> {

  override function populateOperandAndValue(operandContainer : WorksheetVariable, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    operandBuilder.append((operandContainer.Type.HasContent) ? operandContainer.Type : operandContainer.Name)
    valueBuilder.append(super.localize(operandContainer))
  }
}
