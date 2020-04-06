package gw.lob.bop

/**
 * Enhancement methods for {@link entity.BOPBuilding BOPBuilding}
 */
enhancement BOPBuildingEnhancement : entity.BOPBuilding {

  /**
   * @return an array of all {@link entity.BOPBuildingCov Coverages} for this {@link entity.BOPBuilding BOPBuilding}
   * @see entity.BOPBuilding#Coverages
   */
  property get SortedCoverages() : entity.BOPBuildingCov[] {
    return this.Coverages
  }

  /**
   * @return an array of {@link entity.BOPClassCode[] BOPClassCode} class codes associated with the primary named insured's industry code, or an empty list if the industry code has not been selected.
   */
  property get ClassCodes() : BOPClassCode[]{
    var ic = this.PolicyLine.Branch.PrimaryNamedInsured.IndustryCode
    return (ic == null ? new BOPClassCode[0] : ic.BOPClassCodes.toTypedArray())                
  }

  /**
   * A display name with location information.
   * <br/><br/>
   * e.g.<br/><br/><i>100 West Tower (1200 Main St. San Carlos, CA 95123)</i><br/><br/>
   * Note: this will depend on the actual {@link entity.BOPBuilding} and {@link entity.BOPLocation} display name implementation.
   * @return the display name of this building with the location's display name appended in parenthesis
   */
  function getBuildingLocationDisplay() : String {
    return this.DisplayName + " (" + this.BOPLocation.DisplayName + ")"
  }
}
