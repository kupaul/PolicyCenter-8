package gw.web.productmodel
uses gw.api.productmodel.ChoiceCovTermPattern
uses gw.api.domain.covterm.CovTerm
uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.productmodel.CovTermOpt
uses gw.api.productmodel.CovTermPack

@Export
class ChoiceCovTermUtil {

  /**
   * Determines whether the given covterm should be editable in the UI. 
   * 
   * @param covTerm the covterm to check.
   * @return true if the covterm should be editable.
   */
  static function isEditable(covTerm : CovTerm) : boolean {
    
    var covTermPattern = covTerm.Pattern
    
    // can come back null if we start creating a submission
    // and then change the date so that the cov term becomes unavailable.
    if (covTermPattern == null) 
      return false

    // cov term is editable if not required because <none>
    // could be an option
    if (!covTermPattern.Required)
      return true    
     
    if (covTermPattern typeis ChoiceCovTermPattern) {
      var availableValues = covTermPattern.getAvailableValues(covTerm)
      if (availableValues.Count == 1) {
        if (covTerm typeis OptionCovTerm) 
          covTerm.OptionValue = availableValues[0] as CovTermOpt
        else if (covTerm typeis PackageCovTerm)
          covTerm.PackageValue = availableValues[0] as CovTermPack
      }
      return availableValues.Count > 1      
    }
    
    // default to true
    return true
  }

  /**
   * Return a model value range list for an OptionCovTerm.
   *
   * @param covTerm The OptionCovTerm for which to generate a Model value range.
   * @param editable Whether the value range should include all values (i.e.,
   *        for edit selection).
   * @return A List of CovTermOpt's.
   */
  static function getModelValueRange(covTerm : OptionCovTerm, editable : boolean) : List<CovTermOpt> {
    if (covTerm == null) {
      return java.util.Collections.emptyList()
    } else if (! editable) {
      return java.util.Collections.singletonList(covTerm.OptionValue)
    } else {
      var range = covTerm.Pattern.getOrderedAvailableValues(covTerm)
      var currentOption = covTerm.OptionValue
      if (currentOption != null and !range.contains(currentOption)) {
        range.add(currentOption)
      }
      return range
    }
  }

  /**
   * Return a model value range list for a PackageCovTerm.
   *
   * @param covTerm The PackageCovTerm for which to generate a model value
   *     range.
   * @param editable Whether the value range should include all values (i.e.,
   *    for edit selection).
   * @return A List of CovTermPack's.
   */
  static function getModelValueRange(covTerm : PackageCovTerm, editable : boolean) : List<CovTermPack> {
    if (covTerm == null) {
      return java.util.Collections.emptyList()
    } else if (! editable) {
      return java.util.Collections.singletonList(covTerm.PackageValue)
    } else {
      var pattern = covTerm.Pattern
      return pattern.getOrderedAvailableValues(covTerm)
    }
  }
}