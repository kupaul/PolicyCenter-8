package gw.plugin.diff.impl
uses gw.api.diff.DiffItem

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * Business Auto line of business. 
 */
@Export
class BADiffHelper extends DiffHelper<entity.BusinessAutoLine> {
  
  construct(reason : DiffReason, polLine1 : entity.BusinessAutoLine, polLine2 : entity.BusinessAutoLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Business Auto LOB, e.g. BAModifiers information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */ 
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Add vehicle diffs
    diffItems.addAll(this.compareLineField("Vehicles", 2))
    
    // Add jurisdiction diffs
    diffItems.addAll(this.compareLineField("Jurisdictions", 2))
    
    // Special handling of Hired Auto and Non Owned basis, because DiffUtils doesn't handle one-to-one relationships 
    diffItems = addHiredAutoBasis(diffItems)
    diffItems = addNonOwnedBasis(diffItems)
    
    // Add line coverage, exclusion, condition diffs
    diffItems.addAll(this.compareLineField("BALineCoverages", 2))
    diffItems.addAll(this.compareLineField("BALineExclusions", 2))
    diffItems.addAll(this.compareLineField("BALineConditions", 2))
    
    // Add modifier diffs
    diffItems.addAll(this.compareLineField("BAModifiers", 2))    
    
    // Add driver diffs
    diffItems.addAll(this.compareLineField("Drivers", 1)) 
    
    // Add fleet diffs
    diffItems.addAll(this.compareLineField("Fleet", 0))

    //Add Primary Location diffs
    diffItems.addAll(compareEffectiveDatedFields("PrimaryLocation", 0))

    return diffItems
  }

  /**
   * Filters diff items that apply to the Business Auto LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */   
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.filterDiffItems(diffItems)
    return diffItems 
  }
  
  private function addHiredAutoBasis(diffItems : List<DiffItem>) : List<DiffItem> {
    var hiredAutoBasis1 = Line1.HiredAutoBasis
    var hiredAutoBasis2 = Line2.HiredAutoBasis
    
    for (basis1 in hiredAutoBasis1) {
      var basis2 = hiredAutoBasis2.firstWhere(\ b -> b.Jurisdiction.State == basis1.Jurisdiction.State)
      diffItems.addAll(createDiffsForEntity(diffItems, basis1, basis2))
    }
    return diffItems
  }  
  
  private function addNonOwnedBasis(diffItems : List<DiffItem>) : List<DiffItem> {
    var nonOwnedBasis1 = Line1.NonOwnedBasis
    var nonOwnedBasis2 = Line2.NonOwnedBasis
    
    for (basis1 in nonOwnedBasis1) {
      var basis2 = nonOwnedBasis2.firstWhere(\ b -> b.Jurisdiction.State == basis1.Jurisdiction.State)
      diffItems.addAll(createDiffsForEntity(diffItems, basis1, basis2))
    }
    return diffItems
  }
}