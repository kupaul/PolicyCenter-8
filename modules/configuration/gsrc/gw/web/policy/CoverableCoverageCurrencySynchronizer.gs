package gw.web.policy

uses gw.api.web.job.JobWizardHelper
uses gw.web.productmodel.ProductModelSyncIssuesHandler
uses gw.api.domain.covterm.DirectCovTerm
uses gw.api.web.productmodel.DisplayOnlyProductModelSyncIssue

/**
 * Currency synchronization routines for a {@link Coverable}
 */
@Export
class CoverableCoverageCurrencySynchronizer {

  /**
   * Determines and returns the available currencies for a {@link Coverable}
   */
  static function getAvailableCurrencies(coverable : Coverable) : List<Currency> {
    if (coverable == null) return {}
    return coverable.PolicyLine.Pattern.AvailableCoverageCurrencies.map(\elt -> elt.Currency)
  }

  /**
   * Synchronize the coverage currencies with their {@link Coverable} currency and
   * synchronize the product model
   */
  static function synchronizeCurrencies(coverable: Coverable, jobWizardHelper: JobWizardHelper) {
    coverable.CoveragesFromCoverable.each(\ coverage -> {
      coverage.Currency = coverable.PreferredCoverageCurrency
      coverage.CovTerms.each(\term -> {
        // We only have to consider DirectCovTerms here since the product model synchronization will remove and reset
        // Package and Option CovTerms as part of the availability logic around currency.
        if (term typeis DirectCovTerm and CovTermModelVal.TC_MONEY == term.Pattern.ValueType) {
          var oldValue = term.Value
          if (oldValue != null) {
            term.setValue(null)
            var issue = new DisplayOnlyProductModelSyncIssue(coverable)
            var message = issue.createMessage(displaykey.Web.JobWizard.ProductModelSync.MonetaryDirectCovTermRemoved(oldValue, term, coverage.DisplayName))
            jobWizardHelper.addWarningWebMessage(message)
          }
        }
      })
    })
    ProductModelSyncIssuesHandler.syncCoverages({coverable}, jobWizardHelper)
  }
}
