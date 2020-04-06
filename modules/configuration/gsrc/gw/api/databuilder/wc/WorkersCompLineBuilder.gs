package gw.api.databuilder.wc

uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.databuilder.contact.PolicyOwnerOfficerBuilder
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.api.databuilder.contact.PolicyLaborClientBuilder
uses gw.api.databuilder.contact.PolicyLaborContractorBuilder
uses gw.api.builder.ExclusionBuilder
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

/**
 * @author dpetrusca
 */
@Export
class WorkersCompLineBuilder extends PolicyLineBuilder<entity.WorkersCompLine, WorkersCompLineBuilder> {

  construct() {
    super(entity.WorkersCompLine)
  }
  
  function withCoverage(coverageBuilder : CoverageBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCLINECOVERAGES"), coverageBuilder)
    return this
  }

  function withExclusion(exclusionBuilder : ExclusionBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCLINEEXCLUSIONS"), exclusionBuilder)
    return this
  }

  final function withWCCoveredEmployee(eu : WCCoveredEmployeeBuilder) : WorkersCompLineBuilder {
    addAdditiveArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCCOVEREDEMPLOYEES"), eu)
    return this
  }

  final function withWCFedCoveredEmployee(eu : WCFedCoveredEmployeeBuilder) : WorkersCompLineBuilder {
    addAdditiveArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCFedCoveredEmployees"), eu)
    return this
  }

  function withJurisdiction(jurisdiction : WCJurisdictionBuilder) : WorkersCompLineBuilder {
    addAdditiveArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("JURISDICTIONS"), jurisdiction)
    return this
  }

  function withRRP(rrpBuilder : RRPBuilder) : WorkersCompLineBuilder {
    set( WorkersCompLine.Type.TypeInfo.getProperty("RetrospectiveRatingPlan"), rrpBuilder )
    return this
  }    
  
  function withManuscriptDesc(desc : String) : WorkersCompLineBuilder {
    set( WorkersCompLine.Type.TypeInfo.getProperty("ManuscriptOptionDesc"), desc )
    return this
  }  
    
  function withManuscriptPremium(premium : MonetaryAmount) : WorkersCompLineBuilder {
    set( WorkersCompLine.Type.TypeInfo.getProperty("ManuscriptPremium"), premium )
    return this
  }  
  
  function withParticipatingPlan(planBuilder : ParticipatingPlanBuilder) : WorkersCompLineBuilder {
    set( WorkersCompLine.Type.TypeInfo.getProperty("ParticipatingPlan"), planBuilder )
    return this
  }

  function withPolicyOwnerOfficer(ownerOfficer : PolicyOwnerOfficerBuilder) : WorkersCompLineBuilder {
    addPopulator(new BuilderArrayPopulator(WorkersCompLine.Type.TypeInfo.getProperty("PolicyOwnerOfficers") as IArrayPropertyInfo, ownerOfficer))
    return this
  }

  function withPolicyLaborClient(policyLaborClient : PolicyLaborClientBuilder) : WorkersCompLineBuilder {
    addPopulator(new BuilderArrayPopulator(WorkersCompLine.Type.TypeInfo.getProperty("PolicyLaborClients") as IArrayPropertyInfo, policyLaborClient))
    return this
  }

  function withPolicyLaborContractor(policyLaborContractor : PolicyLaborContractorBuilder) : WorkersCompLineBuilder {
    addPopulator(new BuilderArrayPopulator(WorkersCompLine.Type.TypeInfo.getProperty("PolicyLaborContractors") as IArrayPropertyInfo, policyLaborContractor))
    return this
  }
  
  function withExcludedWorkplace(excludedWorkplace : WCExcludedWorkplaceBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCExcludedWorkplaces"), excludedWorkplace)
    return this
  }  
  
  function withWaiverOfSubro(waiver : WCWaiverOfSubroBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCWaiverOfSubros"), waiver)
    return this
  }  
  
  function withAircraftSeat(seat : WCAircraftSeatBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("WCAircraftSeats"), seat)
    return this
  }
  
  function withInclusionPerson(inclusionPerson : InclusionPersonBuilder) : WorkersCompLineBuilder {
    addArrayElement(WorkersCompLine.Type.TypeInfo.getProperty("InclusionPersons"), inclusionPerson)
    return this
  }

  function withCurrency(currency : Currency) : WorkersCompLineBuilder {
    set(WorkersCompLine#PreferredCoverageCurrency, currency)
    return this
  }

  public static function createAllJurisdictions(policyPeriod: PolicyPeriod) {
    var line = policyPeriod.WorkersCompLine
    policyPeriod.LocationStates.each( \state -> line.addJurisdiction(state ))
  }
}
