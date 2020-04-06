package gw.plugin.diff.impl
uses gw.api.diff.DiffItem

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * General Liability line of business. 
 */
@Export
class GLDiffHelper extends DiffHelper<GeneralLiabilityLine> {
   
  construct(reason : DiffReason, polLine1 : GeneralLiabilityLine, polLine2 : GeneralLiabilityLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the General Liability LOB, e.g. GLLineCoverages information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */  
  override function addDiffItems(diffItems : List<DiffItem>) :  List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Add diffs for line-level coverages, exclusions, and conditions
    diffItems.addAll(this.compareLineField("GLLineCoverages", 3))
    diffItems.addAll(this.compareLineField("GLLineExclusions", 3))
    diffItems.addAll(this.compareLineField("GLLineConditions", 3))

    // Add modifier diffs
    diffItems.addAll(this.compareLineField("GLModifiers", 2))    

    return diffItems
  }

  /**
   * Filters diff items that apply to the General Liability LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */ 
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {        
    // Remove the auto generated diffs because they don't account for basis splits
    diffItems.removeWhere(\ d -> d.Bean typeis GLExposure)
    diffItems = addGLExposureDiffs(diffItems)
    diffItems = super.filterDiffItems(diffItems)
    
    return diffItems
  }
  
  private function addGLExposureDiffs(diffItems : List<DiffItem>) : List<DiffItem> {
    return addSplittableDiffs(diffItems, \ g -> g.AllGLExposuresWM, \ s -> getKey(s))
  }
    
  private function getKey(exposure : GLExposure) : String {
    return exposure.Location.DisplayName + " " + exposure.ClassCode
  }
}
