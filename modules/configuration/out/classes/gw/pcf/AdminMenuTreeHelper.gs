package gw.pcf
uses pcf.UserDetailPage
uses pcf.GroupDetailPage
uses pcf.OrganizationDetail

@Export
class AdminMenuTreeHelper {

  /**
   * Goes to particular page based on element's type
   * @param element Object whose type determines where to go.
   */
  public static function goToPageBasedOnElementType(element : Object) {
    if (element typeis User) {
      UserDetailPage.go(element)
    } else if (element typeis Group) {
      GroupDetailPage.go(element)
    } else if (element typeis Organization) {
      OrganizationDetail.go(element)
    }
  }
 
}
