package gw.policy

uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.CoverageCategory
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ExclusionPattern
uses gw.web.productmodel.ProductModelSyncIssueWrapper

uses java.util.Collections
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.ExclusionPattern
uses gw.api.productmodel.ExclusionPattern

enhancement CoverableEnhancement : Coverable {

  property get CategorizedCoverages() : java.util.Map< CoverageCategory, java.util.List<Coverage> > {
     return this.CoveragesFromCoverable.toList().partition( \ c -> c.Pattern.CoverageCategory )
  }

  property get CategorizedExclusions() : java.util.Map< CoverageCategory, java.util.List<Exclusion> > {
     return this.ExclusionsFromCoverable.partition( \ c -> c.Pattern.CoverageCategory ).mapValues( \ i -> i.toList() )
  }

  property get CategorizedConditions() : java.util.Map< CoverageCategory, java.util.List<PolicyCondition> > {
     return this.ConditionsFromCoverable.partition( \ c -> c.Pattern.CoverageCategory ).mapValues( \ i -> i.toList() )
  }

  /**
   * Returns a List of the coverages that are not in the given categories.
   */
  function getCoveragesNotInCategories(excludeCategories : String[]) : List<Coverage> {
    return this.CoveragesFromCoverable.where(
        \ c -> not excludeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * Returns a List of the exclusions that are not in the given categories.
   */
  function getExclusionsNotInCategories(excludeCategories : String[]) : List<Exclusion> {
    return this.ExclusionsFromCoverable.where(
        \ c -> not excludeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * Returns a List of the conditions that are not in the given categories.
   */
  function getConditionsNotInCategories(excludeCategories : String[]) : List<PolicyCondition> {
    return this.ConditionsFromCoverable.where(
        \ c -> not excludeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * Returns a List of the coverages that ARE in the given categories.
   */
  function getCoveragesInCategories(includeCategories : String[]) : List<Coverage> {
    return this.CoveragesFromCoverable.where(
        \ c -> includeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * Returns a List of the exclusions that ARE in the given categories.
   */
  function getExclusionsInCategories(includeCategories : String[]) : List<Exclusion> {
    return this.ExclusionsFromCoverable.where(
        \ c -> includeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * Returns a List of the conditions that ARE in the given categories.
   */
  function getConditionsInCategories(includeCategories : String[]) : List<PolicyCondition> {
    return this.ConditionsFromCoverable.where(
        \ c -> includeCategories.contains( c.Pattern.CoverageCategory.Code ) ).toList()
  }

  /**
   * If this coverable has never had its initial set of coverages created, invokes the createCoverages
   * method and returns an empty list of issues.  Otherwise, calls through to syncCoverages and
   * returns the resulting issues.
   */
  function createOrSyncCoverages() : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialCoveragesCreated) {
      this.createCoverages()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncCoverages()
    }
  }

  /**
   * If this coverable has never had its initial set of coverages created, invokes the createCoverages
  * method and returns an empty list of issues.  Otherwise, calls through to syncCoverages for specified
    * Coverage Patterns and returns the resulting issues.
   */
  function createOrSyncCoverages(patternsToSync : CoveragePattern[]) : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialCoveragesCreated) {
      this.createCoverages()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncCoverages(patternsToSync)
    }
  }

  /**
   * If this coverable has never had its initial set of exclusions created, invokes the createExclusions
   * method and returns an empty list of issues.  Otherwise, calls through to syncExclusions and
   * returns the resulting issues.
   */
  function createOrSyncExclusions() : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialExclusionsCreated) {
      this.createExclusions()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncExclusions()
    }
  }

  /**
   * If this coverable has never had its initial set of exclusions created, invokes the createExclusions
   * method and returns an empty list of issues.  Otherwise, calls through to syncExclusions for specified
   * Exclusion Patterns and returns the resulting issues.
   */
   function createOrSyncExclusions(patternsToSync : ExclusionPattern []) : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialExclusionsCreated) {
      this.createExclusions()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncExclusions(patternsToSync)
    }
  }

   /**
    * If this coverable has never had its initial set of conditions created, invokes the createCnditions
    * method and returns an empty list of issues.  Otherwise, calls through to syncConditions and
    * returns the resulting issues.
    */
   function createOrSyncConditions() : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialConditionsCreated) {
      this.createConditions()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncConditions()
    }
  }

  /**
    * If this coverable has never had its initial set of conditions created, invokes the createCnditions
    * method and returns an empty list of issues.  Otherwise, calls through to syncConditions for specified
    * Condition Patterns and returns the resulting issues.
    */
   function createOrSyncConditions(patternsToSync : ConditionPattern []) : List<ProductModelSyncIssueWrapper> {
    if (!this.InitialConditionsCreated) {
      this.createConditions()
      return Collections.emptyList<ProductModelSyncIssueWrapper>()
    } else {
      return this.syncConditions(patternsToSync)
    }
  }

  /**
   * Checks this coverable against the product model, fixes any issues marked ShouldFixDuringNormalSync,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncCoverages() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkCoveragesAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable's coverages that correspond to specified Coverage Patterns against the product model,
   * fixes any issues marked ShouldFixDuringNormalSync, and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncCoverages(patternsToSync : CoveragePattern[]) : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkCoveragesAgainstProductModel(patternsToSync)
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable against the product model, fixes any issues marked ShouldFixDuringNormalSync,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncExclusions() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkExclusionsAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable's exclusions for specified exclusion patterns against the product model, fixes any
   * issues marked ShouldFixDuringNormalSync, and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncExclusions(patternsToSync : ExclusionPattern []) : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkExclusionsAgainstProductModel(patternsToSync)
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable against the product model, fixes any issues marked ShouldFixDuringNormalSync,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncConditions() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkConditionsAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable's conditions for specified condition patterns against the product model, fixes
   * any issues marked ShouldFixDuringNormalSync, and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncConditions(patternsToSync : ConditionPattern []) : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkConditionsAgainstProductModel(patternsToSync)
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringNormalSync(this)

    return issueWrappers
  }

  /**
   * Checks this coverable against the product models, fixes any issues marked ShouldFixDuringQuote,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncCoveragesForQuote() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkCoveragesAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringQuote(this)

    return issueWrappers
  }

  /**
   * Checks this coverable against the product models, fixes any issues marked ShouldFixDuringQuote,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncExclusionsForQuote() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkExclusionsAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringQuote(this)

    return issueWrappers
  }

  /**
   * Checks this coverable against the product models, fixes any issues marked ShouldFixDuringQuote,
   * and returns all the issues detected regardless of whether or not they were fixed.
   */
  function syncConditionsForQuote() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkConditionsAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )

    issueWrappers.fixDuringQuote(this)

    return issueWrappers
  }

  /**
   * Returns the coverage on this coverable for the given pattern. If no such coverage exists, a
   * new one is created and returned. Throws if the pattern is not compatible with this coverable.
   */
  function getOrCreateCoverage( covPattern : CoveragePattern) : Coverage {
    var coverage = this.getCoverage( covPattern )
    if ( coverage == null ) {
      coverage = this.createCoverage( covPattern )
    }
    return coverage
  }

  /**
   * Returns the exclusion on this coverable for the given pattern. If no such exclusion exists, a
   * new one is created and returned. Throws if the pattern is not compatible with this coverable.
   */
  function getOrCreateExclusion( exclPattern : ExclusionPattern) : Exclusion {
    var exclusion = this.getExclusion( exclPattern )
    if ( exclusion == null ) {
      exclusion = this.createExclusion( exclPattern )
    }
    return exclusion
  }

  /**
   * Returns the condition on this coverable for the given pattern. If no such condition exists, a
   * new one is created and returned. Throws if the pattern is not compatible with this coverable.
   */
  function getOrCreateCondition( condPattern : ConditionPattern) : PolicyCondition {
    var condition = this.getCondition( condPattern )
    if ( condition == null ) {
      condition = this.createCondition( condPattern )
    }
    return condition
  }

  /**
   * Returns true if this coverable has a coverage for "covPattern" <i>or</i> if "covPattern" is
   * available for this coverable. This is called by the UI to determine which coverages to show.
   */
  function isCoverageSelectedOrAvailable( covPattern : CoveragePattern) : boolean {
    return this.hasCoverage( covPattern ) or this.isCoverageAvailable( covPattern )
  }

  /**
   * Returns true if this coverable has an exclusion for "exclPattern" <i>or</i> if "exclPattern" is
   * available for this coverable. This is called by the UI to determine which exclusions to show.
   */
  function isExclusionSelectedOrAvailable( exclPattern : ExclusionPattern) : boolean {
    return this.hasExclusion( exclPattern ) or this.isExclusionAvailable( exclPattern )
  }

  /**
   * Returns true if this coverable has a coverage for "covPattern" <i>or</i> if "covPattern" is
   * available for this coverable. This is called by the UI to determine which coverages to show.
   */
  function isConditionSelectedOrAvailable( condPattern : ConditionPattern) : boolean {
    return this.hasCondition( condPattern ) or this.isConditionAvailable( condPattern )
  }
}