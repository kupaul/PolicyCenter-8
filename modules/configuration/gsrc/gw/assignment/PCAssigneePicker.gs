package gw.assignment
uses gw.api.assignment.AssigneePicker
uses java.util.ArrayList
uses gw.api.assignment.Assignee
uses gw.api.assignment.UserAssignee
uses java.util.Arrays
uses java.util.HashSet

/**
 * This returns an assignee picker for Users only
 * rather than Users and Groups.
 */
@Export
class PCAssigneePicker extends AssigneePicker
{

  var _selectedAssignee : Assignee
  
  construct() {
    super( false ) 
  }
  
  property get SelectedAssignee() : Assignee {
    return _selectedAssignee
  }
  
  property set SelectedAssignee(assignee:Assignee) {
    _selectedAssignee = assignee
  }
  
  override property get AllowedAssignmentSearchTypes() : List { 
    return new ArrayList() { "User" as AssignmentSearchType, "Group" as AssignmentSearchType, "Queue" as AssignmentSearchType} 
  }
    
  function buildUserAssignee(groupUser:GroupUser) : Assignee {
    _selectedAssignee = new UserAssignee(groupUser)
    return _selectedAssignee
  }
  
  function buildSuggestedAssignees(assignees:Assignee[]) : Assignee[] {
    var assigneeSet = new HashSet<Assignee>()
    if (_selectedAssignee != null) {
      assigneeSet.add(_selectedAssignee)
    }
    assigneeSet.addAll(Arrays.asList(assignees))
    return assigneeSet.toTypedArray()
  }
}
