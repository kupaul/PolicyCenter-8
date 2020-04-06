package gw.plugin.notification.impl

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Restriction
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.util.DisplayableException
uses gw.plugin.notification.INotificationPlugin
uses java.util.Date
uses java.lang.Integer
uses java.util.Map
uses java.util.ArrayList


@Export
class NotificationPlugin implements INotificationPlugin {
  // These are the columns which will be needed for query restrictions / sorting
  private static var JURISDICTION_COLUMN = "NotificationConfig.Jurisdiction"
  private static var LINE_OF_BUSINESS_COLUMN = "NotificationConfig.LineOfBusiness"
  private static var ACTION_TYPE_COLUMN = "NotificationConfig.ActionType"
  private static var CATEGORY_COLUMN = "NotificationConfig.Category"
  private static var EFFECTIVE_DATE_COLUMN = "NotificationConfig.EffectiveDate"
  private static var EXPIRATION_DATE_COLUMN = "NotificationConfig.ExpirationDate"
  private static var LEAD_TIME_COLUMN = "NotificationConfig.LeadTime"

  public override function getMaximumLeadTime(effDate : Date, lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, actionType : NotificationActionType) : int {
    checkArguments(lineToJurisdictions, actionType)
    var maximum : Integer = null
    forAllLinesAndJurisdictions(lineToJurisdictions, \ lineOfBusiness, jurisdiction -> {
      var leadTime = getLeadTime(effDate, lineOfBusiness, jurisdiction, actionType)
      if (maximum == null || leadTime > maximum) {
        maximum = leadTime
      }
    })
    return maximum
  }

  public override function getMinimumLeadTime(effDate : Date, lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, actionType : NotificationActionType) : int {
    checkArguments(lineToJurisdictions, actionType)
    var minimum : Integer = null
    forAllLinesAndJurisdictions(lineToJurisdictions, \ lineOfBusiness, jurisdiction -> {
      var leadTime = getLeadTime(effDate, lineOfBusiness, jurisdiction, actionType)
      if (minimum == null || leadTime < minimum) {
        minimum = leadTime
      }
    })
    return minimum
  }

  public override function getMaximumLeadTime(effDate : Date, lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, category : NotificationCategory) : int {
    checkArguments(lineToJurisdictions, category)
    var maximum : Integer = null
    forAllLinesAndJurisdictions(lineToJurisdictions, \ lineOfBusiness, jurisdiction -> {
      var leadTime = getMaximumLeadTime(effDate, lineOfBusiness, jurisdiction, category)
      if (maximum == null || leadTime > maximum) {
        maximum = leadTime
      }
    })
    return maximum
  }

  public override function getMinimumLeadTime(effDate : Date, lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, category : NotificationCategory) : int {
    checkArguments(lineToJurisdictions, category)
    var minimum : Integer = null
    forAllLinesAndJurisdictions(lineToJurisdictions, \ lineOfBusiness, jurisdiction -> {
      var leadTime = getMinimumLeadTime(effDate, lineOfBusiness, jurisdiction, category)
      if (minimum == null || leadTime < minimum) {
        minimum = leadTime
      }
    })
    return minimum
  }

  // ---------- Helper methods ----------

  /**
   * Iterates over each combination of line of business and jurisdiction in the passed map calling the passed <code>action</code>.
   * 
   * @param lineToJurisdictions A map from line of business to jurisdiction arrays for each line of business over which to iterate
   * @param action              The action to perform on each iteration
   * 
   * @throws DisplayableException if any of the jurisdictions or lines of business are null
   */
  private function forAllLinesAndJurisdictions(lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>,
                                               action(lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction)) {
    for (lineOfBusiness in lineToJurisdictions.Keys) {
      if (lineOfBusiness == null) {
        throw new DisplayableException(displaykey.NotificationPlugin.Error.PolicyLinePatterns.NullValue)
      }
      var jurisdictions = lineToJurisdictions.get(lineOfBusiness)
      if (jurisdictions.IsEmpty) {
        throw new DisplayableException(displaykey.NotificationPlugin.Error.Jurisdictions.Empty(lineOfBusiness))
      }
      for (jurisdiction in jurisdictions) {
        if (jurisdiction == null) {
          throw new DisplayableException(displaykey.NotificationPlugin.Error.Jurisdictions.NullValue(lineOfBusiness))
        }
        action(lineOfBusiness, jurisdiction)
      }
    }
  }

