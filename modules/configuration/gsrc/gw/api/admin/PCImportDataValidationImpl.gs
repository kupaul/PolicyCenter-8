package gw.api.admin
uses gw.admin.FormPatternValidation
uses entity.KeyableBean
uses gw.lang.Export
uses typekey.ValidationLevel
uses entity.FormPattern
uses gw.api.admin.PCImportDataValidation
uses gw.validation.ValidationUtil
uses gw.admin.PolicyHoldValidation

@Export
class PCImportDataValidationImpl implements PCImportDataValidation {
  
  override function validate(bean : KeyableBean) {
    if (FormPattern.Type.isAssignableFrom(typeof bean)) {
      var context = ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
      var validator = new FormPatternValidation(context, bean as FormPattern)
      validator.validate() 
      context.raiseExceptionIfProblemsFound()  
    } else if (PolicyHold.Type.isAssignableFrom(typeof bean)) {
      var context = ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
      var validator = new PolicyHoldValidation(context, bean as PolicyHold)
      validator.validate() 
      context.raiseExceptionIfProblemsFound()  
    }
  }

  /**
   * This validation raises an exception (via context) on first validation error
   * So this should never return true
   */
  override function hasErrors() : boolean {
    return false
  }

}
