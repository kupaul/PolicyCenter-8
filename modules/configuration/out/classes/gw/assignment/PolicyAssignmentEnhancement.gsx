package gw.assignment
uses java.util.HashSet
uses gw.api.assignment.UserAssignee
uses gw.api.assignment.Assignee
uses java.util.ArrayList
uses gw.api.assignment.RoleAssignee
uses gw.api.util.Logger
uses gw.api.database.PCBeanFinder
uses java.lang.SuppressWarnings
uses gw.api.system.PCLoggerCategory

enhancement PolicyAssignmentEnhancement : entity.Policy
{
  /**
   * Given an Assignee, sets the PreRenewalOwner on the Policy.
   */
  property set PreRenewalOwner(owner : Assignee) {
    var assignment = this.getOrCreateUserRoleAssignmentByRole( "PreRenewalOwner" )
    owner.assignToThis( assignment )
  }

  /**
   * Returns the given an assignee if it has already been defined
   */
  property get PreRenewalOwner() : Assignee {
    var assignment = this.getUserRoleAssignmentByRole( "PreRenewalOwner" )
    return (assignment.AssignedUser != null) ? new UserAssignee(assignment.AssignedGroup, assignment.AssignedUser) : null
  }

  /**
   * Returns a list of potential PreRenewalOwners.  The list is selected from the following:
   * <ol>
   * <li>Add the current user</li>
   * <li>Add the current user in different groups</li>
   * <li>Add supervisors of the user's groups</li>
   * <li>Add the currently assigned PreRenewalOwner (if it exists)</li>
   * <li>Add the appropriate assignment role according to the Pre-Renewal Direction key</li>
   * </ol>
   */
  @SuppressWarnings({"all"})
  function getSuggestedPreRenewalOwners(direction : PreRenewalDirection) : Assignee[] {
    var userList = new ArrayList<Assignee>() // order current, other user, roles
    var userSet = new HashSet<Assignee>() // use set to drop duplicates

    var goodRoleSet = new ArrayList<Role>()
    goodRoleSet.add( PCBeanFinder.loadBeanByPublicID<Role>("underwriter_supervisor", Role))

    // Add the appropriate assignment role according to Pre-Renewal Direction
    // add the appropriate role assignee
    switch (direction) {
      case "custrep":
        // goodRoleSet.add(Role("CustomerRep"))
        if (this.getUserRoleAssignmentByRole( "CustomerRep" ) != null) {
          userList.add( new RoleAssignee("CustomerRep", AssignmentUtil.DefaultUser))
        }
        // fall through
      case "assistant":
        goodRoleSet.add( PCBeanFinder.loadBeanByPublicID<Role>("underwriter_asst", Role))
        if (this.getUserRoleAssignmentByRole( "UnderwriterAssist" ) != null) {
          userList.add( new RoleAssignee("UnderwriterAssist", AssignmentUtil.DefaultUser))
        }
        // fall through
      case "underwriter":
      case "nonrenewrefer":
        goodRoleSet.add( PCBeanFinder.loadBeanByPublicID<Role>("underwriter", Role)) // fall through
        if (this.getUserRoleAssignmentByRole( "Underwriter" ) != null) {
           userList.add( new RoleAssignee("Underwriter", AssignmentUtil.DefaultUser))
        }
    }
    var goodRoles = goodRoleSet.where( \ r -> r != null ).toTypedArray()

    // Add user in the default and other groups
    var currentUser = User.util.CurrentUser
    if (currentUser != null and goodRoles.firstWhere( \ r -> currentUser.hasRole(r)) != null) {
      userSet.add(new UserAssignee(currentUser.DefaultAssignmentGroup, currentUser))
      for ( groupUser in currentUser.GroupUsers ) {
        userSet.add(new UserAssignee(groupUser.Group, currentUser))
      }
    }
    // Add the supervisor
    for ( groupUser in currentUser.GroupUsers ) {
      var supervisor = groupUser.Group.Supervisor
      if (supervisor != null and goodRoles.firstWhere( \ r -> supervisor.hasRole(r)) != null) {
        userSet.add(new UserAssignee(groupUser.Group, supervisor))
      }
    }

        // add the current assignment
    var assignment = this.getUserRoleAssignmentByRole( "PreRenewalOwner" )
    if (assignment.AssignedUser != null and goodRoles.firstWhere( \ r -> assignment.AssignedUser.hasRole(r)) != null) {
      userSet.add(new UserAssignee(assignment.AssignedGroup, assignment.AssignedUser))
    }

    userList.addAll(0, userSet)
    return userList as Assignee[]
  }

  /**
   * Create a new activity that is assigned to the user with the given role on this policy.
   * If the producer cannot be assigned the activity, assign to DefaultUser.
   *
   * @returns The created activity
   */
  function createRoleActivity( role : typekey.UserRole, pattern : ActivityPattern, subject : String,
                               description : String, user : User) : Activity {
    // Most of these arguments are null since the ActivityPattern config will set their default values
    var activity = pattern.createPolicyActivity( this.Bundle, this, subject, description, null, null, null, null, null )
    var roleAssignment = this.getUserRoleAssignment(user, role)
    if (roleAssignment != null) {
      if (not activity.assign( roleAssignment.AssignedGroup, roleAssignment.AssignedUser )) {
        PCLoggerCategory.RULES.warn(role + " was unable to be assigned to activity: " + roleAssignment.AssignedUser +
                          ".  Assigning to Default User.")
        activity.assign( AssignmentUtil.DefaultUser.DefaultAssignmentGroup, AssignmentUtil.DefaultUser )
      }
    }
    return activity
  }
}
