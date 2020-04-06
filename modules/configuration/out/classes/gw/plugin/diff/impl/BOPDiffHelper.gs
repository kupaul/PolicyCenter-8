package gw.plugin.diff.impl
uses gw.api.diff.DiffItem

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * Business Owners line of business. 
 */
@Export
class BOPDiffHelper extends DiffHelper<BusinessOwnersLine> {
  
  construct(reason : DiffReason, polLine1 : BusinessOwnersLine, polLine2 : BusinessOwnersLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Business Owners LOB, e.g. BOPLocations information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem>{
    diffItems = super.addDiffItems(diffItems)
    
    // Add Small Business Type diff
    diffItems.addAll(this.compareLineField("SmallBusinessType", 0))
    
    // Add line coverage, exclusion, condition diffs
    diffItems.addAll(this.compareLineField("BOPLineCoverages", 2))
    diffItems.addAll(this.compareLineField("BOPLineExclusions", 2))
    diffItems.addAll(this.compareLineField("BOPLineConditions", 2))
    
    // Add location, building diffs
    diffItems.addAll(this.compareLineField("BOPLocations", 3))

    // Add modifier diffs
    diffItems.addAll(this.compareLineField("BOPModifiers", 2))
    
    return diffItems
  }

  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> { 
    diffItems = super.filterDiffItems(diffItems)  
    return diffItems
  }
}
