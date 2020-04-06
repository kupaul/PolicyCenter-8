package gw.web.contact

uses java.util.Set

/**
 * Implements a ContactMetrics Factory.
 */
@Export
class ContactMetricsFactory {

  static var _factory : ContactMetricsFactory as Factory = new ContactMetricsFactory()

  /**
   * Return the Contact Policy Metrics for the specified Contact
   *    with the specified Account Contact Roles.
   */
  function getContactMetrics(contact : Contact, roles : Set<Type<AccountContactRole>>) : ContactMetrics {
    var contactMetrics = new ContactMetricsImpl(contact, roles)
    contactMetrics.initialize()
    return contactMetrics
  }      

}