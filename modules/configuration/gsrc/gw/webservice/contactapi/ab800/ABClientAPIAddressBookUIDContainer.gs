package gw.webservice.contactapi.ab800

/**
 * An ABClientAPIAddressBookUIDContainer is passed as an argument to ABClientAPI.pendingUpdateApproved().
 * It contains the the mapping between client public ids and addressbookuids for entities created by the update.
 */
@Export
@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pl/ws/gw/webservice/contactapi/ab800/ABClientAPIAddressBookUIDContainer")
final class ABClientAPIAddressBookUIDContainer {

  /**
   * The ABUID of the AB Contact that was updated.
   */
  public var ContactABUID         : String

  /**
   * The set of mappings from public IDs to ABUIDs.
   */
  public var AddressBookUIDTuples : ABClientAPIAddressBookUIDTuple[]
  
  construct() {}
  
}
