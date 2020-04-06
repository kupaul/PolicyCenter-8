package gw.assignment

enhancement UserAssignmentEnhancement : User {
 
 /** 
  * Returns the default group for this user. There are a couple of strategies that 
  * the could be used. Implemented the root group if no other, but others are available
  * always the root group,  never the root group (you have to throw),
  * etc.  Or this can be avoided entirely.
  */
  property get DefaultAssignmentGroup() : Group {
     return this.Organization.RootGroup
  }

 /** This method will return the a default group for this user and
  * the types of groups.  It will return the first group of the correct type
  * or the first group.  If the user has no groups it will return the root group.
  */
  function getDefaultAssignmentGroup(types : GroupType[]) : Group {
     var allGroupUsers = this.AllGroupUsersAsArray.sort( \ g, g2 -> g.Group.Name.compareTo( g2.Group.Name ) <= 0 )
     for (gu in allGroupUsers) {
       if (types.contains( gu.Group.GroupType )) {
         return gu.Group
       }
     }
     return this.Organization.RootGroup
  }

 /** This method will return the a default group for this user and
  * the type of group.  It will return the first group of the correct type
  * or the first group.  If the user has no groups it will return the root group.
  */
  function getDefaultAssignmentGroup(type : GroupType) : Group {
    return getDefaultAssignmentGroup( { type } )
  }
}
