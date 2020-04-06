package gw.plugin.contact.ab700
uses gw.plugin.contact.ContactResult
uses java.lang.IllegalStateException
uses gw.plugin.contact.ContactCreator
uses gw.plugin.Plugins
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.impl.AbstractContactResult
uses gw.contactmapper.ab700.ContactIntegrationXMLMapper

/**
 * Abstract class to represent an implementation of the ContactResult interface generated from
 * some external source.  All sub-classes of this class are guaranteed to return true for
 * the External property.  Handles some generic conversion of AB Contact Types to PC Contact
 * Types, as well as a default implementation of the convertToContact method.
 */
@Deprecated("Since 8.0.0.  Please use the ab800 package.")
@Export
abstract class AbstractContactResultExternal extends AbstractContactResult implements ContactResult {
  
  protected final function translateContactType(rawContactType : String) : typekey.Contact {
    var convertedContactType = ContactIntegrationXMLMapper.getInstance().getNameMapper().getEntityNameFromXSDType(rawContactType)
    if (convertedContactType == null) {
      throw new IllegalStateException("Unrecognized contact type : ${rawContactType}")
    }
    return convertedContactType
  }

  override function convertToContact(creator : ContactCreator) : Contact {
    return Plugins.get(ContactSystemPlugin).retrieveContact(ContactAddressBookUID, creator)
  }
  
  override final property get External() : boolean {
    return true
  }
}
