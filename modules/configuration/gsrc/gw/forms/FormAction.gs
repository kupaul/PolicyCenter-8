package gw.forms
uses gw.api.xml.XMLNode
uses java.util.Set
uses gw.api.forms.FormsLogger

/**
 * This class encapsulates the logic necessary to process a single form, including replacing or removing
 * any prior version of that same form.  The logic is encapsulated in an object for the sake of group
 * processing and, potentially, for testing.  For example, all FormActions for a group are created,
 * and before taking any actions we could see if any of the forms are going to be added and, if so,
 * potentially override the previous decision about whether or not to replace a form, perhaps flipping
 * things so that all forms for a group are re-issued if any one of them needs to change.  This class
 * has a private constructor and should only be constructed via the static factory replaceForm and
 * leaveForm methods.
 */
@Export
class FormAction {
  var _oldForm : Form
  var _newForm : FormData
  var _doReplacement : boolean as DoReplacement
  
  // Constructs a new FormAction that will replace oldForm with newForm (either of which can be null)
  static function replaceForm(oldForm : Form, newForm : FormData) : FormAction {
    return new FormAction(oldForm, newForm, true)     
  }
  
  // Constructs a new FormAction that will leave oldForm intact
  static function leaveForm(oldForm : Form, newForm : FormData) : FormAction {
    return new FormAction(oldForm, newForm, false)  
  }

  private construct(oldForm : Form, newForm : FormData, pDoReplacement : boolean) {
    _oldForm = oldForm
    _newForm = newForm
    _doReplacement = pDoReplacement
  }
  
  // Method that does the actual work of attaching, removing, or just leaving forms in place as appropriate
  function performAction(context : FormInferenceContext, unprocessedExistingForms : Set<Form>) {
    if (_doReplacement) {      
      // We add the new form first because we'll need it when processing the removal of the old form
      var newForm : Form 
      if (_newForm != null) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug( "Attaching form with code " + _newForm.Pattern.Code )  
        }
        newForm = attachForm(context, _newForm) 
      }
      
      if (_oldForm != null) {
        // Mark the old form as processed so we don't later think it's been orphaned and try to remove it
        if (unprocessedExistingForms != null) {
          unprocessedExistingForms.remove(_oldForm)
        }
        if (FormsLogger.isDebugEnabled()) {
          if (newForm != null) {
            FormsLogger.logDebug( "Replacing form " + _oldForm.FormPatternCode + (_oldForm.EndorsementNumber == null ? "" : " # " + _oldForm.EndorsementNumber )) 
          } else {
            FormsLogger.logDebug( "Removing form " + _oldForm.FormPatternCode + (_oldForm.EndorsementNumber == null ? "" : " # " + _oldForm.EndorsementNumber ))
          }
        }
        removeForm(context, _oldForm, newForm) 
      }
      
    } else {
      // Mark the old form as processed, but don't do anything else
      if (_oldForm != null && unprocessedExistingForms != null) {        
        unprocessedExistingForms.remove(_oldForm)
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug( "Leaving form " + _oldForm.FormPatternCode + (_oldForm.EndorsementNumber == null ? "" : " # " + _oldForm.EndorsementNumber )) 
        }
      }
    }
  }
  
  // Creates the appropriate Form from the FormData and attaches it to the period
  static function attachForm(context : FormInferenceContext, formData : FormData) : Form {
    // We want to make sure the form's eff/exp dates are always pinned to the period boundaries
    var form = FormUtil.newModelTimeBean(Form, context.Period)
      
    form.FormPatternCode = formData.Pattern.Code
    form.FormDescription = formData.FormDescription    
    form.FormNumber = formData.Pattern.FormNumber
    if (formData.EffectiveDate != context.Period.PeriodStart) {
      form.InternalFormEffDate = formData.EffectiveDate
    }
    if (formData.ExpirationDate != context.Period.PeriodEnd) {
      form.InternalFormExpDate = formData.ExpirationDate
    }
    form.InferenceTime = formData.Pattern.InferenceTime
    if (formData typeis CreatesMultipleForms) {
      formData.setMatchFields( form )  
    }
    formData.populateAdditionalFormFields( form )  
    // Only add in the content if this form actually has data; otherwise just leave it null
    var contentNode = formData.createContentNode()
    var empty = contentNode.Attributes.Empty && contentNode.Children.Empty && contentNode.Text == null
    if (!empty) {
      var topLevelNode = new XMLNode("FormData")
      topLevelNode.addChild(formData.createContentNode())   
      form.FormData = topLevelNode.asUTFString()
    }
    
    return form
  }
  
  // Removes a form, creating a FormRemoval object and, if appropriate, adding the Form to the context's map of removed or replaced forms
  static function removeForm(context : FormInferenceContext, oldForm : Form, newForm : Form) {
    if (FormsLogger.isDebugEnabled()) {
      FormsLogger.logDebug("FormAction.removeForm() - Removing form: " + oldForm.FormPatternCode)
    }
    // If the form is a "reissued" form with a removal endorsement number then we need to issue a removal endorsement, but only if it hasn't already been removed
    if (oldForm.Pattern.ReissueOnChange
        and oldForm.Pattern.RemovalEndorsementFormNumber != null
        and !oldForm.RemovedOrSuperseded) {
      if (newForm == null) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormAction.removeForm() - Adding removed form to the removal context: " + oldForm.FormPatternCode + ", removal endorsement " + oldForm.Pattern.RemovalEndorsementFormNumber)
        }
        context.addRemovedForm( oldForm.Pattern.RemovalEndorsementFormNumber, oldForm )
      } else {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormAction.removeForm() - Adding removed form to the replacement context: " + oldForm.FormPatternCode + ", removal endorsement " + oldForm.Pattern.RemovalEndorsementFormNumber)
        }
        context.addReplacedForm( oldForm.Pattern.RemovalEndorsementFormNumber, oldForm )
      }
    }
    
    oldForm.RemovedOrSuperseded = true
    if (newForm != null) {
      // Create the relationship between the new and old forms, then remove the old form as of the date the new form takes effect
      var formEdge = FormUtil.newModelTimeBean(FormEdgeTable, context.Period)
      formEdge.TargetForm = oldForm
      newForm.addToSupersededForms( formEdge ) 
      if (FormsLogger.isDebugEnabled()) {
        FormsLogger.logDebug("FormAction.removeForm() - Setting internal form removal date to the new form's effective date: " + newForm.InternalFormEffDate)
      }
      oldForm.InternalFormRemovalDate = newForm.InternalFormEffDate
    } else {
      // If the change is effective after the form, truncate the form to the change date.
      // Otherwise, just drop it down to zero width
      if (context.Period.EditEffectiveDate > oldForm.FormEffDate) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormAction.removeForm() - Setting internal form removal date to the period eff date: " + context.Period.EditEffectiveDate)
        }
        oldForm.InternalFormRemovalDate = context.Period.EditEffectiveDate
      } else {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormAction.removeForm() - Setting internal form removal date to the old form's effective date: " + oldForm.InternalFormEffDate)
        }
        oldForm.InternalFormRemovalDate = oldForm.InternalFormEffDate
      }
    }
  }
}
