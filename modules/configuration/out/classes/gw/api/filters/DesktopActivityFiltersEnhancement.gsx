package gw.api.filters
uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses gw.api.web.filter.NamedFilter
uses com.guidewire.pl.domain.activity.ActivityFilters

enhancement DesktopActivityFiltersEnhancement : gw.api.web.desktop.DesktopActivityFilters {
   
  static function filters() : BeanBasedQueryFilter[] {
    return {allOpen(), dueToday(), dueSoon(), overdue(), closedLast30Days()}
  }
  
  static function dueToday() : NamedFilter {
    var filterParts = {new ActivityFilters.NotAssignmentReview(),
            ActivityFilters.Status.getOpen(),
            new ActivityFilters.NotExternal(),
            new ActivityFilters.DueToday()}.toTypedArray()
    return new NamedFilter(displaykey.Java.ToolBar.Activities.CurrentOpen, filterParts)
  }
  
  static function dueSoon() : NamedFilter {
    var filterParts = {new ActivityFilters.NotAssignmentReview(),
            ActivityFilters.Status.getOpen(),
            new ActivityFilters.NotExternal(),
            new ActivityFilters.DueInNDays(7)}.toTypedArray()
    return new NamedFilter(displaykey.Java.ToolBar.Activities.Due7Days, (filterParts))
  }
  
  static function allOpen() : NamedFilter {
    var filterParts = {new ActivityFilters.NotAssignmentReview(),
            ActivityFilters.Status.getOpen()}.toTypedArray()
    return new NamedFilter(displaykey.Java.ToolBar.Activities.AllOpen, (filterParts))
  }
  
  static function overdue() : NamedFilter {
    var filterParts = {new ActivityFilters.NotAssignmentReview(),
            ActivityFilters.Status.getOpen(),
            new ActivityFilters.NotExternal(),
            new ActivityFilters.Overdue()}.toTypedArray()
    return new NamedFilter(displaykey.Java.ToolBar.Activities.Overdue, (filterParts))
  }
  
  static function closedLast30Days() : NamedFilter {
    var filterParts = {new ActivityFilters.NotAssignmentReview(),
              new ActivityFilters.NotExternal(),
              ActivityFilters.InStatusList.getClosed(),
              new ActivityFilters.ClosedLastNDays(30)}.toTypedArray()
    return new NamedFilter(displaykey.Java.ToolBar.Activities.ClosedLastNDays(30), (filterParts))
  }
}
  