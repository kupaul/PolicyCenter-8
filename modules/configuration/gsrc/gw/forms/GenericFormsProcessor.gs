package gw.forms
uses java.util.Collections
uses java.util.Set
uses java.util.HashSet
uses java.util.ArrayList
uses java.util.Date
uses java.util.Map
uses gw.api.forms.FormsLogger

/**
 * This is the class that actually does all the work of figuring out which forms to add and which forms to remove.
 */
@Export
class GenericFormsProcessor {
  private construct() { }
  
  static var _instance = new GenericFormsProcessor()
  
  static property get Instance() : GenericFormsProcessor {
    return _instance  
  }

  /**
   * Given a form inference context, processes the patterns associated with that context.
   */
  function processPatterns(context : FormInferenceContext) {
    // We create the form data objects by slice (in the case of an OOSE), then merge adjacent matching slices
    // together, and then process the resulting forms
    var sliceLists = FormDataCreator.Instance.createFormDataObjects(context)
    var formWrappers = FormDataMerger.Instance.mergeForms( sliceLists)
    handleMergedFormData(formWrappers, context)
  }
  
  /**
   * Given the set of form wrappers, dispatches based on the processing type.  Reissued and one-time
   * forms get special handling, while other forms just get added if they need to be there.
   */
  private function handleMergedFormData(formWrappers : List<OOSEFormWrapper>, context : FormInferenceContext) {
    var pattern = context.Patterns.get(0)
    if (context.Period.PolicyChange != null and pattern.hasJob(typekey.Job.TC_POLICYCHANGE)) {
      if (pattern.RemovalEndorsement or pattern.FormPatternJobs.Count == 1) {
        handleSimpleFormData(formWrappers, context)
      } else if (pattern.ReissueOnChange) {
        handleReissuedFormData(formWrappers, context)  
      } else {
        handleOneTimeFormData(formWrappers, context)
      }
    } else {
      handleSimpleFormData(formWrappers, context)
    }
  }
  
  /**
   * Handles the simple processing case, which is generally for job-specific notices.  The logic is simple:
   * for each slice, see if the form should be added and, if so, add it.
   */
  private function handleSimpleFormData(newForms : List<OOSEFormWrapper>, context : FormInferenceContext) {
    newForms.flatMap( \ fw -> fw.FormSlices ).each(\f -> {
      if (f.InferredByCurrentData) {
        FormAction.attachForm( context, f )
      }
    })
  }
  
  /**
   * Handling for one-time form patterns, which are forms that need to be on the policy provided that they
   * haven't yet appeared.  Currently it's assumed that these forms have no time-dependent data and thus
   * should never be sliced in an OOSE context, and it's also assumed they never apply to a multiplicity
   * scenario (which is probably wrong), so they're added only if they're not already there.
   */
  private function handleOneTimeFormData(newForms : List<OOSEFormWrapper>, context : FormInferenceContext) {
    // This assumes that OOSE isn't an issue with one-time forms, so we just process all slices.
    // If the form should be added and there's no pre-existing form with the same match key, then
    // go ahead and add this one
    var pastForms = context.PastForms[context.GroupCode]
    var pastMatchKeys : Set<String> = Collections.emptySet<String>()
    if (pastForms != null) {
      pastMatchKeys = pastForms.map( \ f -> getFormMatchKey(f) ).toSet()  
    }
    
    newForms.flatMap( \ fw -> fw.FormSlices ).each(\f -> {
      if (f.InferredByCurrentData && !pastMatchKeys.contains( getFormMatchKey( f ) )) {
        FormAction.attachForm(context, f)
      }
    })
  }
  