  /**
   * Throws an exception if there are no lines of business in the passed map or if the passed <code>actionType</code> is null.
   * 
   * @param lineToJurisdictions map from line of business to jurisdiction arrays
   * @param actionType          notification action type to check
   * 
   * @throws DisplayableException if there are no lines of business in the passed map or if the passed <code>actionType</code> is null
   */
  private static function checkArguments(lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, actionType : NotificationActionType) {
    assertPolicyLinePatternsNotEmpty(lineToJurisdictions)
    if (actionType == null) {
      throw new DisplayableException(displaykey.NotificationPlugin.Error.ActionType.NullValue)
    }
  }

  /**
   * Throws an exception if there are no lines of business in the passed map or if the passed <code>category</code> is null.
   * 
   * @param lineToJurisdictions map from line of business to jurisdiction arrays
   * @param category            notification category to check
   * 
   * @throws DisplayableException if there are no lines of business in the passed map or if the passed <code>category</code> is null
   */
  private static function checkArguments(lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, category : NotificationCategory) {
    assertPolicyLinePatternsNotEmpty(lineToJurisdictions)
    if (category == null) {
      throw new DisplayableException(displaykey.NotificationPlugin.Error.Category.NullValue)
    }
  }

  /**
   * Throws an exception if there are no lines of business in the passed map.
   * 
   * @param lineToJurisdictions map from line of business to jurisdiction arrays
   * 
   * @throws DisplayableException if there are no lines of business in the passed map.
   */
  private static function assertPolicyLinePatternsNotEmpty(lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>) {
    if (lineToJurisdictions.Empty) {
      throw new DisplayableException(displaykey.NotificationPlugin.Error.PolicyLinePatterns.Empty)
    }
  }

  /**
   * Retrieves the lead time for the most specific notification configuration row that matches the passed criteria.
   * 
   * @param effDate        effective date to use for this notification configuration lookup
   * @param lineOfBusiness line of business to to use for this notification configuration lookup
   * @param jurisdiction   jurisdiction to use for this notification configuration lookup
   * @param actionType     action type to use for this notification configuration lookup
   * 
   * @throws DisplayableException if there are no notification configuration rows matching the passed criteria
   */
  private static function getLeadTime(effDate : DateTime, lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction, actionType : NotificationActionType) : int {
    var category = actionType.Categories[0] as NotificationCategory
    var result = createDefaultSortedQueryResult(effDate, lineOfBusiness, jurisdiction, actionType, category)
    result.thenByDescendingNullAware(NotificationConfig, ACTION_TYPE_COLUMN)
    result.thenByDescendingNullAware(NotificationConfig, CATEGORY_COLUMN)
    var config : NotificationConfig = result.FirstResult
    if (config == null) {
      throw new NotificationPluginNoMatchException(displaykey.NotificationPlugin.Error.ActionType.NoMatch(effDate, lineOfBusiness, jurisdiction, actionType))
    }
    if (category == NotificationCategory.TC_CANCEL or
        category == NotificationCategory.TC_UWCANCEL) {
      // Need to add 1 to leadTime, so that we get the full number of days for cancellations
      return config.LeadTime + 1
    }
    return config.LeadTime
  }

  /**
   * Retrieves the largest lead time for the most specific notification configuration rows that match the passed criteria.
   * 
   * @param effDate        effective date to use for this notification configuration lookup
   * @param lineOfBusiness line of business to to use for this notification configuration lookup
   * @param jurisdiction   jurisdiction to use for this notification configuration lookup
   * @param category       notification category to use for this notification configuration lookup
   * 
   * @throws DisplayableException if there are no notification configuration rows matching the passed criteria
   */
  private static function getMaximumLeadTime(effDate : DateTime, lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction, category : NotificationCategory) : int {
    return getLeadTime(effDate, lineOfBusiness, jurisdiction, category, false)
  }

