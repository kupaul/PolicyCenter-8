package gw.web.admin

@Export
class RoleUIHelper {
  public static function getAvailablePermissions(role : entity.Role) : SystemPermissionType[] {
    // Returns all permissions that are not already associated with "Role"
    var allPermissions = typekey.SystemPermissionType.getTypeKeys( false )
    var permissionsInUse = role.Privileges*.Permission
    return allPermissions.subtract(permissionsInUse.toSet()).toTypedArray()
  }

  public static function getValueRange(permission : SystemPermissionType, availablePermissions : typekey.SystemPermissionType[]) : SystemPermissionType[] {
    // Returns the available permissions with "permission" added if it's non-null. This is needed so
    // the range cell can display the currently set permission, which is no longer available.
    return (permission == null) ? availablePermissions : availablePermissions.union({permission}).toTypedArray()
  }
}