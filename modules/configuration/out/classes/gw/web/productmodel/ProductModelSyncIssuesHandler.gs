package gw.web.productmodel

uses gw.api.productmodel. *
uses gw.api.web.job.JobWizardHelper
uses gw.commons.entity.KeyableBeanUtil

uses java.util.ArrayList
uses java.util.List

/**
 * General utility class for helping sync with the product model and display issues. 
 * Do not try to create instances of this class.
 * 
 * Product model synchronization can be an extremely performance-intensive process, 
 * particularly if complicated availability scripts have been used in the product 
 * model. To minimize the performance impact, synchronize the smallest possible set
 * of the product model. For example, do not synchronize modifiers if there are no
 * modifiers displayed on the screen.  Do not synchronize all coverages if only 
 * coverages from particular categories are displayed on the screen.  Also, do not 
 * call synchronization any more than necessary.   For example, avoid calling it 
 * when the user modifies a field or executes other actions.  In some cases, it may
 * even be necessary to display less product model data on a single page if adequate 
 * performance cannot be attained.
 */
@Export
class ProductModelSyncIssuesHandler {
  
  private construct() { }
  
  /**
   * Syncs all policy lines on the policy period
   */
  static function syncPolicyLines(helper : JobWizardHelper) { 
    syncWithIssues(helper, \ issues -> issues.addAll(helper.PolicyPeriod.syncPolicyLines()))
  }

  /**
  * Performs a synchronization and returns the issues to the caller.  This method should be used when a synchronization
  * needs to be run in absence of the UI or the SyncIssues need to be used at a later time
  * @coverables the array of Coverable items that need their Coverage updated
  * @return the ProductModelSyncIssueWrapper collection created while synchronizing
  **/
  static function syncCoveragesAndFindIssues(coverables : Coverable[]) : List<ProductModelSyncIssueWrapper> {
    var issues : List<ProductModelSyncIssueWrapper> = {}
    for (c in coverables) {
      issues.addAll(c.createOrSyncCoverages())
    }
    return issues
  }