  /**
   * Retrieves the smallest lead time for the most specific notification configuration rows that match the passed criteria.
   * 
   * @param effDate        effective date to use for this notification configuration lookup
   * @param lineOfBusiness line of business to to use for this notification configuration lookup
   * @param jurisdiction   jurisdiction to use for this notification configuration lookup
   * @param category       notification category to use for this notification configuration lookup
   * 
   * @throws DisplayableException if there are no notification configuration rows matching the passed criteria
   */
  private static function getMinimumLeadTime(effDate : DateTime, lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction, category : NotificationCategory) : int {
    return getLeadTime(effDate, lineOfBusiness, jurisdiction, category, true)
  }

  /**
   * Retrieves the first lead time for the most specific notification configuration rows that match the passed criteria (sorted
   * on lead time according to <code>isAscending</code>).
   * 
   * @param effDate        effective date to use for this notification configuration lookup
   * @param lineOfBusiness line of business to to use for this notification configuration lookup
   * @param jurisdiction   jurisdiction to use for this notification configuration lookup
   * @param category       notification category to use for this notification configuration lookup
   * @param isAscending    if <code>true</code> sorts results in ascending order by lead time, otherwise sorts in descending order
   * 
   * @throws DisplayableException if there are no notification configuration rows matching the passed criteria
   */
  private static function getLeadTime(effDate : DateTime, lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction, category : NotificationCategory, isAscending : boolean) : int {
    var result = createDefaultSortedQueryResult(effDate, lineOfBusiness, jurisdiction, null, category)
    result.thenByDescendingNullAware(NotificationConfig, CATEGORY_COLUMN)
    // There may be multiple matches with the same specificity (due to ignoring action type), so we must sort them based on lead time
    if (isAscending) {
      result.thenByNullAware(NotificationConfig, LEAD_TIME_COLUMN)
    } else {
      result.thenByDescendingNullAware(NotificationConfig, LEAD_TIME_COLUMN)
    }
    var config = result.FirstResult
    if (config == null) {
      throw new NotificationPluginNoMatchException(displaykey.NotificationPlugin.Error.Category.NoMatch(effDate, lineOfBusiness, jurisdiction, category))
    }
    return config.LeadTime
  }

  /**
   * Creates a query that returns the notification configuration rows that match the passed criteria, then returns that query's results
   * sorted by the default sort columns (NotificationConfig.Jurisdiction and NotificationConfig.LineOfBusiness).
   * 
   * @param effDate        effective date to use for this notification configuration lookup
   * @param lineOfBusiness line of business to to use for this notification configuration lookup
   * @param jurisdiction   jurisdiction to use for this notification configuration lookup
   * @param actionType     action type to use for this notification configuration lookup (if null this will be ignored)
   * @param category       notification category to use for this notification configuration lookup
   */
  private static function createDefaultSortedQueryResult(effDate : DateTime, lineOfBusiness : PolicyLinePattern,
                                                         jurisdiction : Jurisdiction, actionType : NotificationActionType,
                                                         category : NotificationCategory) : IQueryBeanResult<NotificationConfig> {
    var query = createQuery(effDate, lineOfBusiness, jurisdiction, actionType, category)
    var results = query.select()
    addDefaultSortColumns(results)
    return results
  }

  /**
   * Adds the default sort columns to the passed <code>result</code>.  The default columns are NotificationConfig.Jurisdiction and
   * NotificationConfig.LineOfBusiness (in that order).
   * 
   * @param result The query result to which to add sort columns
   */
  private static function addDefaultSortColumns(result : IQueryBeanResult<NotificationConfig>) {
    result.orderByDescendingNullAware(NotificationConfig, JURISDICTION_COLUMN)
    result.thenByDescendingNullAware(NotificationConfig, LINE_OF_BUSINESS_COLUMN)
  }

