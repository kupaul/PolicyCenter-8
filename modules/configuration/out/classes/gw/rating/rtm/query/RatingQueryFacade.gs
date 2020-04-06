package gw.rating.rtm.query

uses gw.api.rating.RateQueryResult
uses gw.api.system.PCLoggerCategory
uses gw.rating.rtm.NoSuitableRateBookFoundException

uses java.lang.Comparable
uses java.lang.IllegalArgumentException
uses java.util.ArrayList
uses java.util.Map

/**
 * <code>RatingQueryFacade</code> provide the main entry point to query data from rating tables. 
 * The <code>RatingQueryFacade</code> performs two actions:
 * <ul>
 * <li>Query for a rate book based on values in a <code>RateBookQueryFilter</code></li>
 * <li>Query for a factor in the requested table based on <code>RateQueryParam</code>s</li>
 * </ul>
 */
@Export
class RatingQueryFacade {

  var _queryFactory : QueryStrategyFactory
  
  /**
   * Construct a new <code>RatingQueryFacade</code> that will use a defualt <code>QueryStrategyFactory</code>
   */ 
  construct() {
    this(new QueryStrategyFactory())
  }
  
  /**
   * Construct a new <code>RatingQueryFacade</code> that will use the provided <code>QueryStrategyFactory</code>
   * 
   * @param queryFactory: A <code>QueryStrategyFactory</code> instance that will be used to create an instance of 
   *                      <code>AbstractFactorQuery</code>, that in turn is used to query the table for a factor
   */
  construct(queryFactory : QueryStrategyFactory) {
    this._queryFactory = queryFactory
  }
  
  /**
   * Query for a factor in a <code>RateBook</code> and <code>RateTable</code> based on <code>RateBookQueryFilter</code> 
   * and <code>RateQueryParam</code>s
   *  
   * @param filter contains parameters for finding a <code>RateBook</code>
   * @param tableCode the table code for the target <code>RateTable</code> that contains the requested factors
   * @param inputParam a parameter to match a factor in the <code>RateTable</code>, based on the <code>MatchOperation</code>
   * defined on the table
   * 
   * @return a <code>RateQueryResult</code> that holds the result factor 
   */
  @Deprecated("Use getFactor(:RateBookQueryFilter, :String, : Comparable[]) instead","8.0.1")
  function getFactor<Q extends Comparable, R>(filter : RateBookQueryFilter, tableCode : String, inputParam : RateQueryParam<Q>) :  RateQueryResult<R>  {
    return getFactor<Q, R>(filter, tableCode, {inputParam})
  }
  
