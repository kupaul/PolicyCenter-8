package gw.validation

uses gw.api.validation.ValidationIssue
uses gw.api.validation.ValidationResult

/**
 * Defines methods that make it easier to work with ValidationResult from Platform 
 * within PolicyCenter.
 */
@Export
class PCValidationResult extends ValidationResult {
  
  /**
   * Adds an error at the loadsave level with the format "bean.DisplayName: reason".
   *
   * @param bean
   * @param reason
   */
  function addInvariantError(bean : KeyableBean, reason : String) {
    addError(bean, "loadsave", displaykey.Java.Invariant.ErrorMessage(bean.DisplayName, reason))
  }

  /**
   * Adds an error message associated with a field on the given keyable bean as defined by the relativeFieldPath. 
   * This method will result in a link to the Wizard step with the ID flowStepId if that is not the current step.
   * 
   * @param problematicBean    The entity that is the most likely source of the problem
   * @param level              The validation level associated with this problem
   * @param reason             A description of the problem to be displayed to users
   * @param wizardStepId       The ID of the Wizard step where the problem can be rectified
   */
  function addError(problematicBean : KeyableBean, level : ValidationLevel, reason : String, wizardStepId : String) {
    reject(problematicBean.ID, null, null, level, appendSliceDate(problematicBean, reason), null, null, wizardStepId)
  }

  /**
   * Override #addError(KeyableBean, ValidationLevel, String) to wrap the reason with a slice date using 
   * #appendSliceDate(problematicBean : KeyableBean, reason : String)
   */
  override function addError(bean : KeyableBean, errorLevel : ValidationLevel, errorReason : String) {
    super.addError(bean, errorLevel, appendSliceDate(bean, errorReason))
  }

  /**
   * Adds an error message associated with a field on the given keyable bean as defined by the relativeFieldPath.
   * This method will result in a link to the Wizard step with the ID flowStepId if that is not the current step.
   * 
   * @param problematicBean    The entity that is the most likely source of the problem
   * @param fieldPath          The path relative to problematicBean to the field that must be changed to solve the problem
   * @param level              The validation level associated with this problem
   * @param reason             A description of the problem to be displayed to users
   * @param wizardStepId         The ID of the Wizard step where the problem can be rectified
   */
  function addFieldError(problematicBean : KeyableBean, fieldPath : String, level : ValidationLevel, reason : String, wizardStepId : String) {
    reject(problematicBean.ID, null, fieldPath, level, appendSliceDate(problematicBean, reason), null, null, wizardStepId)
  }

  /**
   * Adds an warning message associated with a field on the given keyable bean as defined by the relativeFieldPath.
   * This method will result in a link to the Wizard step with the ID flowStepId if that is not the current step.
   * 
   * @param problematicBean    The entity that is the most likely source of the problem
   * @param level              The validation level associated with this problem
   * @param reason             A description of the problem to be displayed to users
   * @param wizardStepId         The ID of the Wizard step where the problem can be rectified
   */
  function addWarning(problematicBean : KeyableBean, level : ValidationLevel, reason : String, wizardStepId : String) {
    reject(problematicBean.ID, null, null, null, null, level, appendSliceDate(problematicBean, reason), wizardStepId)
  }

  /**
   * Adds an warning message associated with a field on the given keyable bean as defined by the relativeFieldPath.
   * This method will result in a link to the Wizard step with the ID flowStepId if that is not the current step.
   * 
   * @param problematicBean    The entity that is the most likely source of the problem
   * @param fieldPath          The path relative to problematicBean to the field that must be changed to solve the problem
   * @param level              The validation level associated with this problem
   * @param reason             A description of the problem to be displayed to users
   * @param wizardStepId         The ID of the Wizard step where the problem can be rectified
   */
  function addFieldWarning(problematicBean : KeyableBean, fieldPath : String, level : ValidationLevel, reason : String, wizardStepId : String) {
    reject(problematicBean.ID, null, fieldPath, null, null, level, appendSliceDate(problematicBean, reason), wizardStepId)
  }

  /**
   * Append the slice date to the reason if the slice date isn't the EditEffectiveDate
   * of the branch
   */
  function appendSliceDate(problematicBean : KeyableBean, reason : String) : String {
    if (problematicBean typeis EffDated) {
      var policyPeriod = problematicBean.BranchUntyped as PolicyPeriod
      if (problematicBean.Slice && policyPeriod.EditEffectiveDate != problematicBean.SliceDate) {
        reason = reason + " (" + problematicBean.SliceDate.format("short") + ")"
      }
    } 
    return reason
  }

  /**
   * Checks if any warnings appear in the new result that are not in the prior result or if the new
   * result has warnings and the prior result is null.
   *
   * @param priorResult
   */
  function hasNewWarnings(priorResult : PCValidationResult) : boolean {
    if (not this.hasWarnings()) {
      return false
    } else if (priorResult == null) {
      return true
    }
    var newWarnings = this.Warnings.map(\ warning -> (warning as ValidationIssue).Reason)
    var priorWarnings = priorResult.Warnings.map(\ warning -> (warning as ValidationIssue).Reason)
    return newWarnings.hasMatch(\ warning -> not priorWarnings.contains(warning))
  }

  function addValidations(validations : gw.api.validation.EntityValidation[]) {
    for (v in validations) {
      this.add(v)
    }
  }
}
