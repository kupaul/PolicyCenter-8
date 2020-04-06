package gw.webservice.pc.pc700.community

uses gw.api.database.Query
uses gw.api.web.community.ProducerAPIImpl
uses gw.api.webservice.exception.*
uses gw.transaction.Transaction
uses gw.api.database.PCBeanFinder

/**
 * Provides web service API methods for managing producer codes, agencies,
 * and branches. Agencies are a type of Organization. Branches are
 * a type of Group. Branch objects are distinguished from regular Group objects
 * by having a non-<code>null</code> value for the "BranchCode" attribute.<p>
 *
 * Each Organization in turn may have an associated tree of Group entities.
 * For a Group, the term "ancestors" means the group's ancestors in its
 * Group tree.<p>
 *
 * <em>IMPORTANT Groups and producer codes can be arranged hierarchically, but
 * organizations (including agencies) are not arranged hierarchically.
 *
 * Every ProducerCode is associated with a single Branch, and there
 * is a many-to-many correspondence between ProducerCodes and agencies (and
 * their associated Groups).<p>
 *
 * The <em>Agency-ProducerCode</em> constraint limits the associations
 * between Agencies and ProducerCodes. If particular,
 * if <em>D</em> is any descendant of an agency <em>A</em>, then the
 * ProducerCodes associated with <em>D</em> must be a (not necessarily
 * proper) subset of the ProducerCodes associated with <em>A</em>. The
 * methods of this interface are guaranteed to maintain this constraint.
 * For example, when the association between a ProducerCode and an agency
 * <em>A</em> is removed, this interface takes care of removing the the
 * association between that ProducerCode and all of <em>A</em>'s descendants.<p>
 */
@RpcWebService
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.community.ProducerAPI instead")
class ProducerAPI {

  /**
   * Finds the carrier organization
   */
  @Returns("The carrier organization.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function getCarrierOrganization() : Organization {
    return Organization.finder.findCarrierOrganization()
  }

  /**
   * Finds an agency organization
   */
  @Param("agencyID","The public ID of the Organization to which the ProducerCode will be added. Required to be non-<code>null</code>.")
  @Returns("The agency organization.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function getAgencyOrganization(agencyID : String) : Organization {
    return Query.make(Organization).compare("PublicID", Equals, agencyID).select().AtMostOneRow
  }

  /**
   * Finds an branch
   */
  @Param("branchID","The public ID of the branch to be assigned the ProducerCode. Required to be non-<code>null</code>.")
  @Returns("The agency organization.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function getBranch(branchID : String) : Group {
    return Query.make(Group).compare("PublicID", Equals, branchID).select().AtMostOneRow
  }

  /**
   * Creates or synchronizes the supplied agency in the PolicyCenter
   * database. This first looks up the agency by public ID. If no
   * such Organization is found, the supplied Organization is persisted.
   * Otherwise, the fields of the existing Organization are made to match
   * those of the supplied one. Note in this case that the Agency's
   * producer codes are not affected.<p>
   *
   * PolicyCenter looks up the corresponding entity in the database
   * by its public ID and the corresponding link on the agency changes
   * to point to that entity.  The RootGroup associated with the agency
   * is ignored, so you do not need to supply it.<p>
   */
  @Param("agency","The Organization to create or update in the PolicyCenter database.Required to be non-<code>null</code>.")
  @Returns("true if a new Agency was created; false if an existing Agency was synchronized against the supplied one.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function synchronizeAgency(agency : Organization) : boolean {
    var result : boolean
    Transaction.runWithNewBundle( \ bundle ->{
      result = ProducerAPIImpl.synchronizeAgency(agency, bundle)
    })
    return result
  }

  /**
   * Creates or synchronizes the supplied branch in the PolicyCenter
   * database. This first looks up the branch by public ID. If no
   * such Group is found, the supplied Group is persisted. Otherwise,
   * the fields of the existing Group are made to match those of the
   * supplied one. Note in this case that the Branch's producer codes
   * are not affected.<p>
   *
   * The following entities linked to <code>branch</code> (if non-null)
   * should be passed by reference:
   * <ul>
   * <li>Parent</li>
   * <li>Supervisor</li>
   * <li>SecurityZone</li>
   * <li>VisibilityZone</li>
   * </ul>
   * The corresponding entities will be looked up in the database by
   * their public IDs, and the corresponding links on the branch will
   * be changed to point them. Hence, if specified, these entities
   * must already exist in the PolicyCenter database.<p>
   *
   * If Parent is specified, Organization will be set to match.   (If you
   * are creating a new branch, setting Parent is required.)
   * Organization cannot be set by reference and will therefore be ignored.
   *
   * The following arrays associated with <code>branch</code> (if
   * supplied) will also be ignored:
   * <ul>
   * <li>Users</li>
   * <li>RuleSets</li>
   * <li>Regions</li>
   * <li>AssignableQueues</li>
   * </ul>
   */
  @Param("branch","The Group to create or update in the PolicyCenter database. Required to be non-<code>null</code>.")
  @Returns("true if a new branch was created; false if an existing branch was synchronized against the supplied one.")
  @Throws(RequiredFieldException,"if the supplied <code>branch</code> has a <code>null BranchCode</code> attribute.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function synchronizeBranch(branch : Group) : boolean {
    var result : boolean
    Transaction.runWithNewBundle( \ bundle ->{
      result = ProducerAPIImpl.synchronizeBranch(branch, bundle)
    })
    return result
  }

