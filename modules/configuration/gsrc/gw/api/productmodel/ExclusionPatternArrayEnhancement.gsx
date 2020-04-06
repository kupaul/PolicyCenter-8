package gw.api.productmodel

enhancement ExclusionPatternArrayEnhancement : gw.api.productmodel.ExclusionPattern[] {
  /**
   * Return an array of ExlcusionPattern's for the specified Coverable
   *   that are selected for the Coverable, or if editable in a UI,
   *   are available.
   *
   * Determining availability is somewhat expensive and not necessary
   * if exclusions are simply going to be displayed.
   */
  function whereSelectedOrAvailable(covered : Coverable, editable : boolean) : ExclusionPattern[] {
    return editable
        ? this.where(\ c -> covered.isExclusionSelectedOrAvailable(c))
        : this.where(\ c -> covered.hasExclusion(c))
  }
}