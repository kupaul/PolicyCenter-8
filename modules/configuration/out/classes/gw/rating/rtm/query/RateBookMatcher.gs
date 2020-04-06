package gw.rating.rtm.query
uses typekey.Jurisdiction
uses typekey.RateBookStatus
uses java.lang.String
uses entity.UWCompany
uses entity.RateBook
uses gw.rating.rtm.query.RateBookQueryFilter
uses java.lang.IllegalArgumentException
uses gw.plugin.Plugins
uses gw.plugin.rateflow.IImpactTestingPlugin
uses gw.rating.flow.util.QueryUtils
uses java.util.Date

/**
 * Perform a match on a <code>RateBook</code> based on its attributes
 */
@Export
class RateBookMatcher {

  var _uwCompany : UWCompany
  var _jurisdiction : Jurisdiction
  var _offering : String

  /**
   * Construct a new <code>RateBookMatcher</code
   *
   * @param uwCompany <code>UWCompany</code> to match agains the <code>RateBook</code>s (can be null)
   * @param jurisdiction <code>Jurisdiction</code> to match agains the <code>RateBook</code>s (can be null)
   * @param offering offering to match agains the <code>RateBook</code>s (can be null)
   */
  construct(uwCompany : UWCompany, jurisdiction : Jurisdiction, offering : String) {
    this._uwCompany = uwCompany
    this._jurisdiction = jurisdiction
    this._offering = offering
  }

  /**
   * Filter the list of <code>RateBook>s based on the values of this matcher
   *
   * @param books list of candidate <code>RateBook</code>s
   *
   * @return a filtered list of <code>RateBook</code>s
   */
  function filter(books : List<RateBook>) : List<RateBook> {
    return books.where(\ book ->
      book.BookJurisdiction ==_jurisdiction and
      book.BookOffering == _offering and
      book.UWCompany == _uwCompany)
  }

  /**
   * Query for <code>RateBook</code>s based on the filter
   *
   * @param filter a <code>RateBookQueryFilter</code> that holds filter definition to use
   * for retrieving <code>RateBook</code>s
   *
   * @return list of <code>RateBook</code>s that match the filter
   */
  static function getBooksFor(filter : RateBookQueryFilter) : List<RateBook> {
    var alternateRatebooks : java.util.List<entity.ImpactTestingRateBook> = {}
    
    if (Plugins.isEnabled(IImpactTestingPlugin)) {
      alternateRatebooks = Plugins.get(IImpactTestingPlugin).AlternateRatebooks
    }

    if (alternateRatebooks.HasElements) {
      // If impact testing is active, use an alternate set of ratebooks
      return alternateRatebooks.map(\ rb -> rb.RateBook).where(\rb -> rb.PolicyLine == filter.PolicyLine)
    } else {
      // Otherwise (normal case) we select ratebooks by dates and status.          
      return QueryUtils.getRateBooksForLine(filter.PolicyLine)
        .where(\ b -> effDate(filter, b) <= filter.QueryRefDate
                  and b.LastStatusChangeDate <= filter.OriginalRateDate
                  and statusLevelsAbove(filter.MinimumRatingLevel).contains(b.Status)
                  and (b.ExpirationDate > filter.QueryRefDate or b.ExpirationDate == null))
    }
  }
 
  private static function effDate(filter : RateBookQueryFilter, book : RateBook) : Date {
    return filter.RenewalJob ? book.RenewalEffectiveDate : book.EffectiveDate
  }

  private static function statusLevelsAbove(minimalStatusLevel : RateBookStatus) : RateBookStatus[] {
    checkNotNull(minimalStatusLevel)
    return RateBookStatus.getTypeKeys(false).where( \ status -> status.Priority >= minimalStatusLevel.Priority).toArray<RateBookStatus>(new RateBookStatus[0])
  }

  private static function checkNotNull(minimalStatusLevel : RateBookStatus) {
    if (minimalStatusLevel == null) {
      throw new IllegalArgumentException("minimum rating level cannot be null")
    }
  }
}