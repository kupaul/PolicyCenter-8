package gw.coverage

uses gw.api.productmodel.ClausePattern

enhancement ClausePatternUIEnhancement : ClausePattern {
  
  function allowToggle(coverable : Coverable) : boolean{
    if (not this.isRequiredCov(coverable)) {
      return true
    } else {
      //required coverage
      if (coverable.getCoverageConditionOrExclusion(this) == null) {
        //if doesn't exist, allow toggle so user can add it if need be
        return true
      } else {
        //if exists, but unavailable, allow toggle so user can remove
        if (not coverable.isCoverageConditionOrExclusionAvailable(this)) {
          return true
        }
      }
      return false
    }
  }
}
