package gw.web.admin


@Export
class GroupDetailDVUIHelper {

  public static function isParentRequiredAndEditableForGroup(group : entity.Group) : Boolean {
    return group.New || group.Parent != null
  }

  //Clear group type if parent's type (external or carrier) changed and the selected type is no longer in the type list.
  //The condition must be the same as in filter expression
  public static function clearGroupTypeIfNotInTypeList(group : entity.Group) : void {
    if (!isValidType(group, group.GroupType)) {
      group.GroupType = null
    }
  }

  //Used to filter group types list
  public static function isValidType(group : entity.Group, value : GroupType) : Boolean {
    return value != "root"
        and (group.Organization.Carrier
            or (value != "branchaudit" and value != "branchlc")
                and value != "branchmkt" and value != "branchuw")
  }

  //Returns a list of groups the current user is a member of that are in the same
  //Organization as the group that is being edited
  public static function GroupsForCurrentUserInSelectedOrg(group : entity.Group) : java.util.List {
    var groups = gw.api.admin.BaseAdminUtil.getGroupsForCurrentUser()
    if(groups == null) {
      return null
    }

    var groupsInOrg = new java.util.ArrayList()
    for(var currGroup in groups) {
      if((currGroup as Group).Organization == group.Organization) {
        groupsInOrg.add(currGroup)
      }
    }
    return groupsInOrg
  }
}