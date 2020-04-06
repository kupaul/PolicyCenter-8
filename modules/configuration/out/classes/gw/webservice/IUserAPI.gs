package gw.webservice

uses entity.User
uses gw.transaction.Transaction
uses gw.api.webservice.UserAPIHelper
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.PermissionException
uses java.lang.SuppressWarnings

/**
* UserAPI is used to perform operations on users.  This includes creating and modifying.
*/
@RpcWebService
@Deprecated("Write your own Gosu class and publish it as a web service.")
@SuppressWarnings("deprecation")
@Export
class IUserAPI {

  /**
   * Retrieves a user given the user identifier
   *
   * @param publicId The ID of the user to retrieve
   * @return The UserData representing the user
   */
  @Throws(DataConversionException, "if the userID does not exist")
  @Throws(PermissionException, "if the user does not have permission")
  @Throws(SOAPException, "If multiple users match the given user id.")
  public function getUser(userID : String) : User {
    var userQuery = find (u in User where u.PublicID == userID )
    return userQuery.getAtMostOneRow()
  }

  /**
   * Adds the given user to the system. This method is included for backwards compatibility but
   * all new code should use the form of addUser that does <em>not</em> take a credentialName parameter.
   *
   * @param data           The <code>User</code> object, which must have valid <code>UserContact</code>
   *                       and <code>Credential</code> objects set as the contact and credential field.
   * @param rolePublicIds  The roles to assign the user.
   * @param credentialName Ignored
   * @return The public id of the new user
   * @throws com.guidewire.pl.system.webservices.exceptions.DataConversionException
   *          if a user already exists with the given
   *          credential name or if one of the specified roles doesn't exist.
   * @deprecated use the version of addUser with no credentialName parameter instead
   * @scriptable-all
   */
  @Throws(DataConversionException, "if a user already exists with the given credential name or if one of the specified roles doesn't exist.")
  @Deprecated("Please use addUser(data, rolePublicIds) instead")
  public function addUser(data : UserBase, rolePublicIds : String[], credentialName : String) : String {
    return addUser(data, rolePublicIds)
  }

/**
   * Adds the given user to the system. Only the contact field and credential properties are required.
   * The user will be created and given the roles specified by the <code>roles</code> parameter.
   * <p>
   * The Contact field should be set to an object of type UserContact, which should have at least its last
   * name set. The Credential field should be set to an object of type Credential which should have the
   * user name and password fields set. For example:
   * <pre>
   *    User user = new User()
   *    UserContact userContact = new UserContact()
   *    userContact.FirstName = "John"
   *    userContact.LastName = "Smith"
   *    user.Contact = userContact
   *    Credential credential = new Credential()
   *    credential.UserName  = "jsmith"
   *    credential.Password = "initialPassword"
   *    user.Credential = credential
   *    userAPI.addUser(user, new String[]{"rolex", "roley"})
   * </pre>
   *
   * @param userData           The <code>User</code> object, which must have valid <code>UserContact</code>
   *                       and <code>Credential</code> objects set as the contact and credential field.
   * @param rolePublicIds  The public ids of the roles to assign the user.
   * @return The public id of the new user
   * @throws com.guidewire.pl.system.webservices.exceptions.DataConversionException
   *          if a user already exists with the given
   *          credential name or if one of the specified roles doesn't exist.
   * @throws com.guidewire.pl.system.webservices.exceptions.RequiredFieldException
   *          if the passed in User or is null.
   * @scriptable-all
   */
  @Throws(DataConversionException, "if a user already exists with the given credential name or if one of the specified roles doesn't exist.")
  @Throws(RequiredFieldException, "if the passed in User is null, or if the passed in User.Contact is null, or if the passed in User.Credential is null.")
  public function addUser(userData : UserBase, rolePublicIds : String[] ) : String {
    if (null == userData) {
      throw new RequiredFieldException("User cannot be null in addUser().")
    }

    if (null == userData.Contact) {
        throw new RequiredFieldException("User.Contact cannot be null.")
    }
    
    if (null == userData.Credential) {
        throw new RequiredFieldException("User.Credential cannot be nul")
    }

    if (userData.Credential.Password != null) {
      // Check that the password fits the password restrictions set and Hash the password that they provide
      UserAPIHelper.setPassword( userData.Credential, userData.Credential.Password )
    }

    return doAddUser(userData, rolePublicIds, true)
  }

