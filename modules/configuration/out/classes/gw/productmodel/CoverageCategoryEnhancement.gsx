package gw.productmodel

uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.CoverageCategory
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ExclusionPattern

enhancement CoverageCategoryEnhancement : CoverageCategory {
  function coveragePatternsForEntity(entityType : Type) : CoveragePattern[] {
    return this.CoveragePatterns.where(\ c -> c.OwningEntityType == entityType.RelativeName).toTypedArray()
  }

  /**
   * Return an array of CoveragePattern's of this category for the specified
   *   Coverable that are selected for the Coverable, or if editable in a UI,
   *   are available.
   *
   * Determining availability is somewhat expensive and not necessary
   * if coverages are simply going to be displayed.
   */
  function availableCoveragePatternsForCoverable(coveredObject : Coverable, editable : boolean) : CoveragePattern[] {
    return (editable
      ? this.CoveragePatterns.where(\ c -> coveredObject.isCoverageSelectedOrAvailable(c))
      : this.CoveragePatterns.where(\ c -> coveredObject.hasCoverage(c))).toTypedArray()
  }

  @Deprecated("In PC 8.0.  Replace with availableCoveragePatternsForCoverable(coveredObject, editable)")
  function availableCoveragePatternsForCoverable(coveredObject : Coverable) : CoveragePattern[] {
    return this.availableCoveragePatternsForCoverable(coveredObject, true)
  }

  function conditionPatternsForEntity(entityType : Type) : ConditionPattern [] {
    return this.ConditionPatterns.where(\ c -> c.OwningEntityType == entityType.RelativeName).toTypedArray()
  }

  /**
   * Return an array of ConditionPattern's of this category for the specified
   *   Coverable that are selected for the Coverable, or if editable in a UI,
   *   are available.
   *
   * Determining availability is somewhat expensive and not necessary
   * if conditions are simply going to be displayed.
   */
  function availableConditionPatternsForCoverable(coveredObject : Coverable) : ConditionPattern [] {
    return this.ConditionPatterns.where(\ c -> coveredObject.isConditionSelectedOrAvailable(c)).toTypedArray()
  }

  function exclusionPatternsForEntity(entityType : Type) : ExclusionPattern [] {
    return this.ExclusionPatterns.where(\ c -> c.OwningEntityType == entityType.RelativeName).toTypedArray()
  }

  /**
   * Return an array of ExclusionPattern's of this category for the specified
   *   Coverable that are selected for the Coverable, or if editable in a UI,
   *   are available.
   *
   * Determining availability is somewhat expensive and not necessary
   * if exclusions are simply going to be displayed.
   */
  function availableExclusionPatternsForCoverable(coveredObject : Coverable, editable : boolean) : ExclusionPattern [] {
    return (editable
      ? this.ExclusionPatterns.where(\ c -> coveredObject.isExclusionSelectedOrAvailable(c))
      : this.ExclusionPatterns.where(\ c -> coveredObject.hasExclusion(c))).toTypedArray()
  }

  @Deprecated("In PC 8.0.  Replace with availableExclusionPatternsForCoverable(coveredObject, editable)")
  function availableexclusionPatternsForCoverable(coveredObject : Coverable) : ExclusionPattern [] {
    return this.availableExclusionPatternsForCoverable(coveredObject, true)
  }
}