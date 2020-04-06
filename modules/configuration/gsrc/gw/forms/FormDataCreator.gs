package gw.forms
uses gw.api.profiler.PCProfilerTag
uses gw.api.forms.FormsLogger
uses java.util.ArrayList
uses java.util.Date
uses java.util.Set
uses java.util.HashMap
uses java.util.Map

/**
 * This class does the work of taking the form inference context and producing a list of forms to process, taking
 * into account OOSE issues.  The output of this class is List of Lists of FormData, where each inner list consists
 * of the set of FormData objects for a single slice.
 */
@Export
class FormDataCreator {
  
  /**
   * Private static instance variable
   */
  static var _instance = new FormDataCreator()
  
  /**
   * Property to use for accessing the singleton instance of this class
   */
  static property get Instance() : FormDataCreator {
    return _instance  
  }
  
  private construct() { }
  
  /**
   * This method creates all the FormData objects for the set of patterns currently set in 
   * the FormInferenceContext object.  The output list contains a List of FormData objects for
   * each slice in the period; if this is not an OOSE job there will always only be one such element
   * in the outer list, but in the case of an OOSE there will be one element per slice.  The FormData
   * objects in that list will be populated based the start date of the slice being considered along
   * with the set of states the form was available in.  FormData objects will not be created for forms
   * that aren't available for any states, so it's entirely possible the inner list could be empty
   * if none of the form patterns are available.  This method doesn't take care of merging OOSE slices
   * that code is left to the FormDataMerger class.
   */
  function createFormDataObjects(context : FormInferenceContext) : List<List<FormData>> {
    var formDatas = new ArrayList<List<FormData>>()
    
    // Create the forms for each slice; they'll be merged later
    var startDate = context.Period.EditEffectiveDate
    for (sliceDate in context.OOSSliceDates) {
      
      // Ignore the first slice date, which matches the start date
      if (sliceDate == startDate) {
        continue  
      }
      
      formDatas.add(createFormDataObjectsForSlice(context, startDate, sliceDate))
      startDate = sliceDate
    }  
    
    // Do the last slice as well
    formDatas.add(createFormDataObjectsForSlice(context, startDate, context.Period.PeriodEnd))
    
    return formDatas
  }
  
