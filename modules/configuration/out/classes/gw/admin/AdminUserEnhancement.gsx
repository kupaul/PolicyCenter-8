package gw.admin

uses java.util.ArrayList

enhancement AdminUserEnhancement : User {
  
  /** This will return the available types for this user.  It is used by the
  * UI to provide a drop down for the UserDetailDV form.
  */
  property get AvailableTypes() : UserType[] {
    var internalUser = not this.ExternalUser
    var retVal = new ArrayList<UserType>()
    for (type in UserType.getTypeKeys( false )) {
      if (internalUser and not type.hasCategory(UserTypeCategory.TC_INTERNAL)) {
        continue
      }
      if ((not internalUser) and (not type.hasCategory(UserTypeCategory.TC_EXTERNAL))) {
        continue
      }
      if (this.Organization != null and this.Organization.Type != null) {
        if (type.hasCategory(BusinessTypeCategory.TC_PRODUCER) and not this.Organization.Type.hasCategory( BusinessTypeCategory.TC_PRODUCER )) {
          continue
        }
        if (type == "auditor" and not type.hasCategory(this.Organization.Type)) {
          continue
        }
        retVal.add(type)
      }
    }
    if(retVal.Empty){
      retVal.add( TC_OTHER )
    }
    return retVal as UserType[]
  }
}
