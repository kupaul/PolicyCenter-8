package gw.plugin.messaging

uses gw.api.util.Logger
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.Plugins
uses java.lang.Exception
uses gw.api.system.PLConfigParameters
uses gw.datatype.DataTypes
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field
uses org.apache.commons.lang.ObjectUtils
uses java.util.Date
uses gw.plugin.contact.ContactCommunicationException
uses gw.api.system.PLDependenciesGateway
uses gw.api.database.Query


@Export
class ContactMessageTransport implements MessageTransport {
  public static final var DEST_ID : int = 67
  public static final var TRANSACTION_ID_PREFIX : String = PLConfigParameters.PublicIDPrefix.Value + ":"
  private var logger = Logger.forCategory("ContactSystem")
  
  override function send(message : Message, transformedPayload : String) {
    var contact = message.MessageRoot as Contact
    var updateUser = contact.UpdateUser  // get the update user before the contact modified by api call. So activity can be assigned correctly
    var plugin = Plugins.get(ContactSystemPlugin)
    try {
      switch (message.EventName) {
        case "ContactAdded":
        case "ContactChanged":
          addOrUpdateContactIfNecessary(contact, transformedPayload, getTransactionId(message))
          break
        case "ContactRemoved":
          if (not contact.IsLocalOnly) {
            plugin.removeContact(contact, transformedPayload, getTransactionId(message))
          }
          break
        default:
          logger.error("Unknown Contact Message event: " + message.EventName) 
      }
      message.reportAck()
    } catch (ce : ContactCommunicationException) {
      if (ce.notifyAdmin()) {
        createActivityForAdmin(contact, transformedPayload, ce) 
      } else {
        createActivity(contact, transformedPayload, updateUser, ce) 
      }
      if (!ce.Retryable) { 
        message.reportAck() 
      } else {
        message.reportError()
      }
    } catch(e : Exception) {
      message.ErrorDescription = e.LocalizedMessage 
      logger.debug("Exception occured while sending message in CM", e)  
      message.reportError()
    }
  }
  
  private function addOrUpdateContactIfNecessary(contact : Contact, transformedPayload : String, transactionID : String){
    var plugin = Plugins.get(ContactSystemPlugin)
    if (contact.ShouldSendToContactSystem and contact.IsLocalOnly){
      plugin.addContact(contact,transformedPayload, transactionID)
      logger.info("Contact '${contact}' is synced with Contact Manager")
      contact.retryBillingEventMessages()
    } else if (not contact.IsLocalOnly) {
      plugin.updateContact(contact, transformedPayload, transactionID)
    }
  }
  
  private function getTransactionId(message : Message) : String {
    return TRANSACTION_ID_PREFIX + message.ID
  }

  private function createActivity(contact : Contact, changes : String, updateUser : User, e : Exception) {   
    createActivity(contact, changes, e, \ a -> {a.assignUserAndDefaultGroup(updateUser)})
  }
  
  private function createActivityForAdmin(contact : Contact, changes : String, e : Exception) {
    var user = getAdminUserForIntegrationHandling()
    if (user != null) {
      createActivity(contact, changes, e, \ a -> {a.assign( user.Organization.RootGroup, user )})
    }
  }
  
