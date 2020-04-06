package gw.forms
uses gw.api.forms.FormsLogger

/**
 * This class performs the actual endorsement numbering of forms.  This default implementation adds endorsement numbers
 * for all forms that are marked as endorsement numbered, but it could in theory be changed to only add endorsement
 * numbers during certain jobs, to order by different criteria than the priority, etc.
 */
@Export
class FormEndorsementNumberer {
  
  private static var _instance = new FormEndorsementNumberer()
  
  public static property get Instance()  : FormEndorsementNumberer {
    return _instance  
  }
  
  private construct() {}
  
  /**
   * Assigns endorsement numbers to all forms on this period, starting with one higher than the
   * highest previous endorsement number or with 0, if no previous numbered forms exist.  Endorsement
   * numbers are then assigned in order of the Priority field on the FormPattern, with forms with a
   * null priority processed last.  Only forms whose pattern has EndorsementNumbered set to true will
   * be given endorsement numbers
   */
  function assignEndorsementNumbers(pr : PolicyPeriod) {
    var highestNumber = calculateHighestPreviousEndorsementNumber(pr)
    if (FormsLogger.isDebugEnabled()) {
      FormsLogger.logDebug("Assigning endorsement numbers, starting with " + (highestNumber + 1))  
    }
    
    var forms = pr.NewlyAddedForms.sortBy( \ f -> f.Pattern.SortPriority )
    for (f in forms) {
      if (f.Pattern.EndorsementNumbered) {
        // We want to make sure the beans never split
        f = f.getSlice( pr.PeriodStart )
        highestNumber = highestNumber + 1
        f.EndorsementNumber = highestNumber  
        if (FormsLogger.isDebugEnabled()) {
          FormsLogger.logDebug("Added Endorsement Number : Form " + f.FormPatternCode +  " - # " + f.EndorsementNumber)  
        }
      }
    } 
  }
  
  /**
   * Calculates the highest previous endorsement number on the period by looking at the set of
   * bound forms and taking the highest endorsement number from any bound form.  If there are
   * no bound forms with endorsement numbers, this method will return 0.
   */
  private function calculateHighestPreviousEndorsementNumber(pr : PolicyPeriod) : int {
    var maxForm = pr.AllPriorBoundForms.maxBy( \ f -> f.EndorsementNumber == null ? 0 : f.EndorsementNumber )
    return (maxForm == null || maxForm.EndorsementNumber == null ? 0 : maxForm.EndorsementNumber)
  }
}
