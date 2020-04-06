package gw.pcf.contacts

uses gw.api.system.PCDependenciesGateway
uses gw.api.ui.DisplayedObject
uses gw.api.productmodel.Product

@Export
class ContactFileWorkOrdersUIHelper {

  construct(){}

  public function getStatusFilterInitialValue() : DisplayedObject<java.lang.Boolean> {
    var result = gw.job.JobFilters.OpenStatusFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting( "StatusFilterChoice" )
    if (setting != null) {
      var pick = gw.job.JobFilters.StatusFilterSet.firstWhere( \ pick -> pick.display.equals( setting ) )
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public function setStatusFilterValue(value : String) {
    PCDependenciesGateway.getPCWebSession().putSetting( "StatusFilterChoice", value )
  }

  public function getWorkOrderInitialValue() : DisplayedObject<typekey.Job> {
    var result = gw.job.JobFilters.AllJobsFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting( "WorkOrderTypeChoice" )
    if (setting != null) {
      var pick = gw.job.JobFilters.JobTypeFilterSet.firstWhere( \ pick -> pick.display.equals( setting ) )
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public function setWorkOrderFilterValue(value : String) {
    PCDependenciesGateway.getPCWebSession().putSetting( "WorkOrderTypeChoice", value )
  }

  public function getProductFilterInitialValue(contact : Contact) : DisplayedObject<Product> {
    var result = gw.job.JobFilters.AllProductsFilter
    var setting = PCDependenciesGateway.getPCWebSession().getSetting( "ProductFilterChoice" )
    if (setting != null) {
      var pick = gw.job.JobFilters.createProductFilterOptions(contact.AccountContacts.first().Account).firstWhere( \ pick -> pick.display.equals( setting ) )
      if (pick != null) {
        result = pick
      }
    }
    return result
  }

  public function setProductFilterValue(value : String) {
    PCDependenciesGateway.getPCWebSession().putSetting( "ProductFilterChoice", value )
  }
}