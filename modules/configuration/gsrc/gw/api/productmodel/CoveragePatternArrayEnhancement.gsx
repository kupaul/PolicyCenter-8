package gw.api.productmodel

enhancement CoveragePatternArrayEnhancement : CoveragePattern [] {
  /**
   * Return an array of CoveragePattern's for the specified Coverable
   *   that are selected for the Coverable, or if editable in a UI,
   *   are available.
   *
   * Determining availability is somewhat expensive and not necessary
   * if coverages are simply going to be displayed.
   */
  function whereSelectedOrAvailable(covered : Coverable, editable : boolean) : CoveragePattern [] {
    return editable
        ? this.where(\ c -> covered.isCoverageSelectedOrAvailable(c))
        : this.where(\ c -> covered.hasCoverage(c))
  }
}