  /**
   * Creates or synchronizes the supplied ProducerCode in the PolicyCenter
   * database. This first looks up the ProducerCode by public ID. If no
   * such ProducerCode is found, the supplied one is persisted. Otherwise,
   * the fields of the existing ProducerCode are made to match those of the
   * supplied one.<p>
   *
   * The following entities linked to <code>producerCode</code> (if non-null)
   * should be passed by reference:
   * <ul>
   * <li>Parent</li>
   * <li>Branch</li>
   * <li>PreferredUnderwriter</li>
   * </ul>
   * The corresponding entities will be looked up in the database by
   * their public IDs, and the corresponding links on the producer code
   * will be changed to point them. Hence, if specified, these entities
   * must already exist in the PolicyCenter database.<p>
   *
   * The following arrays associated with <code>producerCode</code> (if
   * supplied) will be ignored:
   * <ul>
   * <li>GroupProducerCodes</li>
   * </ul>
   * In particular, this means that any agencies associated with
   * the producer code are ignored. Use the other methods of this
   * API to add or remove associations between producer codes and
   * agencies, or to move a producer code from one agency to another.
   */
  @Param("producerCode","The ProducerCode to create or update in the PolicyCenter database. Required to be non-<code>null</code>.")
  @Returns("true if a new ProducerCode was created; false if an existing ProducerCode was synchronized against the supplied one.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function synchronizeProducerCode(producerCode : ProducerCode) : boolean {
    var result : boolean
    Transaction.runWithNewBundle( \ bundle ->{
      result = ProducerAPIImpl.synchronizeProducerCode(producerCode, bundle)
    })
    return result
  }

  /**
   * Removes the ProducerCode with public ID <code>producerCodeID</code>
   * from the agency (of type Organization) with public ID <code>agencyID</code>.<p>
   *
   * This method also guarantees that the Agency-ProducerCode constraint is
   * maintained by removing the specified ProducerCode from every descendant of
   * the specified agency in the agency tree.
   */
  @Param("producerCodeID","the public ID of the ProducerCode to remove from the agency. Required to be non-<code>null</code>.")
  @Param("agencyID","the public ID of the Organization from which the ProducerCode is to be removed. Required to be non-<code>null</code>.")
  @Returns("true if an existing association between the ProducerCode and the agency is removed; false if such an association does not exist.")
  @Throws(BadIdentifierException,"if one of the supplied public IDs names a non-existing entity.")
  @Throws(RequiredFieldException,"if one of the supplied public IDs is <code>null</code>.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function removeProducerCodeFromExistingAgency(producerCodeID : String, agencyID : String) : boolean {
    var bundle = Transaction.getCurrent()
    var prodCode = PCBeanFinder.loadBeanByPublicID<ProducerCode>(producerCodeID, ProducerCode)
    var carrierOrg = Query.make(Organization).compare("Carrier", Equals, true).select().AtMostOneRow

    prodCode = bundle.add(prodCode)
    var res = prodCode.Organization != carrierOrg
    if (res) {
      prodCode.OrganizationWithUpdate = carrierOrg
      bundle.commit()
    }
    return res
  }

