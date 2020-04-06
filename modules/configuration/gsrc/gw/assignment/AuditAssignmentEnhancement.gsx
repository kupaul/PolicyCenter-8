package gw.assignment
uses gw.api.database.Query

enhancement AuditAssignmentEnhancement : Audit
{
  /**
   * Assign the auditor to the job if the auditor was not already assigned.  
   * Assign the Auditor from the Account first, and if not found, use System user.
   */
  function assignAuditor() {
    // No-op if the auditor was already assigned
    if (AssignmentUtil.isUserRoleInUse(this, "Auditor")) {
      return
    }
    
    var carrierOrg = Organization.finder.findCarrierOrganization()
    var auditor = Query.make(User)
                    .compare(User#Organization.PropertyInfo.Name, Equals, carrierOrg)
                    .compare(User#UserType.PropertyInfo.Name, Equals, UserType.TC_AUDITOR)
                    .select().FirstResult

    if(auditor != null) {
      AssignmentUtil.assignAndLogUserRole(this, auditor, auditor.getDefaultAssignmentGroup({"branchaudit", "regionAudit", "extaudit"}),
                                           "Auditor", "AuditAssignmentEnhancement.assignAuditor()")
    } else {
      // Default to SystemUser
      AssignmentUtil.assignToDefaultUser(this,  "Auditor", "AuditAssignmentEnhancement.assignAuditor()")
    }
  }
}
