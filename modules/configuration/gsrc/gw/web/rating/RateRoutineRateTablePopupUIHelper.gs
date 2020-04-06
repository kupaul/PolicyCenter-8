package gw.web.rating

uses gw.api.util.LocationUtil
uses gw.pcf.rating.flow.RateRoutineRateTablePopupHelper
uses gw.lang.reflect.IType
uses java.util.Set

@Export
class RateRoutineRateTablePopupUIHelper {

  public static function performValidation(operand : entity.CalcStepDefinitionOperand
          , popupHelper : RateRoutineRateTablePopupHelper
          , targetDataTypes : Set<IType>) : boolean {
    var validationMessages : String[]
    var tableValidation = operand.missingRateTable()
    if (tableValidation.NotBlank) {
      validationMessages = {tableValidation}
    } else {
      validationMessages = operand.mismatchingRateTableMatchops()
    }
    for (msg in validationMessages) {
      LocationUtil.addRequestScopedErrorMessage(msg)
    }
    if (not validationMessages.IsEmpty) {
      popupHelper.onTableChange(targetDataTypes)
    }
    return validationMessages.IsEmpty
  }
}