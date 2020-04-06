package gw.web.admin

@Export
class NewGroupUIHelper {
  public static function createNewGroup(parent : entity.Group): Group {
    var newGroup = gw.api.admin.GroupUtil.createGroup(null, parent)
    if (User.util.CurrentUser.ExternalUser and newGroup.SecurityZone == null) {
      newGroup.SecurityZone = newGroup.RootGroup.SecurityZone
    }
    return newGroup
  }
}