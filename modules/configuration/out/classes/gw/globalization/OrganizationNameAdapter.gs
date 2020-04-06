package gw.globalization

uses gw.api.name.ContactNameFields

/**
 * Adapts an Organization to work with ContactNameFields-dependent components.
 */
@Export
class OrganizationNameAdapter implements ContactNameFields {

  var _organization : entity.Organization

  construct(org : Organization) {
    _organization = org
  }

  override property get Name(): java.lang.String {
    return _organization.Name
  }

  override property set Name(n : String) {
    // Root group is an internal group that exists as
    // the top of an org's group tree.  Group name is not
    // directly settable to enforce setting the root group
    // name when setting the organization name
    _organization.setNameAndRootGroupName(n)
  }

  override property get NameKanji(): String {
    return _organization.NameKanji
  }

  override property set NameKanji(nk : String) {
    _organization.NameKanji = nk
  }
}