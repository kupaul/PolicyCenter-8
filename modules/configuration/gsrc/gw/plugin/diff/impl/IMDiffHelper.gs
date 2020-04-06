package gw.plugin.diff.impl
uses gw.api.diff.DiffItem

/**
 * This class contains methods to help with adding and filtering diff items for a
 * Inland Marine line of business. 
 */
@Export
class IMDiffHelper extends DiffHelper<InlandMarineLine> {

  construct(reason : DiffReason, polLine1 : InlandMarineLine, polLine2 : InlandMarineLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Inland Marine LOB, e.g. IMLocations information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Add diffs for Inland Marine locations and buildings
    diffItems.addAll(this.compareLineField("IMLocations", 3))
    
    // Add diffs for coverage parts
    diffItems.addAll(this.compareLineField("IMCoverageParts", 8))
    
    return diffItems
  }

  /**
   * Filters diff items that apply to the Inland Marine LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */   
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.filterDiffItems(diffItems) 
    return diffItems
  }
}