  /**
   * Adds roles to an User.
   * If an role is already belongs to the user, it's ignored.
   *
   * @param userID The ID of the user
   * @param roleIDs The public IDs of roles to be added.
   */
  @Throws(DataConversionException, "if the userID or roleID does not exist")
  @Throws(SOAPException, "")
  public function addRolesToUser(userID : String, roleIDs : String[]){
    var user = loadUserByIdOrThrow( userID )
    Transaction.getCurrent().add( user )
    doAddUser( user, roleIDs, false)
  }

  /**
   * Remove roles from a User.
   * If any of the roles does not belongs to the user, it will be ignored.
   *
   * @param userID The ID of the user
   * @param roleIDs The public IDs of roles to be added.  This may be null
   */
  @Throws(DataConversionException, "if the userID or one of the roleIDs does not exist")
  @Throws(SOAPException, "")
  public function removeRolesFromUser(userID : String, roleIDs : String[]){
    if (roleIDs == null){
      return
    }
    UserAPIHelper.removeRolesFromUser(userID, roleIDs)
  }

  /**
   * Adds attributes to an User.
   *
   * @param userID The ID of the user
   * @param attributeIDs attribute public IDs to be added
   */
  @Throws(DataConversionException, "if the userID or attributeID does not exist")
  @Throws(SOAPException, "")
  public function addUserAttributes(userID : String, attributeIDs : String[]){
    var user = loadUserByIdOrThrow( userID )
    if (attributeIDs == null || attributeIDs.length == 0){
      return
    }    
    Transaction.getCurrent().add( user )
    foreach ( attributeID in attributeIDs ){
      var attribute = loadAttributeByIdOrThrow( attributeID )
      var attributeUser = new AttributeUser()
      attributeUser.Attribute = attribute
      user.addToAttributes( attributeUser )  
    }    
    Transaction.getCurrent().commit()
  }

  /**
   * Remove attributes to an User.
   * If an attribute does not belongs to the user, it's ignored.
   *
   * @param userID The ID of the user
   * @param attributeIDs attribute public IDs to be removed
   */   
  @Throws(DataConversionException, "if the userID or attributeIDs do not exist")
  @Throws(SOAPException, "")
  public function removeUserAttributes(userID : String, attributeIDs : String[]){   
    var user = loadUserByIdOrThrow( userID )
    user = Transaction.getCurrent().add(user)
    if (attributeIDs == null || attributeIDs.length == 0) {
      return
    }
    for (var attributeUser in user.getAttributes()) {
      for (var attributeID in attributeIDs) {
        var attribute = loadAttributeByIdOrThrow(attributeID)
        if(attributeUser.Attribute == attribute) {
          user.removeFromAttributes(attributeUser)
        }
      }
    }
    Transaction.getCurrent().commit()
  }

  /**
   * Indicates whether the given user exists in the system.
   *
   * @param publicId The public identifier of the user in question.
   * @return <code>true</code> if the user specified by the identifier exists in the system,
   *         <code>false</code> otherwise.
   */
  public function doesExist(publicId : String) : boolean{
    return getUser( publicId ) != null
  }