  /**
   * Moves the ProducerCode with public ID <code>producerCodeID</code> from its
   * current agency (if any) to the Organization with public ID <code>toAgencyID</code>.
   * This method requires that the identified producer code has at most one associated
   * Agency prior to the call.
   */
  @Param("producerCodeID","the public ID of the ProducerCode to move from its current agency (if any) to the identified destination agency. Required to be non-<code>null</code>.")
  @Param("toAgencyID","the public ID of the Organization to which the ProducerCode is to be moved. Required to be non-<code>null</code>.")
  @Returns("true if a new association is created between the ProducerCode and the identified destination agency; false if such an association already exists.")
  @Throws(BadIdentifierException,"if one of the supplied public IDs names a non-existing entity.")
  @Throws(RequiredFieldException,"if one of the supplied public IDs is <code>null</code>.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  @Throws(EntityStateException,"if the identified producer code currently has multiple associated Agencies.")
  function moveProducerCodeToExistingAgency(producerCodeID : String, toAgencyID : String) : boolean {
    require(producerCodeID, "producerCodeID")
    require(toAgencyID,"toAgencyID")
    var bundle = Transaction.getCurrent()
    var prodCode = PCBeanFinder.loadBeanByPublicID<ProducerCode>(producerCodeID, ProducerCode)
    var toAgency = Organization.finder.findOrganizationByPublicId(toAgencyID)

    // add producer code to mutable bundle
    prodCode = bundle.add(prodCode)

    var res = prodCode.Organization != toAgency
    if(res) {
      prodCode.OrganizationWithUpdate = toAgency
      bundle.commit()
    }
    return res
  }

  /**
   * Creates or synchronizes the Agency <code>toAgency</code>, and then moves the
   * ProducerCode with public ID <code>producerCodeID</code> from its current Agency
   * (if any) to the Organization <code>toAgency</code>. This method requires that
   * the identified producer code has at most one associated Agency prior to the
   * call.
   * This operation is not atomic.
   */
  @Param("producerCodeID","the public ID of the ProducerCode to move from its current agency (if any) to the identified destination agency. Required to be non-<code>null</code>.")
  @Param("toAgency","The Organization to create or update in the PolicyCenter database, and to which the producer code should be moved. Required to be non-<code>null</code>.")
  @Returns("true if a new association is created between the ProducerCode and <code>toAgency</code>; false if such an association already exists.")
  @Throws(BadIdentifierException,"if the supplied public ID names a non-existing entity.")
  @Throws(RequiredFieldException,"if one of the supplied public IDs is <code>null</code>.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  @Throws(EntityStateException,"if the identified producer code currently has multiple associated Agencies.")
  function moveProducerCodeToSyncedAgency(producerCodeID : String, toAgency : Organization) : boolean {
    Transaction.runWithNewBundle( \ bundle ->{
      ProducerAPIImpl.synchronizeAgency(toAgency, Transaction.getCurrent())
    })
    var result : boolean
    Transaction.runWithNewBundle( \ bundle ->{
     result = moveProducerCodeToExistingAgency(producerCodeID, toAgency.getPublicID())
    })
    return result
  }

  /**
   * Moves the ProducerCode with public ID <code>producerCodeID</code> from its
   * current Branch to the Group with public ID <code>toBranchID</code>.
   */
  @Param("producerCodeID","the public ID of the ProducerCode to move from its current branch to the identified destination branch.")
  @Param("toBranchID","the public ID of the Group to which the ProducerCode should be moved.")
  @Returns("true if the ProducerCode's associated branch was changed; false if its branch was already the Group with public ID <code>toBranchID</code>.")
  @Throws(BadIdentifierException,"if one of the supplied public IDs names a non-existing entity.")
  @Throws(RequiredFieldException,"if one of the supplied public IDs is <code>null</code>.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function moveProducerCodeToExistingBranch(producerCodeID : String, toBranchID : String) : boolean {
    var bundle = Transaction.getCurrent()

    // load ProducerCode
    var prodCode = PCBeanFinder.loadBeanByPublicID<ProducerCode>(producerCodeID, ProducerCode)

    // check if there's actually no change
    var fromBranch = prodCode.Branch
    if (fromBranch != null and fromBranch.PublicID == toBranchID) {
      return false
    }

    // load toBranch
    var toBranch = PCBeanFinder.loadBeanByPublicID<Group>(toBranchID, Group)

    // change & commit branch association
    prodCode = bundle.add(prodCode)
    prodCode.Branch = toBranch
    bundle.commit()
    return true
  }

  /**
   * Creates or synchronizes the Branch <code>toBranch</code>, and then moves the
   * ProducerCode with public ID <code>producerCodeID</code> from its current
   * Branch to the new one. In  particular, this is equivalent to the following code:
   * <pre>
   * {@link #synchronizeBranch synchronizeBranch}(toBranch)
   * return {@link #moveProducerCodeToExistingBranch moveProducerCodeToExistingBranch}(producerCodeID, toBranch.getPublicID())
   * </pre>
   * This operation is not atomic.
   */
  @Param("producerCodeID","the public ID of the ProducerCode to move from its current branch to the identified destination branch.")
  @Param("toBranch","The Group to create or update in the PolicyCenter database, and to which the identified ProducerCode should be moved. Required to be non-<code>null</code>.")
  @Returns("true if the ProducerCode's associated branch was changed; false if its branch was already the Group with public ID <code>toBranchID</code>.")
  @Throws(BadIdentifierException,"if the supplied public ID names a non-existing entity.")
  @Throws(RequiredFieldException,"if the supplied public ID is <code>null</code>, or if the supplied <code>toBranch</code> has a <code>null</code> <code>BranchCode</code> attribute.")
  @Throws(PermissionException,"if the credentials supplied with the call do not have sufficient permission to perform the operation.")
  function moveProducerCodeToSyncedBranch(producerCodeID : String, toBranch : Group) : boolean {
    Transaction.runWithNewBundle( \ bundle ->{
      ProducerAPIImpl.synchronizeBranch(toBranch, Transaction.getCurrent())
    })
    var result : boolean
    Transaction.runWithNewBundle( \ bundle ->{
     result = moveProducerCodeToExistingBranch(producerCodeID, toBranch.getPublicID())
    })
    return result
  }

  @Throws(RequiredFieldException,"If parameter is null.")
  private function require(parameter : Object, name : String) {
    if(parameter == null)
      throw new RequiredFieldException(displaykey.ProducerAPI.Error.MissingRequiredParameter(name))
  }
}
