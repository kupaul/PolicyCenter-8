package gw.address
uses java.util.Set

/**
 * Helper class for LinkedAddress UI
 */
@Export
class LinkedAddressUIHelper {

  private construct() {
  }
  
  static function getPrimaryAddressForPolicyContact( aContact : PolicyContactRole) : Address {
    return aContact.AccountContactRole.AccountContact.Contact.PrimaryAddress    
  }
  
  static function getAllNonPrimaryAddressesForPolicyContact( aContact : PolicyContactRole) : Address[] {
    return aContact.AccountContactRole.AccountContact.Contact.SecondaryAddresses    
  } 

  /**
   * Retrieves all contact/address candidates the user can select to link any address to.
   * 
   * @param currentContact The current contact, used to filter the results
   * @param account The current account (if available, can be null) 
   * @param period The current PolicyPeriod (if available, can be null) 
   */
  static function getContactsAvailableAsLinks(currentContact : Contact, account : Account, period : PolicyPeriod) : List<ContactTypePair> {
    var contacts : Set<ContactTypePair> = {}
    if (period != null) {
      contacts.addAll(getPeriodContacts(currentContact, period))
    }
    if (account != null) {
      contacts.addAll(getAccountContacts(currentContact, account))
    }
    return contacts.toList().sortBy(\ c -> c.SortOrder)
  }
  
  private static function getPeriodContacts(currentContact : Contact, period : PolicyPeriod) : List<ContactTypePair> {    
    var primaryNamedInsured = new ContactTypePair(period.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact,
      displaykey.entity.PolicyPriNamedInsured, 1)
    var periodContacts : List<ContactTypePair> = {primaryNamedInsured}
    return periodContacts.where(\ a -> a.Contact != currentContact)
  }

  private static function getAccountContacts(currentContact : Contact, account : Account) : List<ContactTypePair> {
    var accountHolder = new ContactTypePair(account.AccountHolder.AccountContact.Contact,
      displaykey.entity.AccountHolder, 2)
    var accountContacts : List<ContactTypePair> = {accountHolder}
    var namedInsureds = account.AccountContacts
                            .where(\ a -> a.Roles.countWhere(\ role -> role typeis entity.NamedInsured) > 0)
                            .orderBy(\ ni -> ni.DisplayName)   
    var namedInsuredSortIndex = 300
    namedInsureds.each(\ a -> {
        accountContacts.add(new ContactTypePair(a.Contact, displaykey.entity.NamedInsured, namedInsuredSortIndex) )
        namedInsuredSortIndex++
      } )
    return accountContacts.where(\ a -> a.Contact != currentContact)
  }
  
  static class ContactTypePair {
    var _contact : Contact as readonly Contact
    var _contactType : String as readonly ContactType
    var _sortingOrder : int as readonly SortOrder
    
    construct(newContact : Contact, type : String, sortingOrder : int) {
      _contact = newContact
      _contactType = type
      _sortingOrder = sortingOrder
    }

    override function hashCode() : int {
      return _contact.ID.hashCode()
    }
    
    override function equals(o : Object) : boolean {
      if (o === this) return true
      if (not (o typeis ContactTypePair)) return false
      return _contact == (o as ContactTypePair).Contact
    }
  }
}
