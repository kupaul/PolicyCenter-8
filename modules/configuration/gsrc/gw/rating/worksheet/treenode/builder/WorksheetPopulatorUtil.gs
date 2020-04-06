package gw.rating.worksheet.treenode.builder
uses gw.rating.worksheet.treenode.builder.populator.WorksheetVariablePopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetSubroutinePopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetRateQueryPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetRateQueryParamPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetOperandContainerPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetObjectPropertyPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetNegationPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetFunctionPopulator

uses gw.rating.worksheet.domain.WorksheetOperandContainer
uses java.lang.StringBuilder
uses gw.rating.worksheet.domain.WorksheetArgument
uses gw.rating.worksheet.domain.WorksheetConstant
uses gw.rating.worksheet.domain.WorksheetFunction
uses gw.rating.worksheet.domain.WorksheetVariable
uses gw.rating.worksheet.domain.WorksheetRateQuery
uses gw.rating.worksheet.domain.WorksheetRateQueryParam
uses gw.rating.worksheet.domain.WorksheetNegation
uses gw.rating.worksheet.domain.WorksheetObjectProperty
uses gw.rating.worksheet.treenode.builder.populator.WorksheetArgumentPopulator
uses gw.rating.worksheet.treenode.builder.populator.WorksheetConstantPopulator
uses gw.rating.worksheet.domain.WorksheetInstanceSubroutine

@Export
abstract class WorksheetPopulatorUtil {

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
  static function populate(operandContainer : WorksheetOperandContainer, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    var populator : WorksheetOperandContainerPopulator
    switch (typeof operandContainer) {
      case WorksheetInstanceSubroutine:
        populator = new WorksheetSubroutinePopulator()   
        break
      case WorksheetArgument:
        populator = new WorksheetArgumentPopulator()         
        break
      case WorksheetConstant:
        populator = new WorksheetConstantPopulator()
        break
      case WorksheetFunction:
        populator = new WorksheetFunctionPopulator()
        break
      case WorksheetVariable:
        populator = new WorksheetVariablePopulator()
        break
      case WorksheetRateQuery:
        populator = new WorksheetRateQueryPopulator()
        break
      case WorksheetRateQueryParam:
        populator = new WorksheetRateQueryParamPopulator()
        break
      case WorksheetNegation:
        populator = new WorksheetNegationPopulator()
        break
      case WorksheetObjectProperty:
        populator = new WorksheetObjectPropertyPopulator()
        break
    }
    
    if (populator != null) {
      populator.populateOperandAndValue(operandContainer, operandBuilder, valueBuilder, displayArgumentValues)    
    }
  }

}