  /**
   * Reissued forms are the most complicated.  Basically, to handle them we have to gather all the past
   * forms for this group of patterns and then match them up with the current forms.  If there's a match
   * and the current form is unavailable, the old form is removed.  If there's a match and the new form
   * is different, the new form is added and the old one removed.  If there's a match and the forms are
   * the same, we do nothing.  If there's no match for a new form, the form is just added.  If there's no
   * current match for a previous form, that form is removed.
   *
   * The whole process is made more complicated by the fact that we process all forms with the same pattern
   * together to potentially deal with multiplicity issues, even though out of the box right now we don't.
   */
  private function handleReissuedFormData(newForms : List<OOSEFormWrapper>, context : FormInferenceContext) {
    var unprocessedForms = compilePastForms(context)
    var pastForms = unprocessedForms.partition( \ f -> getFormMatchKey(f) ).mapValues(\i -> i.toSet())
    if (FormsLogger.isDebugEnabled()) {
      FormsLogger.logDebug("GenericFormsProcessor.handleReissuedFormData() - Past forms for " + context.GroupCode + " include " + unprocessedForms.map(\f -> f.FormPatternCode).join(", "))
    }
    
    // We process the forms by pattern, so that all forms with the same pattern (in the case of multiplicity)
    // can be handled at the same time.
    var formGroupings = newForms.partition( \ o -> o.FormPattern).mapValues(\i -> i.toList()).Values
    for (grouping in formGroupings) {
      var actions = determineActionsForGroupedForms(grouping, context, pastForms)
      actions.each(\action -> action.performAction( context, unprocessedForms ))
    }
    
    // Any pre-existing forms that are left over must no longer belong on the policy, so remove them.  They
    // could be there either because the "new" version of the form has InferredByCurrentData = false or because
    // there is no new version of the form
    for (oldForm in unprocessedForms) {
      if (FormsLogger.isDebugEnabled()) {
        FormsLogger.logDebug("GenericFormsProcessor.handleReissuedFormData() - Removing past form " + oldForm.FormPatternCode + " as it doesn't have a current matching form that should be on the policy")
      }
      FormAction.removeForm(context, oldForm, null)
    }
  }
  
  /**
   * Given a form, retrieves the "match key" for a given form, which is a unique key based on the pattern and,
   * if the form can have multiple copies, the the match key (i.e. some key that uniquely identifies two forms
   * that point to the same object).
   */
  private function getFormMatchKey(f : Form) : String {
    var key = f.Pattern.FormNumber
    
    if (f.Pattern.CreatesMultipleForms) {
      key = key + "---" + f.Pattern.getMatchKeyForForm( f )
    }
    return key
  }
  
  /**
   * Given a form data, retrieves the "match key" for a given form, which is a unique key based on the pattern and,
   * if the form can have multiple copies, the the match key (i.e. some key that uniquely identifies two forms
   * that point to the same object).
   */
  private function getFormMatchKey(f : FormData) : String {
    var key = f.Pattern.FormNumber
    if (f typeis CreatesMultipleForms) {
      key = key + "---" + f.getMatchKey(  )    
    }
    return key
  }
  
  /**
   * Gets the set of pre-existing forms for this group, which is cached in the context
   * at this point.  This method will return an empty Set instead of null if there are
   * no pre-existing forms.
   */
  private function compilePastForms(context : FormInferenceContext) : Set<Form> {
    var pastForms = new HashSet<Form>()  
    var mappedPastForms = context.PastForms.get( context.GroupCode )
    if (mappedPastForms != null) {
      pastForms.addAll(mappedPastForms)
    }
    return pastForms
  }
  
  /**
   * This method determines the actions to take for a group of forms that have the same FormPattern.  The logic is broken
   * up this way to allow for any special handling that needs to happen in the case of multiplicity.  For example, if we
   * wanted to re-issued all forms for a group in the case of a change to one of them, it's possible to do that here before
   * returning the list of form actions.
   */
  private function determineActionsForGroupedForms(formWrappers : List<OOSEFormWrapper>, context : FormInferenceContext, allExistingForms : Map<String, Set<Form>>) : List<FormAction> {
    var formActions = formWrappers.map(\ w -> determineActionForSingleFormWrapper(w, context, allExistingForms))
    
    // Any additional pre-processing of the actions should happen here
    
    return formActions.flatten().toList()
  }
  
