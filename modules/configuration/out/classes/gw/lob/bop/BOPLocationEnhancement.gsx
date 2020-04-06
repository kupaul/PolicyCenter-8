package gw.lob.bop

/**
 * Enhancement methods for {@link entity.BOPLocation BOPLocation}
 */
enhancement BOPLocationEnhancement : entity.BOPLocation {

  /**
   * @return an array of {@link entity.BOPLocationCov BOPLocationCov} coverages associated with this location
   */
  property get SortedCoverages() : BOPLocationCov[] {
    return this.Coverages
  }
}
