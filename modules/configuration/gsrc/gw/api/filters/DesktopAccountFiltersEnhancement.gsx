package gw.api.filters
uses gw.api.web.filter.NamedFilter
uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses java.util.Date
uses com.guidewire.pc.web.desktop.AccountFilters

enhancement DesktopAccountFiltersEnhancement : gw.api.web.desktop.DesktopAccountFilters {
  
  static function myAccountFilters()  : BeanBasedQueryFilter[] {
    
    var allPending = new NamedFilter(displaykey.Java.Desktop.ToolbarFilter.Accounts.AllPending,
                  AccountFilters.Status.getPending()) 
                  
    var createdInPast7Days = new NamedFilter(displaykey.Java.Desktop.ToolbarFilter.Accounts.CreatedInPast7Days,
                  Account.restrictors.createdOnOrAfter(Date.Today.addDays(-7)).asFilter())
    return {allPending, createdInPast7Days}
  }
  
}
