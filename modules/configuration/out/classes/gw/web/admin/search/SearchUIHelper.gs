package gw.web.admin.search

@Export
class SearchUIHelper {
  public static function createSearchCriteria(org : Organization) : gw.product.ProducerCodeSearchCriteria {
    var c = new gw.product.ProducerCodeSearchCriteria()
    if ( (!User.util.CurrentUser.ExternalUser) && (!perm.System.userviewall)) {
      c.FilterByUserSecurityZones = true
    }
    if (User.util.CurrentUser.ExternalUser) {
      c.Producer = User.util.CurrentUser.Organization
    } else if ( ( org != null ) and !org.Carrier ) {
      c.Producer = org
    }
    return c
  }
}