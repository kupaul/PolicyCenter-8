package gw.community

uses gw.api.filters.DynamicFilter

enhancement UserEnhancement : entity.User {

  property get UWAuthorityProfiles() : UWAuthorityProfile[] {
    return this.UserAuthorityProfiles*.UWAuthorityProfile
  }

  /**
   * Returns an array of available roles for this user.
   *
   * This returns a result of a query of the available roles.  It is used by the
   * UI to provide the value range for a role range input (i.e., drop down).  (See
   * UserSearchDV.)
   */
  function listAvailableRoles() : Role[] {
    var result = Role.finder.allOrderedByName()
    result.addFilter(
      new DynamicFilter<Role>(\ roleQry -> {
        roleQry.compareIn("RoleType", new RoleType[] {"user", "userproducercode"})
        if ( this.ExternalUser ) {
          roleQry.compare("CarrierInternalRole", NotEquals, true)
        }
        return roleQry
      }
    ))

    return result.toTypedArray()
  }
}
