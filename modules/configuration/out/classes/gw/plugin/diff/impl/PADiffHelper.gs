package gw.plugin.diff.impl
uses gw.api.diff.DiffItem

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * Personal Auto line of business. 
 */
@Export
class PADiffHelper extends DiffHelper<entity.PersonalAutoLine>{

  construct(reason : DiffReason, polLine1 : entity.PersonalAutoLine, polLine2 : entity.PersonalAutoLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Personal Auto LOB, e.g. PALineCoverages information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Add diffs for line-level coverages
    diffItems.addAll(this.compareLineField("PALineCoverages", 2))

    // Add difs for exclusions and conditions
    diffItems.addAll(this.compareLineField("PALineExclusions", 2))
    diffItems.addAll(this.compareLineField("PALineConditions", 2))
    
    // Add vehicle diffs
    diffItems.addAll(this.compareLineField("Vehicles", 3))
    
    // Add cost diffs
    diffItems = addSplittableDiffs(diffItems, \ w -> w.Vehicles*.Coverages*.Costs.toList(), \ s -> getCostKey(s))
    
    return diffItems 
  }

  private function getCostKey(cost : PACost) : String {
    return cost.CostKey + cost.Coverage.PatternCode 
  }
  
  /**
   * Filters diff items that apply to the Personal Auto LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */   
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.filterDiffItems(diffItems)
    return diffItems
  }
}
