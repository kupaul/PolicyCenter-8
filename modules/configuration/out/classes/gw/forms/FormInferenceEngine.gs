package gw.forms

uses gw.api.profiler.PCProfilerTag
uses gw.api.admin.FormPatternUtil
uses gw.api.forms.FormsLogger
uses java.util.Comparator
uses java.util.HashMap
uses java.util.HashSet
uses java.util.Collections
uses java.util.ArrayList

/**
 * The FormInferenceEngine serves as the main access point for the rest of the application logic into the form inference logic.
 * The two primary methods are to infer post-quote forms and to infer pre-bind forms.
 */
@Export
class FormInferenceEngine {

  /**
   * Private singleton instance variable
   */
  static var _instance : FormInferenceEngine as readonly Instance = new FormInferenceEngine()

  private construct() { }

  /**
   * Infers all forms marked as either bind or quote time.  Prior to executing, this method removes
   * all forms on the branch.  Note that this also does not assign endorsement numbers; those are only
   * assigned after bind-time forms are inferred.
   *
   * @param pr the policy period to infer forms for
   */
  function inferPostQuoteForms(pr : PolicyPeriod) {
    inferPostQuoteFormsInSlices(pr, pr.OOSSliceDates)
  }

  /**
   * Infers all forms marked as either bind or quote time.  Prior to executing, this method removes
   * all forms on the branch.  Note that this also does not assign endorsement numbers; those are only
   * assigned after bind-time forms are inferred.
   *
   * @param pr the policy period to infer forms for
   * @param oosSliceDates_ out of sequence execution dates to infer forms for.
   */
  function inferPostQuoteFormsInSlices(pr : PolicyPeriod, oosSliceDates_ : java.util.Date[]) {
    pr.removeAllNewlyAddedForms()
    var formPatterns = findPotentialForms(pr, {"quote","bind"})
    processFormPatternsInSlices(pr, formPatterns, oosSliceDates_)
  }

  /**
   * Infers all forms marked as bind time and assigns endorsement numbers to all forms at the end.
   * This method also removes any bind-time forms that previously existed on the policy and
   * that might have been inferred during quote time.
   */
  function inferPreBindForms(pr : PolicyPeriod) {
    pr.removeNewlyAddedBindTimeForms()
    var formPatterns = findPotentialForms(pr, {"bind"})
    processFormPatterns(pr, formPatterns)
    PCProfilerTag.FORM_NUMBER_ENDORSEMENTS.execute(\ -> FormEndorsementNumberer.Instance.assignEndorsementNumbers(pr))
  }

  // -------------------------------------- Private functions

  /**
   * Finds all potential form patterns that could apply to the period, given the set of inference times and the
   * job on the period.  This just does a very coarse first-level pass, as any date or state-based availability
   * calculations have to be done on a per-slice, per-state, per-pattern basis later on during the creation of
   * the FormData objects.
   */
  private function findPotentialForms(pr : PolicyPeriod, inferenceTimes : FormInferenceTime[]) : List<FormPattern> {
    return PCProfilerTag.FORM_FIND_PATTERNS.evaluate(\ -> FormPatternUtil.findPotentialInferenceForms(pr, inferenceTimes))
  }

  /**
   * Does the work of processing a given set of form patterns.  The patterns are grouped by GroupCode, sorted
   * so that they'll be processed in a deterministic order, and then run through the GenericFormsProcessor class,
   * which does all the real processing.
   */
  private function processFormPatterns(pr : PolicyPeriod, patterns : List<FormPattern>) {
    processFormPatternsInSlices(pr, patterns, null)
  }

  private function processFormPatternsInSlices(pr : PolicyPeriod, patterns : List<FormPattern>, oosSliceDates_ : java.util.Date[]) {
    PCProfilerTag.FORM_PROCESS_PATTERNS.execute(\ -> {
      var context = new FormInferenceContext(pr)
      if (oosSliceDates_ != null) {
        context.OOSSliceDates = oosSliceDates_
      }
      var patternGroups = calcPatternGroups(patterns)
      for (group in patternGroups) {
        if (FormsLogger.isDebugEnabled()) {
          if (group.size() > 1) {
            FormsLogger.logDebug("Evaluating group " + group.get(0).GroupCode + " with forms " + group.map(\ f -> f.Code).join(", "))
          } else {
            FormsLogger.logDebug("Evaluating form " + group.get(0).Code)
          }
        }
        context.Patterns = group
        PCProfilerTag.FORM_PROCESS_GROUP.execute(\ p -> {
          p.setPropertyValue("GroupCode", group.get(0).GroupCode)
          p.setCounterValue("Size", group.size())
          GenericFormsProcessor.Instance.processPatterns(context)
        })
      }

      if (FormsLogger.isDebugEnabled()) {
        var forms = pr.NewlyAddedForms
        if (forms.Count == 0) {
          FormsLogger.logDebug("No forms present on the period")
        } else {
          FormsLogger.logDebug("The following forms were present:")
          for (f in forms) {
            FormsLogger.logDebug("Form " + f.FormPatternCode)
            FormsLogger.logDebug(f.FormData)
            FormsLogger.logDebug("Effective from " + f.EffectiveDate + " until " + f.ExpirationDate)
          }
        }
      }
    })
  }

  public function calcPatternGroups(patterns : List<FormPattern>) : List<List<FormPattern>> {
    // lower priority matches are added first and higher priorities are skipped
    var ordered : List<List<FormPattern>> = {}
        var pcompare = Collections.reverseOrder(new PatternCompare())
    var priorities  = new ArrayList<PatternData>()
    var patternMap : HashMap<String, List<FormPattern>> = {}
    for (pattern in patterns) {
      var pd = new PatternData() { :Group = pattern.GroupCode, :Priority = pattern.SortPriority, :Removed = pattern.RemovalEndorsement }
      priorities.add(pd)
      var group = patternMap.get(pattern.GroupCode)
      if (group == null) group = {}
      group.add(pattern)
      patternMap.put(pattern.GroupCode, group)
    }
    var complete : HashSet<String> = {}
    Collections.sort(priorities, pcompare)
    for (priority in priorities) {
      var key = priority.Group
      var group = patternMap.get(key)
      if (not complete.contains(key)) {
        ordered.add(0, group)
        complete.add(key)
      }
    }
    return ordered
  }

  /**
   * DTO. Faster than using the original entity
   */
  private class PatternData {
    private var _group : String as Group
    private var _priority : int as Priority
    private var _removed : boolean as Removed
  }

  /**
   * Comparator for pattern data
   */
  private class PatternCompare implements Comparator<PatternData> {
    private var _reverse : boolean as Reverse = false
    override function compare(pc1 : PatternData, pc2 : PatternData) : int {
      if (pc1.Removed != pc2.Removed) {
        return pc1.Removed ? 1 : -1
      }
      if (pc1.Priority == pc2.Priority) {
        return pc1.Group.compareTo(pc2.Group)
      }
      if (pc1.Priority > pc2.Priority) {
        return 1
      }
      return -1
    }
  }
}
