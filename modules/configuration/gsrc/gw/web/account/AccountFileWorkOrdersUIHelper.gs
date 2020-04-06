package gw.web.account

uses gw.api.system.PCDependenciesGateway

@Export
class AccountFileWorkOrdersUIHelper {
  public static property get StatusFilterInitialValue(): gw.api.ui.DisplayedObject <java.lang.Boolean> {
    var result = gw.job.JobFilters.AllStatusFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting("StatusFilterChoice")
    if (setting != null) {
      var pick = gw.job.JobFilters.StatusFilterSet.firstWhere(\pick -> pick.display.equals(setting))
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public static property set StatusFilterValue(value: String) {
    PCDependenciesGateway.getPCWebSession().putSetting("StatusFilterChoice", value)
  }

  public static property get WorkOrderInitialValue(): gw.api.ui.DisplayedObject <typekey.Job> {
    var result = gw.job.JobFilters.AllJobsFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting("WorkOrderTypeChoice")
    if (setting != null) {
      var pick = gw.job.JobFilters.JobTypeFilterSet.firstWhere(\pick -> pick.display.equals(setting))
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public static property set WorkOrderFilterValue(value: String) {
    PCDependenciesGateway.getPCWebSession().putSetting("WorkOrderTypeChoice", value)
  }

  public static function getProductFilterInitialValue(account: entity.Account): gw.api.ui.DisplayedObject <gw.api.productmodel.Product> {
    var result = gw.job.JobFilters.AllProductsFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting("ProductFilterChoice")
    if (setting != null) {
      var pick = gw.job.JobFilters.createProductFilterOptions(account).firstWhere(\pick -> pick.display.equals(setting))
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public static property set ProductFilterValue(value: String) {
    PCDependenciesGateway.getPCWebSession().putSetting("ProductFilterChoice", value)
  }
}