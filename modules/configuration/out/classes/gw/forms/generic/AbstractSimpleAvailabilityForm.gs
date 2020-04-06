package gw.forms.generic

uses gw.forms.FormData
uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

/**
 * Generic abstract class that can be used for any form that doesn't need any data to be gathered and
 * packaged and which just needs a simple availability script.  Subclassers need to implement the
 * isAvailable method to indicate whether or not the form should be added.
 */
@Export
abstract class AbstractSimpleAvailabilityForm extends FormData {
  
  var _exists : boolean

  /**
   * This method is invoked to determine if the form should actually be available.
   */
  abstract function isAvailable(context : FormInferenceContext, availableStates : Set<Jurisdiction>) : boolean
  
  override function populateInferenceData(context : FormInferenceContext, availableStates : Set<Jurisdiction>) {
    _exists = isAvailable(context, availableStates)    
  }
  
  override property get InferredByCurrentData() : boolean {
    return _exists  
  }
  
  override function addDataForComparisonOrExport(contentNode : XMLNode) {
    // No-op  
  }
}
