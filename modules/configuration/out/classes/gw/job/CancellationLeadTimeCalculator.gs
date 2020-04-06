package gw.job
uses gw.plugin.Plugins
uses gw.plugin.notification.INotificationPlugin
uses java.lang.Integer
uses gw.plugin.notification.impl.NotificationPluginNoMatchException
uses java.util.Map
uses gw.api.productmodel.PolicyLinePattern

/**
 * Calculates the maximum lead time a cancellation job needs to send its notifications.
 */
@Export
class CancellationLeadTimeCalculator {
  var _processingDate : DateTime
  var _cancellationReasonCode : ReasonCode
  var _lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>
  var _inUWPeriod : boolean
  
  protected construct() {}  // protected for testing
  
  /**
   * Create an instance of the CancellationLeadTimeCalculator, which calculates the maximum lead time
   * a cancellation job needs to send its notifications.  This is determined by requesting the maximum
   * lead time from the INotificationPlugin and checking various conditions based on the date we're
   * attempting to calculate the lead time, the cancellation reason code and if we're within the
   * underwriting period.
   */
  construct(cancellationReasonCode : ReasonCode, lineToJurisdictions : Map<PolicyLinePattern, Jurisdiction[]>, processingDate : DateTime, inUWPeriod : boolean) {
    _cancellationReasonCode = cancellationReasonCode
    _lineToJurisdictions = lineToJurisdictions
    _processingDate = processingDate
    _inUWPeriod = inUWPeriod
  }
  
  /**
   * Calculate the maximum lead time by
   * <ol>
   * <li>calculating the maximum lead time for the CancelReasonCode, if any
   * <li>calculating the maximum lead time for the UWPeriod, if any
   * <li>calculating the normal maximum lead time
   * </ol>
   * Then add days to pad the lead time (legally they should get at least one day).
   * If there is no maximum lead time, then return null.
   */
  function calculateMaximumLeadTime() : Integer {
    var leadTime = calculateMaximumLeadTimeForCancelReasonCode()
    if (leadTime == null) {
      leadTime = calculateMaximumLeadTimeForUWPeriod()
    }
    if (leadTime == null) {
      leadTime = calculateMaximumLeadTimeForNormalCancel()
    }
    return leadTime
  }
  
  /**
   * Calculate the maximum lead time based on the CancelReasonCode.  If we're in the UW period,
   * get the lead time using the action type for our CancelReasonCode and UWCancel category.
   * If not in the UW period or no match, get the lead time using the our CancelReasonCode
   * and the Cancel category.  Failing both, return null to indicate that there is no lead
   * time for the CancelReasonCode.
   */
  protected function calculateMaximumLeadTimeForCancelReasonCode() : Integer {  // protected for testing
    var leadTime : Integer
    if (_inUWPeriod) {
      leadTime = getMaximumLeadTimeForActionType(_cancellationReasonCode.getNotificationActionType(NotificationCategory.TC_UWCANCEL))
    }
    if (leadTime == null) {
      leadTime = getMaximumLeadTimeForActionType(_cancellationReasonCode.getNotificationActionType(NotificationCategory.TC_CANCEL))
    }
    return leadTime
  }
  
  /**
   * Calculate the maximum lead time based for the UWPeriod by checking the UWOtherCancel
   * action, then the UWCancel category.  If there are no matches, or we are not within
   * the UWPeriod, return null to indicate that there is no lead time for the UWPeriod.
   */
  protected function calculateMaximumLeadTimeForUWPeriod() : Integer {  // protected for testing
    if (not _inUWPeriod) {
      return null
    }
    var leadTime = getMaximumLeadTimeForActionType(NotificationActionType.TC_UWOTHERCANCEL)
    if (leadTime == null) {
      leadTime = getMaximumLeadTimeForCategory(NotificationCategory.TC_UWCANCEL)
    }
    return leadTime
  }
  
  /**
   * Calculate the maximum lead time for a normal cancellation by checking the
   * OtherCancel action and then the Cancel category.  If there are no matches
   * return null to indicate that there is no lead time for normal cancellations.
   */
  protected function calculateMaximumLeadTimeForNormalCancel() : Integer {  // protected for testing
    var leadTime = getMaximumLeadTimeForActionType(NotificationActionType.TC_OTHERCANCEL)
    if (leadTime == null) {
      leadTime = getMaximumLeadTimeForCategory(NotificationCategory.TC_CANCEL)
    }
    return leadTime
  }
  
  /**
   * Get the maximum lead time for a particular NotificationActionType.  If there are no lead times
   * for the action type, or if the action type is null, return null.
   */
  protected function getMaximumLeadTimeForActionType(actionType : NotificationActionType) : Integer {  // protected for testing
    if (actionType == null) {
      return null
    } 
     
    var leadTime = wrapPluginCall(\ p -> p.getMaximumLeadTime(_processingDate, _lineToJurisdictions, actionType))   
    return leadTime
  }
  
  /**
   * Get the maximum lead time for a particular NotificationCategory.  If there are no lead times
   * for the category, or if the category is null, return null.
   */
  protected function getMaximumLeadTimeForCategory(category : NotificationCategory) : Integer {  // protected for testing
    if (category == null) {
      return null
    }
    var leadTime = wrapPluginCall(\ p ->p.getMaximumLeadTime(_processingDate, _lineToJurisdictions, category))
    return leadTime
  }
  
  /**
   * Makes a call to the INotificationPlugin.  In the cases where it throws a NotificationPluginNoMatchException
   * when it finds no matching lead time, we eat the exception and instead return null to indicate that there
   * is no match.
   */
  protected function wrapPluginCall(pluginCall(p : INotificationPlugin) : Integer) : Integer {  // protected for testing
    var plugin = Plugins.get(INotificationPlugin)
    try {
      return pluginCall(plugin)
    } catch (e : NotificationPluginNoMatchException) {
      return null
    }
  }
  
}