  private function createActivity(contact : Contact, payload : String, e : Exception,  
                        assignUserCodeBlock : block(activity : Activity))  {
    var query = Query.make(AccountContact).compare(AccountContact#Contact.PropertyInfo.Name, Equals, contact).select()                             
    if (query.Empty) {
      logger.error("Could not add/update contact ${contact} to ContactManager with payload ${payload}", e)
    } else {
      for (accountContact in query.iterator()){
        contact.Bundle.add(accountContact)
        if (not contact.UpdateUser.canView(accountContact.Account)) {
          continue
        }
        var activity = accountContact.newActivity(ActivityPattern.finder.getActivityPatternByCode("general_reminder"))
        assignUserCodeBlock(activity)
        var message = e.Message == null ? e.Class.Name : e.Message
        if (message.length > DataTypes.mediumtext().asPersistentDataType().Length) {
          message = message.substring(0, DataTypes.mediumtext().asPersistentDataType().Length - 1)
        }
        if (contact.AddressBookUID == null) {
          
          // Set activity properties for error when adding new contact          
          activity.Subject =  displaykey.Web.ContactManager.Error.FailToAddContact.Subject(contact)
          activity.Description = displaykey.Web.ContactManager.Error.FailToAddContact.Description(message)
        
        } else {
          
          // Set activity properties for error when updating existing contact
          activity.Subject = displaykey.Web.ContactManager.Error.FailToUpdateContact.Subject(contact)
          activity.Description = displaykey.Web.ContactManager.Error.FailToUpdateContact.Description(message)
          
          // Create a note
          var note = activity.newNote()
          note.Subject = displaykey.Web.ContactManager.Error.FailToUpdateContact.Subject.Note(contact)
          var contactModel = XmlBackedInstance.parse(payload)        
          note.Body = createNote(contactModel)
        }
        
        // if we get this far, we've created an activity and can stop
        return
      }
    }
  }

  private function createNote(instance: XmlBackedInstance) : String {
    return "${Date.CurrentDate.toTimeString()} \n" + appendInstanceChanges(instance, "contact") 
  }
  
  private function appendInstanceChanges(instance: XmlBackedInstance, objectPath : String) : String {
    var noteText = ""
    
    for (field in instance.Field) {
      if (not(isExcludedField(field)) and not ObjectUtils.equals(field.OrigValue, field.Value)) {
        if (field.OrigValue == null) {
          noteText += displaykey.Web.ContactManager.Info.AddField("${objectPath}.${field.Name}", field.Value) + "\n"
        } else if (field.Value == null) { 
          noteText += displaykey.Web.ContactManager.Info.RemoveField("${objectPath}.${field.Name}", field.OrigValue) + "\n"
        } else {
          noteText += displaykey.Web.ContactManager.Info.UpdateField("${objectPath}.${field.Name}", field.OrigValue, field.Value) + "\n"
        }
      }
    }
    for (fkItem in instance.Fk) {
      var fkInstance = fkItem.XmlBackedInstance
      if (not ObjectUtils.equals(fkItem.OrigValue, fkInstance.LinkID)) {  // if the FK has changed where it points
        if (fkItem.OrigValue == null) {
          noteText += displaykey.Web.ContactManager.Info.AddForeignKey("${objectPath}.${fkItem.Name}", fkInstance.LinkID) + "\n"
        } else if (fkInstance.LinkID == null) {
          noteText += displaykey.Web.ContactManager.Info.RemoveForeignKey("${objectPath}.${fkItem.Name}", fkItem.OrigValue) + "\n"
        } else {
          noteText += displaykey.Web.ContactManager.Info.UpdateForeignKey("${objectPath}.${fkItem.Name}", fkItem.OrigValue, fkInstance.LinkID) + "\n"
        }
      }
      noteText += appendInstanceChanges(fkInstance, "${objectPath}.${fkItem.Name}")
    }
    for (array in instance.Array) {
      var arrayName = array.Name
      for (arrayItem in array.XmlBackedInstance) {
        var arrayElemID = arrayItem.LinkID == null ? displaykey.Web.ContactManager.Info.NewElement : arrayItem.LinkID
        if (arrayItem.Action == "Add") {
          noteText += displaykey.Web.ContactManager.Info.AddArrayElement("${objectPath}.${arrayName}") + "\n"
        } else if (arrayItem.Action == "Update") {
          noteText += displaykey.Web.ContactManager.Info.UpdateArrayElement("${objectPath}.${arrayName}[${arrayElemID}]") + "\n"
        } else if (arrayItem.Action == "Remove") {
          noteText += displaykey.Web.ContactManager.Info.RemoveArrayElement("${objectPath}.${arrayName}[${arrayElemID}]") + "\n"
        } else if (arrayItem.Action != null) {
          noteText += "Unrecognized array action: ${arrayItem.Action}\n"
        }
        noteText += appendInstanceChanges(arrayItem, "${objectPath}.${arrayName}[${arrayElemID}]")
      }
    }
    
    return noteText
  }

  private function isExcludedField(field : XmlBackedInstance_Field) : boolean {
    return (field.Name == "LinkID" or field.Name == "External_PublicID")
  }
  
  /**
   * Return the user we would like to assign the activity to if there is a
   * unexpected exception thrown from contact manager. Extract this out
   * so it's easier for customization   
   */
  private function getAdminUserForIntegrationHandling() : User {
     return PLDependenciesGateway.getUserFinder().findByCredentialName("admin")
  }
  
  override function resume() { }

  override function setDestinationID(id: int) { }

  override function shutdown() {
    logger.info("Contact integration is shutdown")        
  }

  override function suspend() {
    logger.info("Contact integration is suspended")
  }

}
