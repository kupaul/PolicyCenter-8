package gw.web.admin

uses gw.api.system.PCLoggerCategory
uses gw.api.util.CurrencyUtil
uses gw.api.util.LocationUtil
uses gw.plugin.Plugins
uses gw.plugin.billing.AgencyBillPlanSummary
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.util.concurrent.LocklessLazyVar
uses java.util.Map

@Export
class OrganizationUIHelper {
  var _organization: Organization as readonly Organization

  var _planSummariesPerCurrency: LocklessLazyVar<Map<Currency, List<AgencyBillPlanSummary>>>

  construct(organization: Organization) {
    _organization = organization
    _planSummariesPerCurrency = new LocklessLazyVar<Map<Currency, List<AgencyBillPlanSummary>>>() {
      override function init(): Map<Currency, List<AgencyBillPlanSummary>> {
        try {
          return BillingSystemPlugin.retrieveAllAgencyBillPlans().partition<Currency>(\ plan -> plan.Currency)
        } catch (e: java.lang.Exception) {
          LocationUtil.addRequestScopedErrorMessage(displaykey.Web.Errors.BillingSystem.AgencyPlans)
          PCLoggerCategory.SERVER.error(e)
        }
        return {}
      }
    }
  }

  function createUser() : User {
    var user = new User()
    user.ExternalUser = not _organization.Carrier
    user.UseOrgAddress = false
    user.setOrganizationWithUpdate(_organization)
    user.Credential = new Credential()
    _organization.Contact = user.Contact
    return user
  }

  static function getUser(c : Contact) : User{
    var u = gw.api.database.Query.make(User).compare(User#Contact.PropertyInfo.Name, Equals, c).select().FirstResult
    if(u == null){
      u = c.Bundle.InsertedBeans.toCollection().whereTypeIs(User).firstWhere(\ x -> x.Contact == c)
    }
    return u
  }

  property get AllOrganizationUsers() : List<User>{
    var users = _organization.AllUsers.toList()
    users = users.Count > 10 ? users.subList(0, 10) : users
    var newUsers = _organization.Bundle.InsertedBeans.toCollection().whereTypeIs( User ).toList()
    users.addAll( newUsers )
    return users
  }

  static function createCriteria(activeProducersOnly : java.lang.Boolean, includesCarrier : java.lang.Boolean) : OrganizationSearchCriteria {
    var criteria = new OrganizationSearchCriteria()
    if( activeProducersOnly )
    {
      criteria.ProducerStatus = "Active"
    }
    criteria.Carrier = includesCarrier
    return criteria
  }

  function newDefaultCurrencyBillPlanSelector(): BillPlanSelector {
    return new BillPlanSelector(CurrencyUtil.DefaultCurrency)
  }

  static property get BillingSystemPlugin() : IBillingSystemPlugin {
    return Plugins.get(IBillingSystemPlugin)
  }

  property get BillingPlanInputs(): BillPlanInputGroup[] {
    return _planSummariesPerCurrency.get().keySet().map(\ c -> new BillPlanInputGroup(c)).toTypedArray()
  }

  property get PerCurrencyBillPlansVisible(): boolean {
    return _organization.Producer and perm.System.orgviewagency and CurrencyUtil.MultiCurrencyMode
  }

  property get SingleBillPlanVisible(): boolean {
    return _organization.Producer and perm.System.orgviewagency and CurrencyUtil.SingleCurrencyMode
  }

  property get AgencyBillTabVisible(): boolean {
    return PerCurrencyBillPlansVisible
  }

  /**
   * Per-currency BillPlanInput functionality
   */
  class BillPlanInputGroup {
    var _currency: Currency
    var _planBean: AgencyBillPlan
    var _availablePlans: List<AgencyBillPlanSummary>

    construct(currency: Currency) {
      _currency = currency
      _planBean = _organization.AgencyBillPlans.firstWhere(\plan -> plan.Currency == _currency)
      _availablePlans = _planSummariesPerCurrency.get().get(_currency)
    }

    property get IsNew(): boolean {
      return _planBean == null or _planBean.New
    }

    property get Editable(): boolean {
      var result = IsNew and perm.Organization.editagency(_organization)
      return result
    }

    property get Currency(): Currency {
      return _currency
    }

    property get AvailableBillPlans(): List<AgencyBillPlanSummary> {
      return _availablePlans
    }

    property get AgencyBillPlan(): AgencyBillPlanSummary {
      return _planBean == null ? null : _availablePlans?.firstWhere(\plan -> plan.Id == _planBean.PlanID)
    }

    property set AgencyBillPlan(plan: AgencyBillPlanSummary) {
      _planBean.PlanID = plan?.Id
    }

    property get Available(): boolean {
      return _planBean <> null
    }

    property set Available(state: boolean) {
      if (_planBean == null) {
        if (state) {
          _planBean = new AgencyBillPlan(_organization.Bundle)
          _planBean.Organization = _organization
          _planBean.Currency = _currency
        }
      } else if (not state) {
        _planBean.remove()
        _planBean = null
      }
    }
  }

  /**
   * Drop-down version which "manages" the existence of the target bean depending on whether
   * we have been assigned a value or null
   */
  class BillPlanSelector extends BillPlanInputGroup {
    construct(currency: Currency) {
      super(currency)
    }

    override property set AgencyBillPlan(plan: AgencyBillPlanSummary) {
      if(plan == null) {
        Available = false
      } else {
        Available = true
        super.AgencyBillPlan = plan
      }
    }
  }
}