  /**
   * Query for a factor in a <code>RateBook</code> and <code>RateTable</code> based on <code>RateBookQueryFilter</code> 
   * and <code>RateQueryParam</code>s
   *  
   * @param filter contains parameters for finding a <code>RateBook</code>
   * @param tableCode the table code for the target <code>RateTable</code> that contains the requested factors
   * @param inputParams list of parameter to match a factor in the <code>RateTable</code>, based on the <code>MatchOperation</code>
   * defined on the table
   * 
   * @return a <code>RateQueryResult</code> that holds the result factor 
   */
  @Deprecated("Use getFactor(:RateBookQueryFilter, :String, : Comparable[]) instead","8.0.1")
  function getFactor<Q extends Comparable, R>(filter : RateBookQueryFilter, tableCode : String, inputParams : List<RateQueryParam<Q>>) :  RateQueryResult<R>  {
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Query for: ${filter.toString()} table: ${tableCode} query params: ${inputParams}")
    }
    var rateBook = getRateBookFor(filter)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Rate book found: ${rateBook.BookCode} @ ${rateBook.BookEdition}")
    }
    var table = rateBook.getTable(tableCode)
    var result = _queryFactory.getFactorQuery(table).query<R>(table, inputParams, table.Definition.Factors[0].ColumnName)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Factor found: ${result.Factor}")
    }
    return result
  }

  /**
   * Query for a factor in a <code>RateBook</code> and <code>RateTable</code> based on <code>RateBookQueryFilter</code>
   * and <code>RateQueryParam</code>s
   *
   * @param filter contains parameters for finding a <code>RateBook</code>
   * @param tableCode the table code for the target <code>RateTable</code> that contains the requested factors
   * @param inputParams list of ordered inputs used to match a factor in the <code>RateTable</code>, based on the <code>MatchOperation</code>
   * defined on the table
   *
   * @return a <code>RateQueryResult</code> that holds the result factor
   */
  function getFactor<Q extends Comparable, R>(filter : RateBookQueryFilter, tableCode : String, inputParams : Comparable[]) :  RateQueryResult<R>  {
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Query for: ${filter.toString()} table: ${tableCode} query params: ${inputParams}")
    }
    var rateBook = getRateBookFor(filter)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Rate book found: ${rateBook.BookCode} @ ${rateBook.BookEdition}")
    }
    var table = rateBook.getTable(tableCode)
    var result = _queryFactory.getFactorQuery(table).convertParamsAndQuery<R>(table, inputParams, null)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Factor found: ${result.Factor}")
    }
    return result
  }

  /**
   * Query for factors in a <code>RateBook</code> and <code>RateTable</code> based on <code>RateBookQueryFilter</code>
   * and <code>RateQueryParam</code>s
   *
   * @param filter contains parameters for finding a <code>RateBook</code>
   * @param tableCode the table code for the target <code>RateTable</code> that contains the requested factors
   * @param inputParams list of ordered inputs used to match a factor in the <code>RateTable</code>, based on the <code>MatchOperation</code>
   * defined on the table
   *
   * @return a map of factors as name, value pairs.
   */
  function getAllFactors(filter : RateBookQueryFilter, tableCode : String, inputParams : Comparable[]) : Map<String, Object> {
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Query for: ${filter.toString()} table: ${tableCode} query params: ${inputParams}")
    }
    var rateBook = getRateBookFor(filter)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Rate book found: ${rateBook.BookCode} @ ${rateBook.BookEdition}")
    }
    var table = rateBook.getTable(tableCode)
    var result = _queryFactory.getFactorQuery(table).convertAndQueryMultipleFactors(table, inputParams)
    if (PCLoggerCategory.RTM.DebugEnabled) {
      PCLoggerCategory.RTM.debug("Factors found: ${result.Values}")
    }

    return result
  }

  /**
   * Find a <code>RateBook> based on parameters in the filter
   * 
   * @param filter contains the filter values - dates, policy line, status, and optionaly UW company, jurisdiction and offerings
   * that define the query for the <code>RateBook</code>
   * 
   * @return the <code>RateBook</code> with the latest activation date that is the best matche for the  filter
   * @throws NoSuitableRateBookFoundException if there were no matches.
   */
  protected function getRateBookFor(filter : RateBookQueryFilter) : RateBook {
    var matches = matchRateBook(filter, matchers(filter))
    return latestActiveBook(matches)
  }
  
  /**
   * Worker function used to implement getRateBookFor(filter).   Uses a filter and a list of
   * matchers. Normally, the list of matchers is obtained from RatingQueryFacade.matchers(filter).
   * @param filter A RateBookQueryFilter containing the desired search properties
   * @param matchers A list of matchers which are used to filter the books. 
   * @return All books which satisfy the filter and matchers
   * @throws NoSuitableRateBookFoundException if there were no matches.
   */
  static function matchRateBook(filter : RateBookQueryFilter, matchers : List<RateBookMatcher>) : List<RateBook> {
    var candidates = RateBookMatcher.getBooksFor(filter)
    for (m in matchers) {
      var matches = m.filter(candidates)
      if (!matches.Empty) {
        return matches
      }
    }
    throw new NoSuitableRateBookFoundException("No rate book found for filter ${filter}")
  }
  
  /**
   * create a list of <code>RateBookMatcher</code>s based on values from the 
   * <codeRateBookQueryFilter</code> for:
   * <ul>
   * <li>UW Company</li>
   * <li>Jurisdiction</li>
   * <li>Offering</li>
   * </ul>
   * 
   * This function defines the priority order in which <code>RateBook</codes will be matched if
   * no exact match is found. Currently teh priority order is as defined by the list above
   * 
   * @param filter a <code>RateBookQueryFilter</code> that holds the query parameters
   * 
   * @return list of <code>RateBookMatcher</code>s that will be used to match a <code>RateBook</code>
   */
  static function matchers(filter : RateBookQueryFilter) : List<RateBookMatcher> {
    var matchers = new ArrayList<RateBookMatcher>()
            
    matchers.add(new RateBookMatcher(filter.UWCompany, filter.Jurisdiction, filter.Offering))
    matchers.add(new RateBookMatcher(filter.UWCompany, filter.Jurisdiction, null))
    matchers.add(new RateBookMatcher(filter.UWCompany, null, filter.Offering))
    matchers.add(new RateBookMatcher(null, filter.Jurisdiction, filter.Offering))

    matchers.add(new RateBookMatcher(filter.UWCompany, null, null))
    matchers.add(new RateBookMatcher(null, filter.Jurisdiction, null))
    matchers.add(new RateBookMatcher(null, null, filter.Offering))

    matchers.add(new RateBookMatcher(null, null, null))

    return matchers
  }

  /**
   * @return member of the given list of books which has the most recent LastStatusChangeDate.
   * @throws IllegalArgumentException if list of books is empty.
   */
  static function latestActiveBook(books : List<RateBook>) : RateBook {
    if (books.Empty) throw new IllegalArgumentException("No rate books found")
    // should be able to do
    // return books.maxBy(\ book -> book.LastStatusChangeDate)
    // but it breaks tests.
    books.sortBy(\ book -> book.LastStatusChangeDate)
    return books.last()
  }
}
