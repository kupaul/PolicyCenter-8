package gw.web.productmodel

uses com.guidewire.commons.entity.BundleProvider

/**
 * Defines utility methods on List of ProductModelSyncIssueWrapper's.
 */
enhancement ListProductModelSyncIssueWrapperEnhancement : List<ProductModelSyncIssueWrapper> {

  /**
   * Iterates over the list of issues and fixes the ones whose
   * {@link gw.web.productmodel.ProductModelSyncIssueWrapper#ShouldFixDuringNormalSync ShouldFixDuringNormalSync}
   * property is true
   *
   * @param provider use a bundle from this provider
   */
  function fixDuringNormalSync(provider : BundleProvider) {
    fixDuringNormalSync(provider, \ fixedIssue -> {})
  }

  /**
   * Iterates over the list of issues and fixes the ones whose
   * {@link gw.web.productmodel.ProductModelSyncIssueWrapper#ShouldFixDuringQuote ShouldFixDuringQuote}
   * property is true
   *
   * @param provider use a bundle from this provider
   */
  function fixDuringQuote(provider : BundleProvider) {
    for ( iw in this ) {
      if ( iw.ShouldFixDuringQuote ) {
        iw.Issue.fixIssue(provider)
      }
    }
  }

  /**
   * Iterates over the list of issues and fixes the ones whose
   * {@link gw.web.productmodel.ProductModelSyncIssueWrapper#ShouldFixDuringQuote ShouldFixDuringQuote}
   * property is true and their {@link gw.api.web.productmodel.ProductModelSyncIssue#isFixed() Issue.Fixed}
   * flag is false
   *
   * @param provider use a bundle from this provider
   */
  function fixDuringQuoteIfNecessary(provider : BundleProvider) {
    fixDuringQuoteIfNecessary( provider, \ fixedIssue -> {} )
  }

  /**
   * Iterates over the list of issues and fixes the ones whose
   * {@link gw.web.productmodel.ProductModelSyncIssueWrapper#ShouldFixDuringQuote ShouldFixDuringQuote}
   * property is true and their {@link gw.api.web.productmodel.ProductModelSyncIssue#isFixed() Issue.Fixed}
   * flag is false
   *
   * @param provider use a bundle from this provider
   * @param notify execute this block upon fixing each issue
   */
  function fixDuringQuoteIfNecessary(provider : BundleProvider, notify(fixedIssue: ProductModelSyncIssueWrapper)) {
    for ( iw in this ) {
      if ( iw.ShouldFixDuringQuote and !iw.Issue.Fixed ) {
        iw.Issue.fixIssue(provider)
        notify(iw)
      }
    }
  }

  /**
   * Iterates over the list of issues and fixes the ones whose
   * {@link gw.web.productmodel.ProductModelSyncIssueWrapper#ShouldFixDuringNormalSync ShouldFixDuringNormalSync}
   * property is true. This method overloads
   * {@link #fixDuringNormalSync(com.guidewire.commons.entity.BundleProvider)}.
   *
   * @param provider use a bundle from this provider
   * @param notify call this block upon fixing each issue
   */
  function fixDuringNormalSync(provider : BundleProvider, notify(fixedIssue: ProductModelSyncIssueWrapper)) {
    for ( iw in this ) {
      if ( iw.ShouldFixDuringNormalSync ) {
        iw.Issue.fixIssue(provider)
        notify(iw)
      }
    }
  }
}