  /**
   * Creates a query that returns the notification configuration rows that match the passed criteria.
   * 
   * @param effDate        query for notification configurations where:
   *                       <ul>
   *                         <li>EffectiveDate &lt;= <code>effDate</code> and
   *                           <ul>
   *                             <li>ExpirationDate is <code>null</code> or</li>
   *                             <li>ExpirationDate &gt; <code>effDate</code></li>
   *                           </ul>
   *                         </li>
   *                       </ul>
   * @param lineOfBusiness query for notification configurations where:
   *                       <ul>
   *                         <li>LineOfBusiness is <code>null</code> or</li>
   *                         <li>LineOfBusiness == <code>lineOfBusiness</code></li>
   *                       </ul>
   * @param jurisdiction   query for notification configurations where:
   *                       <ul>
   *                         <li>Jurisdiction is <code>null</code> or</li>
   *                         <li>Jurisdiction == <code>jurisdiction</code></li>
   *                       </ul>
   * @param actionType     query for notification configurations where:
   *                       <ul>
   *                         <li>ActionType is <code>null</code> or</li>
   *                         <li>ActionType == <code>actionType</code></li>
   *                       </ul>
   *                       (this restriction will be omitted if this parameter is <code>null</code>)
   * @param category       query for notification configurations where:
   *                       <ul>
   *                         <li>Category is <code>null</code> or</li>
   *                         <li>Category == <code>category</code></li>
   *                       </ul>
   */
  private static function createQuery(effDate : DateTime, lineOfBusiness : PolicyLinePattern, jurisdiction : Jurisdiction,
                                      actionType : NotificationActionType, category : NotificationCategory) : Query<NotificationConfig> {
    var query = new Query<NotificationConfig>(NotificationConfig)
    query.and( \ restriction -> {
      addWildCardedRestriction(restriction, JURISDICTION_COLUMN, jurisdiction)
      addWildCardedRestriction(restriction, LINE_OF_BUSINESS_COLUMN, lineOfBusiness.Code)
      if (actionType != null) {
        addWildCardedRestriction(restriction, ACTION_TYPE_COLUMN, actionType)
      } else {
        addAllActionTypesForCategoryRestriction(restriction, category)
      }
      addWildCardedRestriction(restriction, CATEGORY_COLUMN, category)
      restriction.compare(EFFECTIVE_DATE_COLUMN, Relop.LessThanOrEquals, effDate)
      restriction.or(\ res -> {
        res.compare(EXPIRATION_DATE_COLUMN, Relop.Equals, null)
        res.compare(EXPIRATION_DATE_COLUMN, Relop.GreaterThan, effDate)
      })
    })
    return query
  }

  /**
   * Adds a wildcarded in clause to the passed <code>restriction</code> for the passed <code>category</code>.  This restriction
   * will restrict the query down to those rows with action types consistent with the passed <code>category</code> or for which
   * the value of the ActionType column is <code>null</code>.
   *
   * @param restriction restriction to which to add the wildcarded category restriction
   * @param category    NotificationCategory to match in the restriction
   */
  private static function addAllActionTypesForCategoryRestriction(restriction : Restriction, category : NotificationCategory) {
    // Build a list of all matching action types
    var matchingActions = new ArrayList()
    for (actionType in NotificationActionType.getTypeKeys(false)) {
      if (actionType.Categories.contains(category)) {
        matchingActions.add(actionType)
      }
    }

    // Add a wildcarded in clause for the actions in the above list
    restriction.or(\ res -> {
      res.compare(ACTION_TYPE_COLUMN, Relop.Equals, null)
      res.compareIn(ACTION_TYPE_COLUMN, matchingActions.toArray(new NotificationActionType[matchingActions.Count]))
    })
  }

  /**
   * Adds a wildcarded restriction to the passed <code>restriction</code> for the passed <code>column</code> and <code>value</code>.
   * This restriction will restrict the query down to those rows for which the value of the column <code>column</code> is either
   * <code>value</code> or <code>null</code>.
   *
   * @param restriction restriction to which to add the wildcarded restriction
   * @param column      column to match in the restriction
   * @param value       value of the column to match in the restriction
   */
  private static function addWildCardedRestriction(restriction : Restriction, column : String, value : Object) {
    var op = Relop.Equals
    restriction.or(\ res -> {
      res.compare(column, op, null)
      res.compare(column, op, value)
    })
  }
}