  /**
   * Adds the user as a member of the group.  Both the user and group must already exist.
   *
   * @param groupID The identifier of the group.
   * @param userID  The identifier of the user.
   */
  @Throws(DataConversionException, "if the user or group is not found")
  public function addUserAsMemberOfGroup(groupID : String, userID : String){
    var group = loadGroupByIdOrThrow( groupID )
    var user = loadUserByIdOrThrow( userID )
    if (!group.isMember( user as gw.pl.persistence.core.Key )){
      Transaction.getCurrent().add( group )
      var gu = new GroupUser()
      gu.User = user
      gu.Member = true
      group.addToUsers( gu )
      Transaction.getCurrent().commit()
    }
  }

  /**
   * Removes the user as a member of the group.  Both the user and group must
   * already exist.
   *
   * @param groupID The identifier of the group.
   * @param userID  The identifier of the user.
   */
  @Throws(DataConversionException, "if the user or group is not found")
  public function removeUserAsMemberOfGroup(groupID : String, userID : String) {
    UserAPIHelper.removeUserAsMemberOfGroup( groupID, userID )
  }

  /**
   * Returns <code>true</code> if the user is a member of the group specified, <code>false</code> if not.
   *
   * @param groupID The identifier of the group.
   * @param userID  The identifier of the user.
   * @return <code>true</code> if the user is a member of the group specified, <code>false</code> if not.
   */
  @Throws(DataConversionException, "if the user or group is not found")
  public function isUserMemberOfGroup(groupID : String, userID : String) : boolean {
    var group = loadGroupByIdOrThrow( groupID )
    var user = loadUserByIdOrThrow( userID )
    return group.isMember( user as gw.pl.persistence.core.Key )
  }

  /**
   * Finds the public id of a user by the user login name.
   *
   * @param userName the login name (credential name).
   * @return the user's publicID, else null
   */
  @Throws(SOAPException, "")
  public function findPublicIdByName(userName : String) : String {
    var userQuery = find (u in User where 
                            exists( 
                              creds in User.Credential
                              where creds.UserName == userName))
    var user = userQuery.getAtMostOneRow()
    return user.PublicID
  }
  
  //----------------------------------------------------------------- private helper methods
  
  /**
   * 
   */
  @Throws (RequiredFieldException, "if the roles values are null or empty.")
  @Throws (DataConversionException, "if a user with the same public id already exists.")
  private function doAddUser(user : UserBase, roles : String[], isNew : boolean) : String {
    if (roles == null || roles.length == 0){
      throw new RequiredFieldException("Roles")
    }
    
    if (user.PublicID != null && isNew){
      var results = find ( u in User where u.PublicID == user.PublicID)
      if (results.getCount() != 0){
        throw new DataConversionException("Cannot create user, a user already exists with the PublicID: " + user.PublicID)
      }
    }
    
    // Add in all the roles for the user
    for (var roleId in roles) {
      var role = loadRoleByIdOrThrow(roleId)
      var userRole = new UserRole()
      userRole.Role = role
      user.addToRoles(userRole)
    }
    user.getBundle().commit()
    return user.getPublicID()
  }

  //----------------------------------------------------------------- private helper methods
  
  private function loadUserByIdOrThrow(id : String ) : User {    
    var user = getUser( id )
    if (user == null){
      throw new DataConversionException("No User exists with PublicID: " + id)
    }
    return user
  }
  
  private function loadGroupByIdOrThrow(id : String ) : Group {    
    var group = Transaction.getCurrent().loadByPublicId( Group, id ) as Group
    if (group == null){
      throw new DataConversionException("No Group exists with PublicID: " + id)
    }
    return group
  }
  
  private function loadRoleByIdOrThrow(id : String ) : Role {
    var role = Transaction.getCurrent().loadByPublicId( Role, id ) as Role
    if (role == null){
      throw new DataConversionException("No Role exists with PublicID: " + id)
    }
    return role
  }
  
  private function loadAttributeByIdOrThrow(id : String ) : Attribute {
    var attribute = Transaction.getCurrent().loadByPublicId( Attribute, id ) as Attribute
    if (attribute == null){
      throw new DataConversionException("No Attribute exists with PublicID: " + id)
    }
    return attribute
  }
}
