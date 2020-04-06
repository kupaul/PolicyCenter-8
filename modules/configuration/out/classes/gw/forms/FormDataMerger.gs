package gw.forms
uses java.util.ArrayList

/**
 * This class takes a list of forms and produces a list of OOSEFormWrapper classes that correspond
 * to the set of slices for a given form, with forms that have adjacent eff/exp dates and identical
 * data merged together into a single form.
 */
@Export
class FormDataMerger {
  
  /**
   * Private static instance variable
   */
  static var _instance = new FormDataMerger()
  
  /**
   * Property to use for accessing the singleton instance of this class
   */
  static property get Instance() : FormDataMerger {
    return _instance  
  }
  
  private construct() { }
  
  /**
   * This method does the work of taking a list of forms by slice and collecting the set of
   * forms that are adjacent and have the same pattern and merging them together.  The input
   * is a List where each element is a List of FormDatas that corresponds to a single slice of
   * the period in effective time.  The output is a List of OOSEFormWrapper objects where each
   * wrapper corresponds to all the different versions of a particular form.
   */
  function mergeForms(slicedForms : List<List<FormData>>) : List<OOSEFormWrapper> {
    if (slicedForms.Count == 1) {
      return slicedForms.get(0).map( \ f -> new OOSEFormWrapper({f}) )
    } else {
      var resultingWrappers = new ArrayList<OOSEFormWrapper>()
      var groupedForms = slicedForms.flatten().toList().partition( \ f -> getHashKey(f) )
      for (group in groupedForms.Values) {
        group.sortBy( \ f -> f.EffectiveDate )
        resultingWrappers.add( mergeRelatedForms(group) )    
      }
      
      return resultingWrappers
    }
  }
  
  /**
   * Given a form, this produces a unique key that can be used to partition and then merge forms that
   * have the same pattern.
   */
  private function getHashKey(f : FormData) : String {
    var key = f.Pattern.Code
    if (f typeis CreatesMultipleForms) {
      key = key + "---" + f.getMatchKey()    
    }
    return key
  }
  
  /**
   * This method takes a list of FormData objects, sorted by effective date, and produces
   * an OOSEFormWrapper as a result that contains the merged slices of the form.
   */
  private function mergeRelatedForms(group : List<FormData>) : OOSEFormWrapper {
    var mergedForms = new ArrayList<FormData>()
    
    var currentForm : FormData = null
    for (i in 0..|group.Count) {
      if (i == 0) {
        currentForm = group.get(i)  
      } else {
        var nextForm = group.get(i)
        if (canMerge(currentForm, nextForm)) {
          currentForm = performMerge(currentForm, nextForm)  
        } else {
          mergedForms.add(currentForm)
          currentForm = nextForm
        }
      }
    }
    
    mergedForms.add(currentForm)
    return new OOSEFormWrapper(mergedForms)
  }
  
  /**
   * Determines if two forms can be merged.  It's assumed that the two forms have the same form pattern.
   * The two forms can be added only if they have the same value for InferredByCurrentData and if they have the
   * same data.
   */
  private function canMerge(f1 : FormData, f2 : FormData) : boolean {
    if (f1.InferredByCurrentData != f2.InferredByCurrentData) {
      return false  
    }
    
    return FormDataComparator.Instance.isFormDataEqual( f1, f2 )
  }
  
  /**
   * "Merges" the two forms together.  Since we know they have the same data and same
   * value for InferredByCurrentData, the merge just consists of extending the first form's
   * expiration date to whatever was on the second form.  Note that means that f1 needs
   * to be the earlier form in effective time.
   */
  private function performMerge(f1 : FormData, f2 : FormData) : FormData {
    f1.ExpirationDate = f2.ExpirationDate
    return f1  
  }
}