  /**
   * Determines the actions to take for a single OOSEFormWrapper.  For each slice, we see if it should be added
   * and, if so, attempt to match it up to the set of previous forms to figure out what to really do
   */
  private function determineActionForSingleFormWrapper(formWrapper : OOSEFormWrapper, context : FormInferenceContext, allExistingForms : Map<String, Set<Form>>) : List<FormAction> {
    var previousForms = findExistingForms(formWrapper, allExistingForms)
    
    var actions = new ArrayList<FormAction>()
    for (form in formWrapper.FormSlices) {
      // If the slice should be added, then figure out the appropriate action (either leaving the existing version as-is or replacing it, if present)
      // If it shouldn't be added . . . well, then don't worry about it
      if (form.InferredByCurrentData) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("GenericFormsProcessor.determineActionForSingleFormWrapper() - Form " + form.Pattern.Code + " should be added, determining what actions to take")
        }
        actions.add(determineActionForSingleForm(form, previousForms, context.Period.EditEffectiveDate))  
      } else {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("GenericFormsProcessor.determineActionForSingleFormWrapper() - Form " + form.Pattern.Code + " shouldn't be added")
        }
        // Do nothing
      }
    }
    
    return actions
  }
  
  /**
   * Given a pattern, find any existing forms that either use that Pattern directly or that have the same FormNumber AND
   * that have the same match fields.  The resulting forms will be returned in order by EffectiveDate
   */
  private function findExistingForms(formWrapper : OOSEFormWrapper, allExistingForms : Map<String, Set<Form>>) : List<Form> {
    var formData = formWrapper.FormSlices.first()
    var existingForms = allExistingForms.get( getFormMatchKey(formData) )
    if (existingForms == null) {
      return Collections.emptyList<Form>()
    } else {
      return existingForms.toList().sortBy( \ f -> f.EffectiveDate )    
    }
  }
  
  /**
   * Determines the action to take for a single form, given a list of previous forms that have the same pattern and match key.
   * Note that in general that list will be of size 0 or 1, but in the case of an OOSE change or a change following an OOSE
   * change there could be multiple previous versions of the form to worry about.
   */
  private function determineActionForSingleForm(newForm : FormData, previousForms : List<Form>, jobDate : Date) : FormAction {
    var matchingPreviousForm = matchByDates(newForm, previousForms, jobDate)
    
    // If we can't find a matching previous form, we just have to add the new one in.  Otherwise,
    // we see whether the data has changed or not in order to decide if we should leave the form
    // intact or replace it with the new version
    if (matchingPreviousForm == null) {
      return FormAction.replaceForm( null, newForm )  
    } else {
      if (not FormDataComparator.Instance.isFormDataEqual( matchingPreviousForm, newForm )) {
        return FormAction.replaceForm(matchingPreviousForm, newForm)
      } else {
        return FormAction.leaveForm(matchingPreviousForm, newForm)
      }
    }  
  }
  
  /**
   * Given a new form, the previous potential forms, and the job's effective date, determines which previous form matches up
   * to the new form, if any.  The previous form must essentially have the same eff/exp dates to be considered a match.
   */
  private function matchByDates(newForm : FormData, previousForms : List<Form>, jobDate : Date) : Form {
    for (previousForm in previousForms) {
      // If the eff date of the form is prior to the job date, use the job date as the eff date to match.  That's because
      // we only create slices from the job date forward, so if we want the dates to match up with previous forms we just
      // want to treat previously-existing forms as if they started on the job date
      var effDate = previousForm.FormEffDate
      if (effDate < jobDate) {
        effDate = jobDate  
      }
      
      if (effDate == newForm.EffectiveDate and previousForm.FormExpDate == newForm.ExpirationDate) {
        return previousForm  
      }
    }
    
    return null
  }
  
}
