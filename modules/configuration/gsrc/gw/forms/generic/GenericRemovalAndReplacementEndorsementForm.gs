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
 * This class should function as a generic removal and replacement endorsement form.  It will look to see 
 * if any forms have been removed or replaced that set this as their removal endorsement form number, and if 
 * so it will create a form that contains a parent RemovedForms node with a child RemovedForm node for each 
 * form that's been removed, and underneath that will be Description, EndorsementNumber, and FormNumber nodes 
 * with the actual data about the form that was removed.  A comparable structure is created for forms being
 * replaced by a new copy of the same form.
 */
@Export
class GenericRemovalAndReplacementEndorsementForm extends FormData implements GenericFormInference {
  var _formsToRemove : List<Form>
  var _formsToReplace : List<Form>

  override function populateInferenceData( context : FormInferenceContext, availableStates : Set<Jurisdiction> ) : void {
    _formsToRemove = context.getFormsToBeRemoved( Pattern.FormNumber )
    _formsToReplace = context.getFormsToBeReplaced( Pattern.FormNumber )
  }

  override property get InferredByCurrentData() : boolean {
    return !(_formsToRemove.Empty and _formsToReplace.Empty)
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    var removedNode = new XMLNode("RemovedForms")
    contentNode.addChild(removedNode)
    assembleFormsNode(removedNode, _formsToRemove, "RemovedForm")
    var replacedNode = new XMLNode("ReplacedForms")
    contentNode.addChild(replacedNode)
    assembleFormsNode(replacedNode, _formsToReplace, "ReplacedForm")
  }
  
  private function assembleFormsNode( parentNode: XMLNode, formsList : List<Form>, newNodeName : String ) : void {
    for (f in formsList) {
      var childNode = new XMLNode(newNodeName)
      parentNode.addChild(childNode)
      childNode.addChild(createTextNode("Description", f.FormDescription))
      childNode.addChild(createTextNode("EndorsementNumber", f.EndorsementNumber as String))
      childNode.addChild(createTextNode("FormNumber", f.FormNumber))
    }    
  }

  override property get DisplayName() : String {
    return displaykey.Forms.Generic.InvalidatedOrUpdated
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
