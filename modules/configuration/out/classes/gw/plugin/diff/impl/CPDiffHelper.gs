package gw.plugin.diff.impl
uses gw.api.diff.DiffItem
uses gw.api.diff.DiffProperty
uses gw.entity.IEntityPropertyInfo
uses gw.api.diff.DiffAdd
uses java.util.HashMap
uses gw.api.diff.DiffRemove

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * Commercial Property line of business. 
 */
@Export
class CPDiffHelper extends DiffHelper<CommercialPropertyLine> {
  
  construct(reason : DiffReason, polLine1 : CommercialPropertyLine, polLine2 : CommercialPropertyLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Commercial Property LOB, e.g. CPLocations information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Add location diffs
    diffItems.addAll(this.compareLineField("CPLocations", 5))

    // Add blanket diffs
    diffItems = addBlanketDiffs(diffItems)
    
    // Add modifier diffs
    diffItems.addAll(this.compareLineField("CPModifiers", 2))

    // Only add the building diff items for 'added' or 'removed' locations when importing from spreadsheet
    if (this.DifferenceReason == DiffReason.TC_IMPORT) {
      createDiffItemsForBuildings(diffItems)
    }
    
    return diffItems
  } 

  /**
   * Filters diff items that apply to the Commercial Property LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */ 
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.filterDiffItems(diffItems)
    return diffItems
  }
  
  private function addBlanketDiffs(diffItems : List<DiffItem>) : List<DiffItem> {
    var blanketDiffItems = this.compareLineField("CPBlankets", 2)
    var basedOnCovs = Line1.CPLocations*.Buildings*.Coverages.toList()
    for (item in blanketDiffItems) {
      if (not (item.Bean typeis CPBuildingCov)) { 
        diffItems.add(item)
      }
    }
    for (buildingCov in Line2.CPLocations*.Buildings*.Coverages) {
      var matchingCov = basedOnCovs.firstWhere(\ cov -> cov.FixedId == buildingCov.FixedId)
      if (matchingCov != null and buildingCov.CPBlanket.FixedId != matchingCov.CPBlanket.FixedId) {
        var prop = CPBuildingCov.Type.TypeInfo.getProperty("CPBlanket") as IEntityPropertyInfo
        diffItems.add(new DiffProperty(buildingCov, matchingCov, prop))
      }
    }
    return diffItems
  }

  /**
   * This creates new diff items for the buildings and building coverages for an added or removed location from an import.
   * The reason why this needs to be done manually is because for added or removed locations, we don't create the diff items
   * for the child entities of the location.
   * @param diffItems - the current list of diff items that the new diffs will be added to
   */
  private function createDiffItemsForBuildings(diffItems : List<DiffItem>) {
    var buildingMap = new HashMap<CPBuilding, boolean>()
    var locDiffItems = diffItems.where( \ item -> item.Bean typeis CPLocation and (item.Add or item.Remove))

    // Get the already created building diff items that were added/removed
    var buildingDiffItems = diffItems.where( \ item -> item.Bean typeis CPBuilding and (item.Add or item.Remove))
    buildingDiffItems.each( \ buildingDiffItem -> buildingMap.put(buildingDiffItem.Bean as CPBuilding, buildingDiffItem.Add))

    // Need to get the buildings from the added/removed locations because the buildings have no diff item created for them
    for (locDiffItem in locDiffItems) {
      var buildings = (locDiffItem.Bean as CPLocation).Buildings
      buildings.each( \ building -> buildingMap.put(building, locDiffItem.Add))
    }

    // Create the diff items for each building in the map
    for (building in buildingMap.Keys) {
      if (buildingMap.get(building)){
        var diffItem = new DiffAdd(building)
        diffItems.add(diffItem)
        createDiffItemsForAddedBuildingCoverages(diffItems, building)
      } else {
        var diffItem = new DiffRemove(building)
        diffItems.add(diffItem)
        createDiffItemsForRemovedBuildingCoverages(diffItems, building)
      }
    }
  }

  private function createDiffItemsForAddedBuildingCoverages(diffItems : List<DiffItem>, building : CPBuilding) {
    for (buildingCov in building.Coverages) {
      var diffItem = new DiffAdd(buildingCov)
      diffItems.add(diffItem)
    }
  }

  private function createDiffItemsForRemovedBuildingCoverages(diffItems : List<DiffItem>, building : CPBuilding) {
    for (buildingCov in building.Coverages) {
      var diffItem = new DiffRemove(buildingCov)
      diffItems.add(diffItem)
    }
  }
}
