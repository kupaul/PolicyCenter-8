package gw.forms

uses java.util.Map
uses java.util.ArrayList
uses java.util.Collections
uses gw.api.diff.DiffItem
uses java.util.Date

/**
 * The FormInferenceContext object serves as the primary object passed around during form inference.  It contains
 * information about the current set of form patterns being considered as well as the policy period being analyzed
 * and cached information around things like what states are exposed on the period at various points in time, what
 * previous versions of forms have been bound on this policy, and what forms have been removed.
 *
 * Only the Period, Line, DiffItems, getFormsToBeRemoved, and getFormsToBeReplaced methods should ever need to be
 * called during population of FormData objects.  The rest of the methods and properties here should only be used
 * by the inference engine logic.
 */
@Export
class FormInferenceContext {
  var _formPatterns : List<FormPattern>
  var _policyPeriod : PolicyPeriod as readonly Period
  var _diffItems : List<DiffItem> // Lazily-computed set of diff items for the period
  var _removedForms : Map<String, List<Form>> // Map of replacement endorsement form number to a List of Form objects that have been removed entirely
  var _replacedForms : Map<String, List<Form>> // Map of replacement endorsement form number to a List of Form objects that have been replaced by a newer version of the form
  var _nonRemovedExistingForms : Map<String, List<Form>> // Map of group codes to Form objects for forms that were not removed as of the edit effective date of the period
  var _currentSystemTime : Date
  var _oosSliceDates : Date[] // Lazily-computer array of the PolicyPeriod's calculated OOSSliceDates

  protected construct(pp : PolicyPeriod) {
    _policyPeriod = pp
    _removedForms = {}
    _replacedForms = {}
    _nonRemovedExistingForms = calculateNonRemovedExistingForms(pp)
    _currentSystemTime = Date.CurrentDate
  }

  // ---------------------------- Public Properties

  /**
   * Retrieves the cached set of diff items for this branch, or calculates it if necessary.
   */
  property get DiffItems() : List<DiffItem> {
    // This is expensive to compute, so do it lazily.  This is single-threaded, so no need to worry about thread-safety.
    if (_diffItems == null) {
      _diffItems = initDiffItems()
    }
    return _diffItems
  }

  /**
   * Retrieves the cached array of OOSSliceDates for this branch, or calculates it if necessary.
   */
  property get OOSSliceDates() : Date[] {
    if (_oosSliceDates == null) {
      _oosSliceDates = _policyPeriod.OOSSliceDates
    }
    return _oosSliceDates
  }

  property set OOSSliceDates(oosSlicesDates_ : java.util.Date[]) {
    _oosSliceDates = oosSlicesDates_
  }

  /**
   * Returns the list of Form objects that have been marked as needing to be removed with the given removal endorsement number.
   */
  function getFormsToBeRemoved(removalFormNumber : String) : List<Form> {
    var list = _removedForms.get(removalFormNumber)
    if (list == null) {
      return Collections.emptyList<Form>()
    } else {
      return list
    }
  }

  /**
   * Returns the list of Form objects for the specified removal endorsement form that have been marked as replaced.
   */
  function getFormsToBeReplaced(removalFormNumber : String) : List<Form> {
    var list = _replacedForms.get(removalFormNumber)
    if (list == null) {
      return Collections.emptyList<Form>()
    } else {
      return list
    }
  }

  // ------------------------ Protected methods and properties that should only be used by the inference engine

  /**
   * Returns the group code for the forms currently being processed.
   */
  protected property get GroupCode() : String {
    return _formPatterns[0].GroupCode
  }

  /**
   * Returns the set of patterns currently being processed.  All these FormPatterns will have the same GroupCode.
   */
  public property get Patterns() : List<FormPattern> {
    return _formPatterns
  }

  /**
   * Sets the set of form patterns to a new list.  This is mutable so that we can re-use the same
   * FormInferenceContext object for every form that's processed, both so we don't have to create
   * a new one every time and because we want to be able to cache things like the set of form removals
   * and exposed states.
   */
  protected property set Patterns(list : List<FormPattern>) {
    _formPatterns = list
  }

  /**
   * Returns the map of all non-removed forms, with the group code mapped to the list of existing forms.
   */
  protected property get PastForms() : Map<String, List<Form>> {
    return _nonRemovedExistingForms
  }

  /**
   * Adds the given form to the map of removed Form objects for a given removal endorsement number.
   */
  protected function addRemovedForm(removalFormNumber : String, form : Form) {
    var list = _removedForms.get(removalFormNumber)
    if (list == null) {
      list = new ArrayList<Form>()
      _removedForms.put(removalFormNumber, list)
    }
    list.add(form)
  }

  /**
   * Adds the given form to the map of replaced Form objects for a given removal endorsement number.
   */
  protected function addReplacedForm(removalFormNumber : String, form : Form) {
    var list = _replacedForms.get(removalFormNumber)
    if (list == null) {
      list = new ArrayList<Form>()
      _replacedForms.put(removalFormNumber, list)
    }
    list.add(form)
  }

  /**
   * Returns the "current" system time, which is really the time that form inference began.  This should be used in preference to
   * using Date.CurrentDate as the value is cached, meaning it will be consistent across form patterns.
   */
  public property get CurrentSystemTime() : Date {
    return _currentSystemTime
  }

  /**
   * Resets the date on which the PolicyPeriod property is sliced.  This method should only be called by the
   * FormDataCreator.
   */
  protected function setSliceDate(sliceDate : Date) {
    _policyPeriod = _policyPeriod.getSlice(sliceDate)
  }

  // -------------------------- Private implementation methods

  /**
   * Initializes the set of diff items for this period
   */
  private function initDiffItems() : List<DiffItem> {
    if (_policyPeriod.BasedOn != null) {
      return _policyPeriod.FormsDiffItems
    }  else {
      return null
    }
  }

  /**
   * Calculates the set of forms that are not removed, meaning forms that haven't been ended before the edit
   * effective date of the job and that haven't been removed as of their effective date.
   */
  private function calculateNonRemovedExistingForms(branch : PolicyPeriod) : Map<String, List<Form>> {
    var jobDate = branch.EditEffectiveDate
    // Ignore forms that 1) have an end date prior to this job and 2) don't actually cover any time
    var forms = branch.AllPriorBoundForms.where(\ form -> !form.isEndedBefore(jobDate) and !form.isCompletelyRemoved()).toList()
    forms = forms.map(\f -> f.getSlice(branch.PeriodStart)).toList()
    return forms.partition(\f -> f.Pattern.GroupCode).mapValues(\i -> i.toList())
  }

}
