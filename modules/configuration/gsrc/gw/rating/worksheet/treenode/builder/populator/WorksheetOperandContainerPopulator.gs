package gw.rating.worksheet.treenode.builder.populator

uses gw.rating.worksheet.domain.WorksheetOperandContainer
uses java.lang.StringBuilder
uses gw.rating.worksheet.domain.WorksheetOperand
uses java.math.BigDecimal
uses java.lang.Double
uses java.lang.Float
uses gw.api.util.NumberUtil

@Export
abstract class WorksheetOperandContainerPopulator<T extends WorksheetOperandContainer> {

  /**
   * Populates the given operandBuilder and valueBuilder to represent the given WorksheetOperandContainer. 
   * This may call a sequence of WorksheetOperandContainerPopulator to populate the results of operandBuilder 
   * and valueBuilder.
   * @param operandContainer the WorksheetOperandContainer to capture
   * @param operandBuilder the StringBuilder to populate the Operand field of a worksheet treenode
   * @param valueBuilder the StringBuilder to populate the OperandValue field of a worksheet treenode
   * @param displayArgumentValues flag to indicate whether each individual argument is displayed
   * 
   */
  abstract function populateOperandAndValue(operandContainer : T, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean)
  
  protected function localize(operandContainer: WorksheetOperand) : String{
    var operandValue = operandContainer.Value
    if (operandValue == null) {
      return null
    }
    if (operandValue typeis BigDecimal or operandValue typeis Double or operandValue typeis Float) {
      return NumberUtil.renderForInput(operandValue as Number, false)
    }
    return operandValue.toString()
  }
}
