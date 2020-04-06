package gw.search

uses gw.api.name.ContactNameFields
uses gw.api.name.ContactNameOwner
uses gw.api.name.NameOwnerFieldId

uses java.util.Set

@Export
class OrganizationNameOwner extends ContactNameOwner{

  construct(fields : ContactNameFields) {
    super(fields)
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return {NameOwnerFieldId.NP_NAME}.freeze()
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return {NameOwnerFieldId.PREFIX, NameOwnerFieldId.SUFFIX, NameOwnerFieldId.MIDDLENAME}.freeze()
  }

  override property get ContactNamePhoneticLabel() : String {
    return displaykey.Web.Admin.OrganizationSearch.NamePhonetic
  }

  override property get ContactNameLabel() : String {
    return displaykey.Web.Admin.OrganizationSearch.Name
  }

  override property get ShowNameSummary(): boolean {
    return false
  }
}