package gw.rating.worksheet.treenode.builder.populator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.domain.WorksheetRateQueryParam
uses java.lang.StringBuilder

@Export
class WorksheetRateQueryParamPopulator extends WorksheetOperandContainerPopulator<WorksheetRateQueryParam>  {

  override function populateOperandAndValue(operandContainer : WorksheetRateQueryParam, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    operandBuilder.append(operandContainer.Name)
    valueBuilder.append(super.localize(operandContainer))
  }

}
