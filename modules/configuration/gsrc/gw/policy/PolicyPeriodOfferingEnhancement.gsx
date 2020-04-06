package gw.policy


uses gw.api.domain.covterm.CovTerm
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CovTermPattern
uses gw.api.productmodel.Offering

uses gw.web.productmodel.ProductModelSyncIssueWrapper

uses java.util.ArrayList
uses java.util.HashMap
uses java.util.HashSet
uses java.util.Map
uses gw.api.productmodel.ClausePattern
uses gw.web.productmodel.MissingSuggestedCoverageIssueWrapper
uses gw.web.productmodel.MissingSuggestedConditionIssueWrapper
uses gw.web.productmodel.MissingSuggestedExclusionIssueWrapper
uses java.util.Set
uses gw.web.productmodel.MissingRequiredCoverageIssueWrapper
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

enhancement PolicyPeriodOfferingEnhancement : entity.PolicyPeriod {

  /**
   * Force the current offering onto the period, this will change coverage terms to the offering defaults, for example.
   * If no offering is associated with the period, the base defaults will be applied.
   * 
   * @param runInitScripts if true, for those coverages in the offering that are in the period, the initialization
   *        script will be executed.  if false, the initialization scripts will not be executed
   * @return list of {@link ProductModelSyncIssueWrapper}
   */
  function forceSyncOffering(runInitScripts : boolean) : List<ProductModelSyncIssueWrapper> {
    var issues = new ArrayList<ProductModelSyncIssueWrapper>()

    var coverableIssues = syncCoverables()
    if (not coverableIssues.Empty) {
      issues.addAll(coverableIssues)
    }
    issues.addAll(syncModifiers())
    issues.addAll(syncOffering())
    issues.addAll(this.syncQuestions())
    issues.addAll(this.syncPolicyTerm())
    issues.addAll(this.syncPolicyLines())

    var covPatsForNewlyCreatedCoverages = getCovPatternsCreatedFromSyncFixes(coverableIssues)

    // Set the default values back for the cov terms. Skip over those which
    // were created as a result of syncing as they have the proper default values.
    applyOfferingForCoverageCovTerms(covPatsForNewlyCreatedCoverages)

    // Run initialization scripts for coverages.  Skip over those which
    // were created as a result of syncing as they will have already run
    // their initialization scripts.
    if (runInitScripts) {
      runInitializationScripts(covPatsForNewlyCreatedCoverages)
    }

    applyOfferingForConditionCovTerms()
    applyOfferingForExclusionCovTerms()

    return issues;
  }

  /**
   * Convenience method for forcing sync offering on a period - initialization scripts will be run if appplicable
   */
  function forceSyncOffering() {
    forceSyncOffering(true)
  }  
  
  /**
   * Convenience method to set the offering and force sync of the offering in a single call.
   * 
   * @param offering the offering to set this policy period to
   */
  function forceSyncOffering(offering : Offering) {
    forceSyncOffering(true, offering)
  }
  
  /**
   * Convenience method to provide ability to specify whether or not to run init scripts and apply a particular
   * offering in a single step
   * 
   * @param runInitScripts if true, for those coverages in the offering that are in the period, the initialization
   *        script will be executed.  if false, the initialization scripts will not be executed
   * @param offering the offering to set this policy period to
   */
  function forceSyncOffering(runInitScripts : boolean, offering : Offering) : List<ProductModelSyncIssueWrapper> {
    this.Offering = offering
    return forceSyncOffering(runInitScripts)
  }

  /**
   * Sync offering against the product model and fix issues that should be fixed during a normal sync
   * @return list of unfixed @ProductModelSyncIssueWrapper
   */
  function syncOffering() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.checkOfferingAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues(originalIssues)
    issueWrappers.fixDuringNormalSync(this)
    return issueWrappers
  }
  
  /**
   * Sync coverables against the product model and fix issues that should be fixed during a normal sync
   * It also removes any electable coverages that may have been enabled and fixes any suggested coverages
   * @return list of unfixed {@link ProductModelSyncIssueWrapper}
   */
  private function syncCoverables() : List<ProductModelSyncIssueWrapper> {
    var allIssues = new ArrayList<ProductModelSyncIssueWrapper>()
    this.AllCoverables.each(\ coverable -> {
      // NOTE:  This removes electable coverages from the period
      removeElectables(coverable) 

      var issues = coverable.syncCoverages()
      issues.where(\ i -> (i typeis MissingSuggestedCoverageIssueWrapper))
        .each(\ i->i.Issue.fixIssue(coverable))
      allIssues.addAll(issues)

      issues = coverable.syncConditions()
      issues.where(\ i -> (i typeis MissingSuggestedConditionIssueWrapper))
        .each(\ i->i.Issue.fixIssue(coverable))
      allIssues.addAll(issues)
        
      issues = coverable.syncExclusions()
      issues.where(\ i -> (i typeis MissingSuggestedExclusionIssueWrapper))
        .each(\ i->i.Issue.fixIssue(coverable))
      allIssues.addAll(issues)
    })
    return allIssues
  }  

  /**
   * This method removes electable coverages from the current period
   * @param coverable for which the electable coverages will to be removed from
   */
   private function removeElectables(coverable : Coverable) {
     var coveragesToRemove = new ArrayList<ClausePattern>()
     var covCondExcls = coverable.CoveragesConditionsAndExclusionsFromCoverable
     covCondExcls.each(\ clause -> {
       if (ExistenceType.TC_ELECTABLE.equals(clause.Pattern.getExistence(coverable))) {
         coveragesToRemove.add(clause.Pattern)
       }
     })
     if (not coveragesToRemove.Empty) {
       coveragesToRemove.each(\ coverage -> {
         coverable.setCoverageConditionOrExclusionExists(coverage, false)
       })
     }
   }

  /**
   * Sync modifiers against the product model and fix issues that should be fixed during a normal sync
   * @return list of unfixed @ProductModelSyncIssueWrapper
   */
  private function syncModifiers() : List<ProductModelSyncIssueWrapper> {
    var issues = new ArrayList<ProductModelSyncIssueWrapper>()
    this.AllModifiables.each(\ mod -> {
      issues.addAll(mod.syncModifiers())
    })
    return issues
  }

  /**
   * Applies default cov term value logic against coverage terms within exclusions
   */
  private function applyOfferingForExclusionCovTerms() {
    var covTerms = this.Lines*.AllExclusions*.CovTerms as List<CovTerm>
    if (null==covTerms || covTerms.Empty) {
      return
    }
    // Create pattern->defValue map
    if (null!=this.Offering) {
      var patternDefValueMap = new HashMap<CovTermPattern,String>()
      this.Offering.PolicyLineSelections*.ExclusionSelections*.CovTerms*.each(\ ct -> {
        patternDefValueMap[ct.CovTermPattern] = ct.DefaultValue
      })
      if (not patternDefValueMap.Empty) {
        setDefaultsForCovTerms(patternDefValueMap, covTerms)
      }
    } else {
      covTerms.each(\ covTerm -> resetCovTermToDefaultValue(covTerm))
    }
  }

  /**
   * Applies default cov term value logic against coverage terms within conditions
   */
  private function applyOfferingForConditionCovTerms() {
    var covTerms = this.Lines*.AllConditions*.CovTerms as List<CovTerm>
    if (null == covTerms || covTerms.Empty) {
      return
    }
    // Create pattern->defValue map
    if (null!=this.Offering) {
      var patternDefValueMap = new HashMap<CovTermPattern,String>()
      this.Offering.PolicyLineSelections*.ConditionSelections*.CovTerms*.each(\ ct -> {
        patternDefValueMap[ct.CovTermPattern] = ct.DefaultValue
      })
      if (not patternDefValueMap.Empty) {
        setDefaultsForCovTerms(patternDefValueMap, covTerms)
      }
    } else {
      covTerms.each(\ covTerm -> resetCovTermToDefaultValue(covTerm))
    }
  }
  
  /**
   * Applies default cov term value logic against coverage terms within all coverables for the period
   * @param Set<CoveragePattern> the coverage patterns that should not have their CovTerms reset to default.
   */
  private function applyOfferingForCoverageCovTerms(exclusionCovPatterns : Set<CoveragePattern>) {
    var covTerms = this.Lines*.AllCoverages.where(\ cov -> {
          var pattern = cov.Pattern
          return (pattern typeis CoveragePattern and not exclusionCovPatterns.contains(pattern))
        })*.CovTerms as List<CovTerm>
    if (null==covTerms || covTerms.Empty) {
      return
    }
    if (null!=this.Offering) {
      // Create pattern->defValue map
      var patternDefValueMap = new HashMap<CovTermPattern,String>()
      var coveragePatternSet = new HashSet<CoveragePattern>()
      this.Offering.PolicyLineSelections*.CoverageSelections*.each(\ covSel -> {
        coveragePatternSet.add(covSel.CoveragePattern)
        covSel.CovTerms.each(\ ct -> {
          patternDefValueMap[ct.CovTermPattern] = ct.DefaultValue
        })
      })
      if (not patternDefValueMap.Empty) {
        setDefaultsForCovTerms(patternDefValueMap, covTerms)
      }
    } else {
      // No offering; reset everything to base defaults
      covTerms.each(\ covTerm -> {
        resetCovTermToDefaultValue(covTerm)
      })
    }
  }

  /**
   * Determine coverage patterns for suggested and required coverages that were fixed during a product model sync
   * @param prodModSyncIssueWrappers targeted product model sync issue wrappers
   * @return a set of Coverage Patterns for those suggested or required coverages that were missing and fixed
   */
  private function getCovPatternsCreatedFromSyncFixes(prodModSyncIssueWrappers : List<ProductModelSyncIssueWrapper>): Set<CoveragePattern> {
    var createdFromSyncFixes = new HashSet<CoveragePattern>()
    prodModSyncIssueWrappers
      .where(\ wrapper -> wrapper.Issue.Fixed)
      .each(\ wrapper -> {
        if (wrapper typeis MissingSuggestedCoverageIssueWrapper) {
          createdFromSyncFixes.add(wrapper.Issue.Pattern)
        } else if (wrapper typeis MissingRequiredCoverageIssueWrapper) {
          createdFromSyncFixes.add(wrapper.Issue.Pattern)
        }
    })
    return createdFromSyncFixes
  }

  /**
   * Triggers initialization scripts for the current period's coverages, skipping those coverages
   * which are also in the exclusion set
   * @param exclusionCovPatterns set of coverage patterns to exclude from running initialization scripts
   */
  function runInitializationScripts (exclusionCovPatterns : Set<CoveragePattern>) {
    if (null!=exclusionCovPatterns and not exclusionCovPatterns.Empty) {
      this.Lines*.AllCoverages
        .where(\ cov -> {
          var pattern = cov.Pattern
          return (pattern typeis CoveragePattern and not exclusionCovPatterns.contains(pattern))
        })
        .each(\ cov -> cov.fireInitializeEvent())
    } else {
      this.Lines*.AllCoverages.each(\ cov -> cov.fireInitializeEvent())
    }
  }
  
  /**
   * If covterm's pattern is in the patternDefValueMap, use that default value otherwise
   * set the covterm's value to it's own base default value.  If there is no valid default
   * valid, set to null.
   */
  private function setDefaultsForCovTerms(patternDefValueMap : Map<CovTermPattern,String>,
                                          covTerms : List<CovTerm>) {
    covTerms.each(\ covTerm -> {
        var tryCovTermNoOfferingDefault = false
        if (patternDefValueMap.containsKey(covTerm.Pattern)) {
          var defVal = patternDefValueMap.get(covTerm.Pattern)
          if (defVal!=null) {
            covTerm.setValueFromString(defVal)
            tryCovTermNoOfferingDefault = covTerm.checkCovTermValue().Count > 0
          } else {
            tryCovTermNoOfferingDefault = true
          }
        } else {
          tryCovTermNoOfferingDefault = true
        }
        if (tryCovTermNoOfferingDefault) {
          resetCovTermToDefaultValue(covTerm)
        }
      })
  }
  
  /**
   * Reset cov term to base default value.  If base default value is not valid for the period,
   * set the cov term's value to null.
   */
  private function resetCovTermToDefaultValue(covTerm : CovTerm) {
      covTerm.setValueFromString(covTerm.Pattern.getDefaultValue(null))
      if (covTerm.checkCovTermValue().Count > 0) {
        covTerm.setValueFromString(null)
      }
  }
}