  /**
   * This method creates the set of FormData objects for a given slice, as demarcated by the start and end dates.
   * FormData objects will only be created for patterns that are available in at least one state.
   */
  private function createFormDataObjectsForSlice(context : FormInferenceContext, startDate : DateTime, endDate : DateTime) : List<FormData> {
    // Reset the period slice date so that form calculations will all use the start date of the slice we're computing forms for
    context.setSliceDate(startDate)
    
    // For each form, figure out the set of states in which it's available
    var patternMap = new HashMap<FormPattern, Set<Jurisdiction>>()    
    var pattern2classMap = new HashMap<FormPattern, FormData>()    
    for (pattern in context.Patterns) {
      PCProfilerTag.FORM_PROCESS_PATTERN.execute(\ p -> {
        p.setPropertyValue("FormPattern", pattern.Code)
        p.setPropertyValue("InferenceClass", pattern.InferenceClass.Name)

        var formDataClass = pattern.createFormInferenceClass()
        if (formDataClass != null) {
          pattern2classMap.put(pattern, formDataClass)
        
          var refDates = PCProfilerTag.FORM_DATA_LOOKUP_DATES.evaluate(
            \ -> formDataClass.getLookupDates(context))

          var availableStates = PCProfilerTag.FORM_DATA_AVAILABLE_STATES.evaluate(
            \ -> getAvailableStates(pattern, context, refDates))

          if (!availableStates.Empty) {
            patternMap.put(pattern, availableStates)
          }
        }
      })
    }
    
    // Now, go through and apply the form replacement algorithm to cull the set of states
    PCProfilerTag.FORM_APPLY_REPLACEMENTS.execute(\ -> applyFormReplacements(patternMap))
    
    // Create the form data for each pattern (which could be a list of forms, in multiplicity cases), passing in the states
    // which that form applies to as the argument and then set up the start and end dates on each form
    var forms = new ArrayList<FormData>()
    for (e in patternMap.entrySet()) {
      if (!e.Value.Empty) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormDataCreator.createFormDataObjectsForSlice() - Creating data for form " + e.Key.Code)
        }
        
        var formData = pattern2classMap.get(e.Key)
        var availableStates = e.Value
        if (formData typeis CreatesMultipleForms) {
          PCProfilerTag.FORM_MULTIPLES.execute(\ p -> {
            p.setPropertyValue("FormPattern", e.Key.Code)
            p.setPropertyValue("InferenceClass", e.Key.InferenceClass.Name)
            forms.addAll(formData.createForms(context, availableStates))
          })
        } else {    
          PCProfilerTag.FORM_DATA_POPULATE.execute(\ p -> {
            p.setPropertyValue("FormPattern", e.Key.Code)
            p.setPropertyValue("InferenceClass", e.Key.InferenceClass.Name)
            formData.populateInferenceData(context, availableStates)
            forms.add(formData)
          })
        }
      }
    }
    for (form in forms) {
      form.EffectiveDate = startDate
      form.ExpirationDate = endDate  
    }
    return forms
  }

  /**
   * This method determines the initial set of states that a pattern might be available in.  If this method returns
   * an empty set, that means the pattern isn't available in any states.
   */
  private function getAvailableStates(pattern : FormPattern, context : FormInferenceContext, lookupDates: Map<Jurisdiction, DateTime>) : Set<Jurisdiction> {
    // This iterates over the exposed states on the assumption that, in general, that list is fairly small whereas the set
    // of possible states is quite large for a form that applies to all states.  For each state that we have exposure, if
    // that's also a potential state for the form pattern we find out if it's actually available and, if so, add it
    // to the set of available states
    var possibleStates = pattern.PossibleStates
    var uwCompany = context.Period.UWCompany
    return lookupDates.Keys.where(\s -> possibleStates.contains(s) and pattern.isAvailable(s, lookupDates[s], uwCompany)).toSet()
  }
    
  // Note that order doesn't matter here since we always traverse the graph.  So if C replaces B replaces A, we remove
  // all states in C from both B and A.  It doesn't matter if we remove those states from B before or after B removes
  // its states from A; either way will work out to the same thing.
  /**
   * Applies the form replacements based on the UseInsteadOfFormPattern attribute of each pattern.
   * Note that order doesn't matter here since we always traverse the graph.  So if C replaces B replaces A, we remove
   * all states in C from both B and A.  It doesn't matter if we remove those states from B before or after B removes
   * its states from A; either way will work out to the same thing.
   */
  private function applyFormReplacements(patternMap : Map<FormPattern, Set<Jurisdiction>>) {
    for (pattern in patternMap.Keys) {
      applyReplacementsForPattern(pattern, patternMap[pattern], patternMap)        
    }
  }
  
  /**
   * Applies the form replacements for a particular pattern and the set of states to replace.
   */
  private function applyReplacementsForPattern(pattern : FormPattern, replacingStateSet : Set<Jurisdiction>, patternMap : Map<FormPattern, Set<Jurisdiction>>) {
    var replacedFormPattern = pattern.UseInsteadOfFormRef.FormPattern
    if (replacedFormPattern != null) {
      var replacedStateSet = patternMap[replacedFormPattern] 
      if (replacingStateSet != null and replacedStateSet != null) {
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("FormDataCreator.applyReplacementsForPattern() - Form " + pattern.Code + " is replacing " + replacingStateSet.join(", ") + " from " + replacedFormPattern.Code)
        }
        replacedStateSet.removeAll(replacingStateSet)  
      }
      // Recurse up the tree
      applyReplacementsForPattern(replacedFormPattern, replacingStateSet, patternMap)
    }
  }
}
