package gw.forms

uses gw.api.productmodel.PolicyLinePattern
uses gw.admin.FormPatternValidation

/**
 * The base for a general-purpose inference class that is able to handle common
 * inference scenarios. Any subclass of {@link FormData} that does not implement
 * this interface is considered a "custom" form inference class.
 */
@Export
interface GenericFormInference {

  /**
   * @return the label displayed in the "Form inference conditions" dropdown
   * menu (on the Inference card of the Policy Forms admin UI).
   */
  property get DisplayName() : String

  /**
   * @return a list of all PolicyLinePatterns for which this inference class
   * is valid. Use PolicyLinePatternLookup.getAll() if this class is valid for all
   * PolicyLinePatterns.
   */
  property get ValidPolicylines() : List<PolicyLinePattern>

  /**
   * Whether this inference class requires a PolicyLine.
   */
  property get PolicyLineRequired() : boolean

  /**
   * Validate FormPattern fields that are specific to this inference class.
   */
  function validateCustomFields(formPattern : FormPattern, validation : FormPatternValidation)

  /**
   * When a FormPattern's GenericInferenceClass has been changed, this is called
   * to clean up settings that are no longer used. For details, see
   * {@link gw.admin.FormPatternInferenceEnhancement#clearCustomInferenceFields}
   */
  function clearCustomFields(formPattern : FormPattern)

}
