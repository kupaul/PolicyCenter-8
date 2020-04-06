package gw.web.admin

@Export
class UserUIHelper {
  public static function verifyAttributeNameIsUnique(currentAttr: AttributeUser, attributes: List) : String {
    for (value in attributes) {
      var attribute = (value as AttributeUser)
      if (attribute != currentAttr
          and attribute.Attribute.Name == currentAttr.Attribute.Name
          and attribute.Attribute.Type == currentAttr.Attribute.Type) {
        return displaykey.Web.Admin.UserAttributes.DuplicateName(currentAttr.Attribute.Name)
      }
    }
    return null
  }

  public static function initialGroups(pc : ProducerCode, u : User) : Group[] {
    var groupsSet = pc.getAllGroups()
    groupsSet.retainAll( u.getAllGroups())
    var groupsList = groupsSet.whereTypeIs( Group ).toList().sort()
    return groupsList.toTypedArray()
  }

  public static function isNotLastEntry(groups : Group[], grp : Group) : Boolean {
    return groups.last() != grp
  }

  public static function shouldShowConfirmMessageWhenSwitchingBetweenInternalAndExternalUsers(user : entity.User) : Boolean {
    var externalUser = user.ExternalUser
    if (!externalUser) {
      return user.AllGroupUsersAsArray.Count > 0
    }
    return user.AllGroupUsersAsArray.Count > 0 or user.Organization != null
  }

  public static function initializeUserSearchCriteria() : UserSearchCriteria {
    var rtn = new UserSearchCriteria()
    if (User.util.CurrentUser.ExternalUser) {
      rtn.Organization = User.util.CurrentUser.Organization
    }
    return rtn
  }
}