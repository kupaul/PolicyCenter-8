package gw.plugin.diff.impl

uses gw.api.diff.DiffItem
uses gw.api.productmodel.CovTermPattern

uses java.util.ArrayList
uses java.util.List

/**
 * This class contains methods to help with adding and filtering diff items for a 
 * Workers Compensation line of business. 
 */
@Export
class WCDiffHelper extends DiffHelper<entity.WorkersCompLine>
{
  construct(reason : DiffReason, polLine1 : entity.WorkersCompLine, polLine2 : entity.WorkersCompLine) {
    super(reason, polLine1, polLine2)
  }

  /**
   * Adds diff items that apply to the Workers Comp LOB, e.g. Jurisdictions information
   * @param diffItems - list of diff items to add to
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */  
  override function addDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {
    diffItems = super.addDiffItems(diffItems)
    
    // Manually add diffs for retrospective and participating plans
    diffItems.addAll(createDiffsForEntity(diffItems, Line1.RetrospectiveRatingPlan, Line2.RetrospectiveRatingPlan))
    diffItems.addAll(createDiffsForEntity(diffItems, Line1.ParticipatingPlan, Line2.ParticipatingPlan))
    
    // Add diffs for line fields
    diffItems.addAll(DiffUtils.compareBeans(Line1, Line2, 2))  
    
    // Add diffs for 'assigned risk' field on policy info
    diffItems.addAll(this.comparePolicyPeriodField("AssignedRisk", 0))

    return diffItems
  } 

  /**
   * Filters diff items that apply to the Workers Comp LOB
   * @param diffItems - list of diff items to filter
   * @return List<DiffItem> - returns the list of diff items that we've modified
   */ 
  override function filterDiffItems(diffItems : List<DiffItem>) : List<DiffItem> {  
    // Exposures, Modifiers, and Covered employees need to be handled differently because they split
    var filteredDiffItems = new ArrayList<DiffItem>()
    var hasSplittableEntity = false
    for (item in diffItems) {
      if (isSplittableEntity(item.Bean)) {
        hasSplittableEntity = true
        continue
      }
      filteredDiffItems.add(item)
    }
    // If there were splittable entities in the list of diff items, set the list of diffItems to 
    // filteredDiffItems (which does not contain any splittable entities), and
    // then add them back with special handling for splits. 
    if (hasSplittableEntity and this.Line2.Branch.Renewal == null) {
      diffItems = filteredDiffItems
      diffItems = addWCExposureDiffs(diffItems)    
      diffItems = addWCModifierDiffs(diffItems)
      diffItems = addWCJurisdictionDeductibleDiffs(diffItems)
    }
    diffItems = super.filterDiffItems(diffItems)
    return diffItems
  }
  
  private function isSplittableEntity(bean : KeyableBean) : boolean {
    if (bean typeis WCCoveredEmployee or 
        bean typeis WCModifier or 
        bean typeis WCStateCov) {
      return true
    }
    return false
  }
  
  private function addWCExposureDiffs(diffItems : List<DiffItem>) : List<DiffItem> {
    return addSplittableDiffs(diffItems, \ w -> w.AllWCExposuresWM, \ s -> getEmpKey(s))
  }

  private function addWCJurisdictionDeductibleDiffs(diffItems : List<DiffItem>) : List<DiffItem> {
    return addSplittableDiffs(diffItems, \ w -> getCoveragesWithTermValues(w, "WCDeductible"), \ s -> getCoverageKey(s))
  }
   
  private function addWCModifierDiffs(diffItems : List<DiffItem>) : List<DiffItem> {
    return addSplittableDiffs(diffItems, \ w -> getEligibleModifiers(w), \ s -> getModKey(s))
  }
  
  private function getEmpKey(exposure : WCCoveredEmployee) : String {
    return exposure.Location.FixedId + " " + exposure.ClassCode
  }
  
  private function getModKey(mod : WCModifier) : String {
    return mod.PatternCode + " " + mod.State
  }
  
  private function getCoverageKey(cov : WCStateCov) : String {
    return cov.PatternCode + " " + cov.WCJurisdiction.State
  }

  private function getCoveragesWithTermValues(line : entity.WorkersCompLine, pattern : CovTermPattern) : List<WCStateCov> {
    var allCovs = line.Jurisdictions*.AllCoverageVersions.toList().flatten()
    return allCovs.where(\ cov -> cov.getCovTerm(pattern).DisplayValue != "")
  }  
  
  private function getEligibleModifiers(line : entity.WorkersCompLine) : List<WCModifier> {
    var allMods = line.Jurisdictions*.AllModifierVersions.toList().flatten()
    return allMods.where(\ mod -> mod.Eligible)
  }
}
