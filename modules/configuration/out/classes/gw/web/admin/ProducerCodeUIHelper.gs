package gw.web.admin

uses gw.api.util.CurrencyUtil
uses gw.api.util.DisplayableException
uses gw.plugin.billing.CommissionPlanSummary
uses gw.api.system.PCLoggerCategory

@Export
class ProducerCodeUIHelper {
  public static function performBranchSearch(name: String): Group {
    var criteria = new GroupSearchCriteria().asBranchSearch()
    criteria.BranchName = name
    var rtn: Group
    try {
      rtn = criteria.performSearch().getAtMostOneRow() as Group
    } catch (e: com.guidewire.commons.system.exception.MultipleMatchesException) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Admin.ProducerCodeDetail.Error.MultipleBranchesFound(name))
    }
    if (rtn == null) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Admin.ProducerCodeDetail.Error.NoBranchFound(name))
    }
    return rtn
  }

  public static function getCommissionPlans(tier: typekey.Tier): CommissionPlanSummary[] {
    var plans: CommissionPlanSummary[]
    var producerTier = tier == null ? typekey.Tier.TC_BRONZE : tier
    try {
      var BillingSystem = gw.plugin.Plugins.get(gw.plugin.billing.IBillingSystemPlugin)
      plans = BillingSystem.retrieveAllCommissionPlans().where(\c -> c.AllowedTiers.contains(producerTier))
    } catch (e: java.lang.Exception) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(displaykey.Web.Errors.BillingSystem.CommissionPlans)
      PCLoggerCategory.SERVER.error(e)
      return {}
    }
    if (plans.Count == 0) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(displaykey.Web.Admin.ProducerCodeDetail.Error.NoCommissionPlan(producerTier))
    }
    return plans
  }

  public static function removeUncommittedCommissionPlan(commissionPlan: CommissionPlan) {
    if (not commissionPlan.New) {
      throw new DisplayableException(displaykey.Web.Admin.ProducerCodeDetail.CommittedPlansCannotBeRemoved)
    }
    commissionPlan.ProducerCode.removeFromCommissionPlans(commissionPlan)
  }

  public static function initializeCommissionPlans(producerCode: ProducerCode, org: Organization) {
    producerCode.CommissionPlans.each(\elt -> elt.remove())
    if (CurrencyUtil.SingleCurrencyMode) {
      producerCode.addCommissionPlanForCurrency(CurrencyUtil.DefaultCurrency)
    }
  }

  public static function addAndReturnCommissionPlanForCurrency(producerCode: ProducerCode, currency: Currency): CommissionPlan {
    if (producerCode.findCommissionPlanByCurrency(currency) == null) {
      producerCode.addCommissionPlanForCurrency(currency)
    }
    return producerCode.findCommissionPlanByCurrency(currency)
  }

  /**
   * Note:  for BillingCenter, each producer code requires a commission plan (in each currency defined).
   * This may not be a requirement for other billing systems and is not a requirement for PolicyCenter.
   */
  static function validateCommissionPlansDuringProducerCodeCreation(producerCode : ProducerCode) : String {
    return producerCode.CommissionPlans.HasElements ? null : displayKey.Validation.ProducerCode.NoCommissionPlans
  }

  function removeProducerCodeRole(p : ProducerCodeRole) {
    if (p.Role == null) {
      p.remove()
    } else {
      p.ProducerCode.removeRole(p.Role)
    }
  }
}