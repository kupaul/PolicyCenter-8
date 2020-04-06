package gw.search

uses gw.api.database.Table
uses gw.api.database.Relop
uses gw.api.database.Query
uses gw.xml.ws.annotation.WsiExportable

@Export
@WsiExportable( "http://guidewire.com/pc/ws/gw/search/NameCriteria" )
final class NameCriteria {

  construct() {
    FirstNameExact = false
    LastNameExact = false
    CompanyNameExact = false
  }

  var _companyName : String as CompanyName
  var _firstName: String as FirstName
  var _firstNameExact: boolean as FirstNameExact;
  var _taxId: String as TaxId
  var _lastName: String as LastName
  var _lastNameExact: boolean as LastNameExact;
  var _companyNameExact : boolean as CompanyNameExact;
  var _name: String as Name
  var _officialId: String as OfficialId

  /**
   *
   * @return
   */
  function isSet() : boolean{
    return CompanyName != null || FirstName != null || LastName != null ||
                    Name != null || TaxId != null || OfficialId != null;
  }

  /**
   * 
   * @param primary
   * @param joinField
   * @return
   */
  function addJoin(primary : Query, joinField : String) : Table<Contact>{
    var contact : Table<Contact>
    if (getCompanyName() != null) {
      contact = primary.join(joinField).cast(Company) as Table<Contact>
      if (getCompanyNameExact()) 
        contact.compareIgnoreCase("Name",Relop.Equals,CompanyName)
      else
        contact.startsWith("Name", CompanyName, true)
    } else if (getFirstName() != null || getLastName() != null) {
      contact = primary.join(joinField).cast(Person) as Table<Contact>
      if (getFirstName() != null) {
        if (getFirstNameExact()) 
          contact.compareIgnoreCase("FirstName", Relop.Equals, FirstName)        
        else 
          contact.startsWith("FirstName", FirstName, true)
      }
      if (getLastName() != null) {
        if (getLastNameExact()) 
          contact.compareIgnoreCase("LastName", Relop.Equals, LastName)
        else
          contact.startsWith("LastName", LastName, true)
      }
    } else if (Name != null) {
      contact = primary.join(joinField).cast(Person) as Table<Contact>
      contact.or(\ restriction -> restriction.startsWith("FirstName", Name, true))
      contact.or(\ restriction -> restriction.startsWith("LastName", Name, true))
    } else {
      contact = primary.join(joinField) as Table<Contact>
    }
    if (getTaxId() != null) {
      contact.compare("TaxID", Relop.Equals, TaxId)
    }
    if (getOfficialId() != null) {
      // join against official ID value, regardless of Type and State
      var officialIdTable = contact.join(entity.OfficialID, "Contact")
      officialIdTable.compare("OfficialIDValue", Relop.Equals, OfficialId);
    }

    return contact;
  }

  /**
   *
   * @return
   */
  function validate() : boolean{
    return isSet();
  }
}