  /**
   * Calls createOrSyncCoverages on each coverable, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncCoverages(coverables : Coverable[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (c in coverables) {
          issues.addAll(c.createOrSyncCoverages())
        }
      }
    )
  }

  /**
   * Calls createOrSyncCoverages on each coverable for patterns in specified categories only. 
   * It then filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Coverage Categories, beware that some of the required coverage issues
   * might be missed if they fall outside the scope of those categories that are being synced.
   */
  static function syncCoverages(coverables : Coverable[], categories : CoverageCategory[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in coverables) {
          var patternsForCoverable = categories.flatMap(\ category -> category.coveragePatternsForEntity(KeyableBeanUtil.getProductModelAwareEntityType(coverable)))
          issues.addAll(coverable.createOrSyncCoverages(patternsForCoverable))
        }
      }
    )
  }
  
  /**
   * Syncs specified coverages as follows: for each coverage, finds a coverable that it is attached to and syncs coverage pattern for 
   * the coverage on that coverable.
   * It filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Coverages, beware that some of the required coverage issues
   * might be missed if they fall outside the scope of those coverages that are being synced. This method is mainly intended 
   * for syncing cov terms and options on the specified coverages.
   */
  static function syncSpecifiedCoverages(coverages : Coverage[], helper : JobWizardHelper) {
    var coveragesMap = coverages.partition(\coverage -> coverage.OwningCoverable)
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in coveragesMap.Keys) {
          var patternsForCoverable = coveragesMap.get(coverable).map(\coverage -> coverage.Pattern as CoveragePattern).toTypedArray()
          issues.addAll(coverable.createOrSyncCoverages(patternsForCoverable))
        }
      }
    )
  }

 
  /**
   * Calls createOrSyncExclusions on each coverable, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncExclusions(coverables : Coverable[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (c in coverables) {
          issues.addAll(c.createOrSyncExclusions())
        }
      }
    )
  }

   /**
   * Calls createOrSyncExclusions on each coverable for patterns in specified categories only. 
   * It then filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Coverage Categories, beware that some of the required exclusions issues
   * might be missed if they fall outside the scope of those categories that are being synced.
   */
  static function syncExclusions(coverables : Coverable[], categories : CoverageCategory[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in coverables) {
           var patternsForCoverable = categories.flatMap(\ category -> category.exclusionPatternsForEntity(KeyableBeanUtil.getProductModelAwareEntityType(coverable)))
          issues.addAll(coverable.createOrSyncExclusions(patternsForCoverable))
        }
      }
    )
  }
  
   /**
   * Syncs specified exclusions as follows: for each exclusion, finds a coverable that it is attached to and syncs exclusion pattern for 
   * the exclusion on that coverable.
   * It filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Exclusions, beware that some of the required exclusions issues
   * might be missed if they fall outside the scope of the exclusions that are being synced. This method is mainly intended 
   * for syncing cov terms and options on the specified exclusions.
   */
  static function syncSpecifiedExclusions(exclusions : Exclusion[], helper : JobWizardHelper) {
    var exclusionsMap = exclusions.partition(\exclusion -> exclusion.OwningCoverable)
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in exclusionsMap.Keys) {
          var patternsForCoverable = exclusionsMap.get(coverable).map(\exclusion -> exclusion.Pattern as ExclusionPattern).toTypedArray()
          issues.addAll(coverable.createOrSyncExclusions(patternsForCoverable))
        }
      }
    )
  }

  /**
   * Calls createOrSyncConditions on each coverable, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncConditions(coverables : Coverable[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (c in coverables) {
          issues.addAll(c.createOrSyncConditions())
        }
      }
    )
  }
  
  /**
   * Calls createOrSyncConditions on each coverable for patterns in specified categories only. 
   * It then filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Coverage Categories, beware that some of the required conditions issues
   * might be missed if they fall outside the scope of those categories that are being synced.
   */
  static function syncConditions(coverables : Coverable[], categories : CoverageCategory[],  helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in coverables) {
          var patternsForCoverable = categories.flatMap(\ category -> category.conditionPatternsForEntity(KeyableBeanUtil.getProductModelAwareEntityType(coverable)))
          issues.addAll(coverable.createOrSyncConditions(patternsForCoverable))
        }
      }
    )
  }
  
   /**
   * Syncs specified cnditions as follows: for each condition, finds a coverable that it is attached to and syncs condition pattern for 
   * the condition on that coverable.
   * It filters and sorts the issues, and displays the sync issues worksheet if there are any issues to display.
   * 
   * Note: When syncing for specific Conditions, beware that some of the required condition issues
   * might be missed if they fall outside the scope of those conditions that are being synced. This method is mainly intended 
   * for syncing cov terms and options on the specified condition.
   */
  static function syncSpecifiedConditions(conditions : PolicyCondition[], helper : JobWizardHelper) {
    var conditionsMap = conditions.partition(\condition -> condition.OwningCoverable)
    syncWithIssues(helper,
      \ issues -> {
        for (coverable in conditionsMap.Keys) {
          var patternsForCoverable = conditionsMap.get(coverable).map(\condition -> condition.Pattern as ConditionPattern).toTypedArray()
          issues.addAll(coverable.createOrSyncConditions(patternsForCoverable))
        }
      }
    )
  }
       
  /**
   * Calls syncModifiers on each Modifiable, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncModifiers(modifiables : Modifiable[], helper : JobWizardHelper) { 
    syncWithIssues(helper,
      \ issues -> {
        for (m in modifiables) {
          issues.addAll(m.syncModifiers())
        }
      }
    )
  }

  /**
   * Calls syncQuestions on each AnswerContainer, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncQuestions(answerContainers : AnswerContainer[], helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (ac in answerContainers) {
          issues.addAll(ac.syncQuestions())
        }
      }
    )
  }

  /**
   * Calls syncQuestions on each AnswerContainer for specified question sets, filters and sorts the issues, and displays the sync issues
   * worksheet if there are any issues to display.
   */
  static function syncQuestions(answerContainers : AnswerContainer[], questionSets : QuestionSet[],  helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (answerContainer in answerContainers) {
          var allQSInAnswerContainer = answerContainer.QuestionSets.toList()
          var qsForAnswerContainer = questionSets.where(\qs -> allQSInAnswerContainer.contains(qs))
          issues.addAll(answerContainer.syncQuestions(qsForAnswerContainer))
        }
      }
    )
  }
  
  /**
   * Syncs the offering on the period, displaying the sync issues worksheet if needed.
   */
  static function syncOffering(period : PolicyPeriod, helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {issues.addAll(period.syncOffering())}
     )
  }
  
  /**
   * Syncs the PolicyTerm on the period, displaying the sync issues worksheet if needed.
   */
  static function syncPolicyTerm(period : PolicyPeriod, helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {issues.addAll(period.syncPolicyTerm())}
     )
  }


  private static function syncWithIssues(helper : JobWizardHelper, addIssues(issues : ArrayList<ProductModelSyncIssueWrapper>) ) {
    var issuesList = new ArrayList<ProductModelSyncIssueWrapper>()
    addIssues(issuesList)
    if(helper != null){
      filterAndDisplayIssuesAfterSync( issuesList, helper )
    }
  }

  /**
   * Syncs whatever is passed in.  Coverables are synced by calling createOrSyncCoverages, modifiables are synced
   * by calling syncModifiers, and answer containers are synced by calling syncQuestions.  If any
   * issues are found, they're wrapped, filtered, and displayed.
   */
  static function sync(coverables : Coverable[], modifiables : Modifiable[], answerContainers : AnswerContainer[], period : PolicyPeriod, helper : JobWizardHelper) {
    syncWithIssues(helper,
      \ issues -> {
        for (c in coverables) {
          issues.addAll(c.createOrSyncCoverages())
          issues.addAll(c.createOrSyncExclusions())
          issues.addAll(c.createOrSyncConditions())
        } 
        for (m in modifiables) {
          issues.addAll(m.syncModifiers())
        } 
        for (ac in answerContainers) {
          issues.addAll(ac.syncQuestions())
        }
        if (period != null) {
          issues.addAll(period.syncOffering())
          issues.addAll(period.syncPolicyTerm())
          issues.addAll(period.syncPolicyLines())
        }
      }
    )
  }


  /**
   * Filters the issues based on the ShouldDisplayDuringNormalSync method, sorts the issues, and then displays
   * them in the ProductModelSyncIssuesWorksheet if any issues remain after filtering.
   */  
  static function filterAndDisplayIssuesAfterSync(issues : List<ProductModelSyncIssueWrapper>, helper : JobWizardHelper) {
    issues.where( \ i -> i.ShouldDisplayDuringNormalSync ).each(\i -> helper.addSyncIssueToWebMessages( i ))
  }
  
}
