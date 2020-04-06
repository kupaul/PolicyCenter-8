package gw.systables
uses gw.api.database.Query
uses gw.api.database.Relop

enhancement ReasonCodeEnhancement : ReasonCode {
  
  /**
   * Looks up the NotificationActionType for the given ReasonCode and NotificationCategory 
   * from the reasoncode_actiontype system table
   */
  function getNotificationActionType(category : NotificationCategory) : NotificationActionType {
    var query = Query<ReasonCodeActionType>.make(ReasonCodeActionType)
    query.compare("ReasonCode", Relop.Equals, this)
    query.compare("NotificationCategory", Relop.Equals, category)
    return query.select(\ rcat -> rcat.NotificationActionType).AtMostOneRow
  }
}
