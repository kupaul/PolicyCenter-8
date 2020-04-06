package gw.api.name

uses gw.search.BasicNameOwner
uses java.util.Set

@Export
class RequiredBasicNameOwner extends BasicNameOwner {

  construct(fields : ContactNameFields) {
    super(fields)
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return NameOwnerFieldId.FIRST_LAST_FIELDS
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return {NameOwnerFieldId.PREFIX, NameOwnerFieldId.SUFFIX, NameOwnerFieldId.MIDDLENAME}.freeze()
  }
}