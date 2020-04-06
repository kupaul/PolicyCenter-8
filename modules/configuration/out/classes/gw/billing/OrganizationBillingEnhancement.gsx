package gw.billing

uses gw.transaction.Transaction
uses gw.plugin.Plugins
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.api.util.LocationUtil
uses gw.api.system.PCLoggerCategory

enhancement OrganizationBillingEnhancement: entity.Organization {

  /**
   * Synchronizes PolicyCenter and BillingCenter's data for given Organization/Producer
   */
  function syncWithBillingSystem() {
    Transaction.runWithNewBundle(\ bundle -> {
      var syncedOrganization = bundle.add(this)
      try {
        Plugins.get(IBillingSystemPlugin).syncOrganization(syncedOrganization)
      } catch (e: java.lang.Exception) {
        LocationUtil.addRequestScopedErrorMessage(displaykey.Web.Errors.BillingSystem.OrganizationSyncFailed)
        PCLoggerCategory.SERVER.error(e)
      }
    })
    this.refresh()
  }

}
