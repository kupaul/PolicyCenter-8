package gw.contact
uses gw.api.copy.Copier


/**
 * A {@link Copier} to copy all {@link Contact} fields
 * to a target {@link Contact}. Note: it doesn't copy foreignkey like primary address
 * or addresses.
 */
@Export
class ContactCopier extends Copier<Contact> {

  var _contact : Contact as readonly Source
  
  construct(contact : Contact) {
    _contact = contact
    shouldCopy()
  }

  override function copy(target : Contact) {
    // copy common fields
    target.EmailAddress1  = _contact.EmailAddress1  
    target.EmailAddress2 = _contact.EmailAddress2
    target.FaxPhone = _contact.FaxPhone
    target.HomePhone = _contact.HomePhone
    target.Name = _contact.Name
    target.Notes = _contact.Notes
    target.Preferred = _contact.Preferred
    target.PreferredCurrency = _contact.PreferredCurrency
    target.PrimaryPhone = _contact.PrimaryPhone
    target.TaxStatus = _contact.TaxStatus
    target.WithholdingRate = _contact.WithholdingRate
    target.WorkPhone = _contact.WorkPhone
    // copy company field
    if (target typeis Company) {
      target.FEINOfficialID = _contact.FEINOfficialID
    } 
    // copy person field
    else if (target typeis Person) {
      var person = _contact as Person
      target.CellPhone = person.CellPhone
      target.DateOfBirth = person.DateOfBirth
      target.FirstName = person.FirstName
      target.FormerName = person.FormerName
      target.Gender = person.Gender
      target.LastName = person.LastName
      target.LicenseNumber = person.LicenseNumber
      target.LicenseState = person.LicenseState
      target.MaritalStatus = person.MaritalStatus
      target.MiddleName = person.MiddleName
      target.NumDependents = person.NumDependents
      target.NumDependentsU18 = person.NumDependentsU18
      target.NumDependentsU25 = person.NumDependentsU25
      target.Occupation = person.Occupation
      target.Prefix = person.Prefix
      target.Suffix = person.Suffix
      target.TaxFilingStatus = person.TaxFilingStatus
      target.SSNOfficialID = person.SSNOfficialID
    }
  }

}
