
package gw.forms.generic
uses gw.admin.FormPatternValidation
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.productmodel.PolicyLinePatternLookup
uses gw.forms.FormInferenceContext
uses gw.forms.GenericFormInference

uses java.util.Set

/**
 * Generic class that can be used for any form that should always be added to a policy whenever the
 * form is available.  Using this class directly will lead to a form with no data populated, but this
 * class can also be extended by subclasses that override the addDataForComparisonOrExport method.
 */
@Export
class GenericAlwaysAddedForm extends AbstractSimpleAvailabilityForm implements GenericFormInference {

  override function isAvailable(context : FormInferenceContext, availableStates : Set<Jurisdiction>) : boolean {
    return true  
  }

  override property get DisplayName() : String {
    return displaykey.Forms.Generic.GenericAlwaysAddedForm
  }

  override property get ValidPolicylines() : List<PolicyLinePattern> {
    return PolicyLinePatternLookup.getAll()
  }

  override property get PolicyLineRequired() : boolean {
    return false
  }

  override function validateCustomFields(formPattern : FormPattern, validation : FormPatternValidation) {
  }

  override function clearCustomFields(formPattern : FormPattern) {
  }

}
