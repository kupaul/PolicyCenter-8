package gw.search

uses gw.api.name.ContactNameOwner
uses gw.api.name.NameOwnerFieldId
uses java.util.Set
uses gw.api.name.ContactNameFields

@Export
class BasicNameOwner extends ContactNameOwner{

  construct(fields : ContactNameFields) {
    super(fields)
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return { }.freeze()
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return {NameOwnerFieldId.PREFIX, NameOwnerFieldId.SUFFIX, NameOwnerFieldId.MIDDLENAME, NameOwnerFieldId.PARTICLE}
        .freeze()
  }

  override property get ContactNamePhoneticLabel() : String {
    return displaykey.Web.ContactDetail.Company.CompanyNamePhonetic
  }

  override property get ContactNameLabel() : String {
    return displaykey.Web.ContactDetail.Company.CompanyName
  }

  override property get ShowNameSummary() : boolean {
    return false
  }
}