package gw.contact

uses gw.api.name.ContactNameOwner
uses gw.api.name.ContactNameFields
uses gw.api.name.PersonNameFields

@Export
class ContactNameNoSummaryOwner extends ContactNameOwner {

  construct(fields : ContactNameFields) {
    super(fields)
  }

  construct (fields : PersonNameFields) {
    super(fields)
  }

  override property get ShowNameSummary() : boolean {
    return false
  }
}
