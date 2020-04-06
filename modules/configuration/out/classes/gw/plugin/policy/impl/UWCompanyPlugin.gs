package gw.plugin.policy.impl

uses gw.api.system.PCDependenciesGateway
uses gw.plugin.policy.IUWCompanyPlugin
uses java.util.Set

@Export
class UWCompanyPlugin implements IUWCompanyPlugin {

  override function findUWCompaniesForStates(period : PolicyPeriod, allStates : boolean) : Set<UWCompany> {
    // This OOTB implementation goes through Guidewire's UWCompanyFinder to retrieve the UWCompanies
    // The finder queries on the UWCompany table with a conjunctive or disjunctive reverse join through
    // the LicensedState table per state, depending on the value of allStates.
    return PCDependenciesGateway.getUWCompanyFinder().findUWCompaniesByStatesAndProductAndValidOnDate(period.AllCoveredStates, allStates, period.Policy.Product, period.PeriodStart).toSet()
  }
}
