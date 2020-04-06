package gw.job.uw

uses java.util.Set
uses gw.search.SearchCriteria

@Export
class UWIssueTypeSearchCriteria extends SearchCriteria<UWIssueType> {
  var _name : String as Name
  var _description : String as Description
  var _excludedTypes : Set<UWIssueType>
  
  construct(excludedTypes : Set<UWIssueType>) {
    _excludedTypes = excludedTypes
  }
  
  override protected function doSearch() : UWIssueType[]  {
    return UWIssueType.finder.findUWIssueTypesByNameAndDescriptionWithExclusions( _name, _description, _excludedTypes ).toTypedArray()
  }
 
  override protected property get HasMinimumSearchCriteria() : boolean {
    return true
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null 
  }

}
