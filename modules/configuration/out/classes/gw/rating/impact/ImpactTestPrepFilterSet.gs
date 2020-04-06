package gw.rating.impact

uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses gw.api.util.CoreFilters

@Export
class ImpactTestPrepFilterSet {

  public static final var SUCCESS_FILTER : BeanBasedQueryFilter  = new SuccessPeriodsFilter()
  public static final var FAILURE_FILTER : BeanBasedQueryFilter  = new FailedPeriodsFilter()
 
  /**
   * @return the All filter
   */  
  public property get AllFilter() : BeanBasedQueryFilter {
    return CoreFilters.ALL
  }
  
  
  /**
   * @return the Success filter
   */
  public property get SuccessFilter() : BeanBasedQueryFilter {
    return SUCCESS_FILTER
  }

  /**
   * @return the Failure filter
   */
  public property get FailureFilter() : BeanBasedQueryFilter {
    return FAILURE_FILTER
  }
  
    
  final public static class SuccessPeriodsFilter implements BeanBasedQueryFilter {
    
    override function applyFilter(obj : Object) : boolean {
      var period = obj as ImpactTestingPolicyPeriod
      return period.TestPrepResult == ImpactTestingPrepResult.TC_SUCCESS
    }

  }
  
  final public static class FailedPeriodsFilter implements BeanBasedQueryFilter {
    
    override function applyFilter(obj : Object) : boolean {
      var period = obj as ImpactTestingPolicyPeriod
      return period.TestPrepResult != ImpactTestingPrepResult.TC_SUCCESS
    }
    
  }  
  
 

}
