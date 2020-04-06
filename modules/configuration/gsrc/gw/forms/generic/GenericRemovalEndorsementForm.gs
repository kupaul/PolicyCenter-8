package gw.forms.generic

uses gw.admin.FormPatternValidation
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.productmodel.PolicyLinePatternLookup
uses gw.forms.FormData
uses gw.forms.FormInferenceContext
uses gw.forms.GenericFormInference
uses gw.xml.XMLNode

uses java.util.Set

/**
 * This class should function as a generic removal endorsement form.  It will look to see if any forms have been
 * removed that set this as their removal endorsement form number, and if so it will create a form that contains
 * a parent RemovedForms node with a child RemovedForm node for each form that's been removed, and underneath
 * that will be Description, EndorsementNumber, and FormNumber nodes with the actual data about the form that
 * was removed.
 */
@Export
class GenericRemovalEndorsementForm extends FormData implements GenericFormInference {
  var _formsToRemove : List<Form>
  
  override function populateInferenceData( context : FormInferenceContext, availableStates : Set<Jurisdiction> ) : void {
    _formsToRemove = context.getFormsToBeRemoved( Pattern.FormNumber )
  }

  override property get InferredByCurrentData() : boolean {
    return !_formsToRemove.Empty
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    var parentNode = new XMLNode("RemovedForms")
    contentNode.addChild(parentNode)
    for (f in _formsToRemove) {
      var childNode = new XMLNode("RemovedForm")
      parentNode.addChild(childNode)
      childNode.addChild(createTextNode("Description", f.FormDescription))
      childNode.addChild(createTextNode("EndorsementNumber", f.EndorsementNumber as String))
      childNode.addChild(createTextNode("FormNumber", f.FormNumber))
    }
  }
  
  override property get DisplayName() : String {
    return displaykey.Forms.Generic.Invalidated
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
