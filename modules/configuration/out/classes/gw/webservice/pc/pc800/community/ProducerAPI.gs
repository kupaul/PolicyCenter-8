package gw.webservice.pc.pc800.community

uses gw.api.database.Query
uses gw.xml.ws.annotation.WsiWebService
uses gw.xml.ws.annotation.WsiPermissions
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.SOAPUtil
uses gw.webservice.pc.pc800.community.datamodel.OrganizationDTO
uses gw.webservice.pc.pc800.community.datamodel.GroupDTO
uses gw.webservice.pc.pc800.community.datamodel.ProducerCodeDTO
uses gw.xml.ws.annotation.WsiExposeEnumAsString
uses gw.api.database.PCBeanFinder

/**
 * Provides web service API methods for managing producer codes, organizations,
 * and groups.
 *
 * Each Organization in turn may have an associated tree of Group entities.
 * For a Group, the term "ancestors" means the group's ancestors in its
 * Group tree.<p>
 *
 * <em>IMPORTANT Groups and producer codes can be arranged hierarchically, but
 * organizations (including agencies) are not arranged hierarchically.
 *
 * Every ProducerCode is associated with a single Branch (Group), and there
 * is a many-to-many correspondence between ProducerCodes and Organizations (and
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
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/community/ProducerAPI")
@WsiExposeEnumAsString(typekey.State)
@WsiExposeEnumAsString(typekey.Country)
@WsiExposeEnumAsString(typekey.AddressType)
@WsiExposeEnumAsString(typekey.ProducerStatus)
@WsiExposeEnumAsString(typekey.BusinessType)
@WsiExposeEnumAsString(typekey.Tier)
@WsiExposeEnumAsString(typekey.GroupType)
@Export
class ProducerAPI {
  
  /**
   * Returns the carrier organization
   */
  @Returns("The carrier organization.")
  @WsiPermissions({SystemPermissionType.TC_ORGVIEWBASIC})
  function getCarrierOrganization() : OrganizationDTO {
    var externalOrg = new OrganizationDTO ()
    externalOrg.populateFromOrganization(Organization.finder.findCarrierOrganization())
    return externalOrg
  }

  /**
   * Returns the Organization with the given PublicID
   */
  @Param("organizationID","The public ID of the Organization to return. Required to be non-<code>null</code>.")
  @Returns("The organization with the given Public ID.")
  @WsiPermissions({SystemPermissionType.TC_ORGVIEWBASIC})
  function getOrganizationByPublicId(organizationID : String) : OrganizationDTO {
    SOAPUtil.require(organizationID, "organizationID")
    var externalOrg = new OrganizationDTO ()
    var foundOrg = loadOrgByPublicID(organizationID)
    if (foundOrg == null) {
      return null
    }
    externalOrg.populateFromOrganization(foundOrg)
    return externalOrg
  }

  /**
   * Creates and commits an organization based on the supplied Organization XML, and returns the
   * PublicID of the newly created Orgnization.  If the PublicID is specified in the XML, an
   * exception is thrown if an Organization already exists with that PublicID.  The Name and potentially
   * ProducerStatus must be set for the Organization.  An exception is thrown if a Contact PublicID
   * is specified that does not exist in the PolicyCenter database, but the Contact PublicID can be null.
   * 
   * Automatically creates a Root Group for the organization with the properties specified in the RootGroup
   * elements of the Organization XML; the Root Group automatically has a Parent of NULL and a GroupType
   * of <code>GroupType.TC_ROOT</code>.  The Name, Supervisor and SecurityZone values must be set for
   * RootGroup.
   */  
  @Param("orgModel", "an XML representation of the Organization to create.")
  @Returns("The PublicID of the newly created Organization")
  @WsiPermissions({SystemPermissionType.TC_ORGCREATE})
  function createOrganization(orgModel : OrganizationDTO) : String {
    SOAPUtil.require(orgModel, "orgModel")
    var foundOrg = loadOrgByPublicID(orgModel.PublicID)
    if (foundOrg != null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.CreateOrganization.OrgWithPublicIDAlreadyExists(orgModel.PublicID))
    }
    
    var createdPublicID : String
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var newOrg = orgModel.createOrganization(bundle)
      createdPublicID = newOrg.PublicID
    })
    
    return createdPublicID
  }

  /**
   * Updates and commits the organization based on the supplied Organization XML.  The PublicID
   * of the Organization is required to be set - an exception will be thrown if it is not set or
   * if no Organization exists with that PublicID.  Values that are not in the Organization XML 
   * will be set to null.  The Name and potentially
   * ProducerStatus must be set for the Organization.  An exception is thrown if a Contact PublicID
   * is specified that does not exist in the PolicyCenter database, but the Contact PublicID can be null.  
   * The Name, Supervisor and SecurityZone values must be set for the Organization's RootGroup.
   */  
  @Param("orgModel", "an XML representation of the Organization to update.")
  @WsiPermissions({SystemPermissionType.TC_ORGEDITBASIC})
  function updateOrganization(orgModel : OrganizationDTO) {
    SOAPUtil.require(orgModel, "orgModel")
    if (orgModel.PublicID == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateOrganization.NullPublicID)
    }
    
    var foundOrg = loadOrgByPublicID(orgModel.PublicID)
    if (foundOrg == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateOrganization.OrgWithPublicIDDoesNotExist(orgModel.PublicID))
    }
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var orgInBundle = bundle.loadBean(foundOrg.ID) as Organization
      orgModel.updateOrganization(orgInBundle)
    })
  }

  /**
   * Returns the Group with the given PublicID
   */
  @Param("groupID","The public ID of the Group to return. Required to be non-<code>null</code>.")
  @Returns("The Group with the given PublicID.")
  @WsiPermissions({SystemPermissionType.TC_GROUPVIEW})
  function getGroupByPublicId(groupID : String) : GroupDTO {
    SOAPUtil.require(groupID, "groupID")
    var externalGroup = new GroupDTO ()
    var foundGroup = loadGroupByPublicID(groupID)
    if (foundGroup == null) {
      return null
    }
    externalGroup.populateFromGroup(foundGroup)
    return externalGroup
  }

  /**
   * Creates and commits a Group based on the supplied Group XML, and returns the
   * PublicID of the newly created Group.  If the PublicID is specified in the XML, an
   * exception is thrown if a Group already exists with that PublicID.  The Group is
   * added to the organization with the specified PublicID.  An Exception is thrown if
   * no Organization is found with the given PublicID.  The Name and GroupType are required
   * to be set.  The Parent PublicID cannot null and must refer to an existing Group in the
   * same Organization in PolicyCenter.  The SecurityZone and Supervisor
   * PublicIDs must also be set to a valid SecurityZone and User in the PolicyCenter Database.
   * 
   * A Group cannot have a Parent that is itself, or creates a Parent graph that refers back
   * to itself at some point.
   */  
  @Param("orgPublicID", "The PublicID of the Organization to create this group in.")
  @Param("groupModel", "an XML representation of the Group to create.")
  @Returns("The PublicID of the newly created Group")
  @WsiPermissions({SystemPermissionType.TC_GROUPCREATE})
  function addNewGroupToOrganization(orgPublicID : String, groupModel : GroupDTO) : String {
    SOAPUtil.require(orgPublicID, "orgPublicID")
    SOAPUtil.require(groupModel, "groupModel")
    var foundOrg = loadOrgByPublicID(orgPublicID)
    if (foundOrg == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.CreateGroup.NoOrganizationWithPublicId(orgPublicID))
    }
    
    var foundGroup = loadGroupByPublicID(groupModel.PublicID)
    if (foundGroup != null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.CreateGroup.GroupWithPublicIDAlreadyExists(groupModel.PublicID))
    }
    
    var createdPublicID : String
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var newGroup = groupModel.createGroup(bundle)
      newGroup.Organization = foundOrg
      createdPublicID = newGroup.PublicID
    })
    
    return createdPublicID
  }

  /**
   * Updates and commits the Group based on the supplied Group XML.  The PublicID
   * of the Group is required to be set - an exception will be thrown if it is not set or
   * if no Group exists with that PublicID.  The Name and GroupType are required
   * to be set.  The Parent PublicID can be null if the Group is a Root Group; otherwise it
   * must be set and refer to an existing Group in the same Organization in PolicyCenter.  
   * The SecurityZone and Supervisor PublicIDs must also be set to a valid SecurityZone and 
   * User in the PolicyCenter Database.
   * 
   * A Group cannot have a Parent that is itself, or creates a Parent graph that refers back
   * to itself at some point.
   */  
  @Param("groupModel", "an XML representation of the Group to update.")
  @WsiPermissions({SystemPermissionType.TC_GROUPEDIT})
  function updateGroup(groupModel : GroupDTO) {
    SOAPUtil.require(groupModel, "groupModel")
    if (groupModel.PublicID == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateGroup.NullPublicID)
    }
    
    var foundGroup = loadGroupByPublicID(groupModel.PublicID)
    if (foundGroup == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateGroup.GroupWithPublicIDDoesNotExist(groupModel.PublicID))
    }
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var groupInBundle = bundle.loadBean(foundGroup.ID) as Group
      groupModel.updateGroup(groupInBundle)
    })
  }

  /**
   * Returns the ProducerCode with the given PublicID
   */
  @Param("producerCodeID","The public ID of the ProducerCode to return. Required to be non-<code>null</code>.")
  @Returns("The agency organization.")
  @WsiPermissions({SystemPermissionType.TC_PRODCODEVIEWBASIC})
  function getProducerCodeByPublicId(producerCodeID : String) : ProducerCodeDTO {
    SOAPUtil.require(producerCodeID, "producerCodeID")
    var externalProducerCode = new ProducerCodeDTO()
    var foundProducerCode = loadProducerCodeByPublicID(producerCodeID)
    if (foundProducerCode == null) {
      return null
    }
    externalProducerCode.populateFromProducerCode(foundProducerCode)
    return externalProducerCode
  }

  /**
   * Creates and commits a ProducerCode based on the supplied ProducerCode XML, and returns the
   * PublicID of the newly created ProducerCode.  If the PublicID is specified in the XML, an
   * exception is thrown if a ProducerCode already exists with that PublicID.  The ProducerCode
   * is created in the Organization with the given PublicID; an exception will be thrown if there
   * is no Organization in the PolicyCenter database with the given PublicID.  The Branch, Parent
   * and PreferredUnderwriter PublicIDs can be null; if they are not null they must refer to an
   * existing Group, ProducerCode or User in the PolicyCenterDatase.
   */  
  @Param("producerCodeModel", "an XML representation of the ProducerCode to create.")
  @Returns("The PublicID of the newly created ProducerCode")
  @WsiPermissions({SystemPermissionType.TC_PRODCODECREATE})
  function addNewProducerCodeToOrganization(orgPublicID : String, producerCodeModel : ProducerCodeDTO) : String {
    SOAPUtil.require(orgPublicID, "orgPublicID")
    SOAPUtil.require(producerCodeModel, "producerCodeModel")
    var foundOrg = loadOrgByPublicID(orgPublicID)
    if (foundOrg == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.CreateProducerCode.NoOrganizationWithPublicId(orgPublicID))
    }

    var foundProducerCode = loadProducerCodeByPublicID(producerCodeModel.PublicID)
    if (foundProducerCode != null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.CreateProducerCode.ProducerCodeWithPublicIDAlreadyExists(producerCodeModel.PublicID))
    }
    
    var createdPublicID : String
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var newProducerCode = producerCodeModel.createProducerCode(bundle)
      newProducerCode.Organization = foundOrg
      createdPublicID = newProducerCode.PublicID
    })
    
    return createdPublicID
  }

  /**
   * Updates and commits the ProducerCode based on the supplied ProducerCode XML.  The PublicID
   * of the ProducerCode is required to be set - an exception will be thrown if it is not set or
   * if no ProducerCode exists with that PublicID.  The Branch, Parent
   * and PreferredUnderwriter PublicIDs can be null; if they are not null they must refer to an
   * existing Group, ProducerCode or User in the PolicyCenterDatase.
   */  
  @Param("producerCodeModel", "an XML representation of the ProducerCode to update.")
  @WsiPermissions({SystemPermissionType.TC_PRODCODEEDITBASIC})
  function updateProducerCode(producerCodeModel : ProducerCodeDTO) {
    SOAPUtil.require(producerCodeModel, "producerCodeModel")
    if (producerCodeModel.PublicID == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateProducerCode.NullPublicID)
    }
    
    var foundGroup = loadProducerCodeByPublicID(producerCodeModel.PublicID)
    if (foundGroup == null) {
      throw new BadIdentifierException(displaykey.ProducerAPI.Error.UpdateProducerCode.ProducerCodeWithPublicIDDoesNotExist(producerCodeModel.PublicID))
    }
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var producerCodeInBundle = bundle.loadBean(foundGroup.ID) as ProducerCode
      producerCodeModel.updateProducerCode(producerCodeInBundle)
    })
  }


  // private helpers
  
  private function loadOrgByPublicID(publicID : String) : entity.Organization {
    return publicID == null ? null : PCBeanFinder.loadBeanByPublicID<entity.Organization>(publicID, entity.Organization)
  }
  
  private function loadGroupByPublicID(publicID : String) : entity.Group {
    return publicID == null ? null : PCBeanFinder.loadBeanByPublicID<entity.Group>(publicID, entity.Group)
  }
  
  private function loadProducerCodeByPublicID(publicID : String) : entity.ProducerCode {
    return publicID == null ? null : PCBeanFinder.loadBeanByPublicID<entity.ProducerCode>(publicID, entity.ProducerCode)
  }  
}
