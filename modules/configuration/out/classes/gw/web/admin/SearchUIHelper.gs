package gw.web.admin

uses pcf.AssignUserRoleOwnerPopup

@Export
class SearchUIHelper {

  public static function populateErrorMessage(errorMessage : String) : String{
    if(errorMessage != null) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(errorMessage)
    }
    return errorMessage
  }

  public static function getProducerBasedOnCurrentUser() : Organization {
    return User.util.CurrentUser.ExternalUser ? User.util.CurrentUser.Organization : null
  }

  public static function jumpToAssignUserRoleOwnerPopup(searchCriteria : PolicySearchCriteria, periodSummaries : PolicyPeriodSummary[], role : typekey.UserRole) {
    if (searchCriteria.SearchObjectType.Code.equals(SearchObjectType.TC_POLICY.Code)) {
      AssignUserRoleOwnerPopup.push(periodSummaries.map(\ pps -> Policy.finder.findPolicyByPolicyNumber(pps.PolicyNumber) ), role )
    } else {
      AssignUserRoleOwnerPopup.push(periodSummaries.map(\ pps -> pps.Job ), role )
    }
  }

  public static function sourceLabel(value : boolean) : String {
    if (value) {
      return displaykey.Web.PolicySearch.ArchivedChoices.IncludeArchived
    } else {
      return displaykey.Web.PolicySearch.ArchivedChoices.ExcludeArchived
    }
  }

  public static function createCriteria(dom : IndustryCodeType, refDate : DateTime, prevIndCode : IndustryCode): gw.product.IndustryCodeSearchCriteria {
    return new gw.product.IndustryCodeSearchCriteria() {
        :Domain = dom,
        :EffectiveOnDate = refDate == null ? DateTime.CurrentDate : refDate,
        :PreviousCode = prevIndCode.Code
    }
  }

  public static function createCriteria(checkUserSecurityZone : boolean
                                        , producer : entity.Organization
                                        , usedFor : typekey.ProducerStatusUse) : gw.product.ProducerCodeSearchCriteria {
    var c = new gw.product.ProducerCodeSearchCriteria()
    // if the user comimg to this screen from search tab (checkUserSecurityZone flag is true). Then for the internal user
    // without view all permission should be able to see all the producer codes within their security zones.
    if (checkUserSecurityZone &&
        ((!User.util.CurrentUser.ExternalUser) && (!perm.System.userviewall))) {
      c.FilterByUserSecurityZones = true
    }
    if (User.util.CurrentUser.ExternalUser) {
      c.Producer = User.util.CurrentUser.Organization
    }
    else if (producer != null) {
      c.Producer = producer
    }
    c.StatusUse = usedFor
    c.Secure = true
    return c
  }
}