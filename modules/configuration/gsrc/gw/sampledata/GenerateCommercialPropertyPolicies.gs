package gw.sampledata
uses gw.lang.Export
uses typekey.CPCauseOfLoss
uses entity.CPBuildingCov
uses java.lang.String
uses typekey.PrimaryPhoneType
uses entity.Account
uses typekey.GeocodeStatus
uses entity.PolicyPeriod
uses java.util.Date
uses gw.api.builder.AddressBuilder
uses gw.api.builder.PersonBuilder
uses gw.api.builder.AccountContactBuilder
uses gw.api.builder.PolicyPriNamedInsuredBuilder
uses gw.api.builder.NamedInsuredBuilder
uses gw.api.builder.AccountLocationBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.databuilder.cp.CPLocationBuilder
uses gw.api.builder.AccountBuilder
uses gw.api.databuilder.cp.CommercialPropertyLineBuilder
uses gw.api.databuilder.cp.CPSubmissionBuilder
uses java.lang.Math
uses gw.api.builder.PolicyChangeBuilder
uses gw.transaction.Transaction
uses gw.pl.persistence.core.Bundle
uses gw.api.databuilder.cp.CPBuildingBuilder
uses gw.api.builder.CoverageBuilder
uses gw.sample.heatmap.SampleCatastropheSearch
uses java.util.ArrayList
uses gw.api.database.spatial.SpatialPoint

@Export
class GenerateCommercialPropertyPolicies  {

  
  private function convertCoordinate(coordinate : double) : double {
    return Math.round((coordinate) * 100000) / 100000.
  }

  // parameters
  final var effectiveDate = Date.Today.addMonths(-1)
  final static var ACCOUNT_PREFIX = "ACC" 
  final static var STARTING_ACCOUNT = 1000
  final static var POLICY_SUFFIX = "-01"
  final static var MAX_NUMBER_POLICIES = 999
  final var amounts = { 250000, 250000, 500000, 500000, 650000, 650000, 800000, 1000000, 1200000, 1550000 }
  
  // generate at most MAX_NUMBER_POLICIES commercial policies with consecutive policy numbers.
  // This data is used to demonstrate showing policy locations in the Claim Center catastrophe map.
  public function create() {
    var addresses = SampleCatastropheSearch.Addresses
    var insureds = SampleCatastropheSearch.Insureds
    var startingPolicyNumber = SampleCatastropheSearch.StartingPolicyNumber
    
    for (policyCounter in 0..|Math.min(MAX_NUMBER_POLICIES, addresses.Count)) {
      var address = addresses[policyCounter]
      var insured = insureds[policyCounter % insureds.Count]
      var policyNumber = ((startingPolicyNumber + policyCounter) as String) + POLICY_SUFFIX

      var policyPeriod : PolicyPeriod
      Transaction.runWithNewBundle(\ bundle -> {
        var amount = amounts[policyCounter % amounts.Count]
        policyPeriod = createCPPolicy(bundle, policyCounter, address, insured, amount)
      })
      
      Transaction.runWithNewBundle(\ bundle -> {
        var changed = new PolicyChangeBuilder()
                        .withBasedOnPeriod(policyPeriod)
                        .withPolicyNumber(policyNumber)
                        .create(bundle)
      }) 
      print("${Date.CurrentDate}  Created ${policyNumber} for ${insured[0]} ${insured[1]} # ${policyCounter}")
      policyCounter++
    }
  }
 
  
  function createCPPolicy(bundle : Bundle, policyCtr : int, address : ArrayList<String>, insured : ArrayList<String>, covAmount : int) : PolicyPeriod {
    var latitude = convertCoordinate(address[6] as double)
    var longitude = convertCoordinate(address[7] as double)
    
    var location1 =  new AccountLocationBuilder()
                        .withAddressLine1(address[0])
                        .withAddressLine2(null)
                        .withAddressLine3(null)
                        .withCity(address[1])
                        .withCounty(null)
                        .withState(address[2])
                        .withPostalCode(address[3])
                        .withSpatialPoint(new SpatialPoint(longitude, latitude))
                        .withGeocodeStatus(GeocodeStatus.TC_EXACT)
                        .withDescription("location1")
                        .withLocationNumber(1)

    var pniAddr = new AddressBuilder()  // this shows up on the "Contacts" panel
                        .withAddressLine1(address[0])
                        .withAddressLine2(null)
                        .withAddressLine3(null)
                        .withCity(address[1])
                        .withCounty(null)
                        .withState(address[2])
                        .withPostalCode(address[3])
                        .withSpatialPoint(new SpatialPoint(longitude, latitude))
                        .withGeocodeStatus(GeocodeStatus.TC_EXACT)
                        .withDescription("PNI address")
    
    var contactBldr = new PersonBuilder(2) 
      .withPrimaryAddress(pniAddr)
      .withName(insured[0], insured[1])
      .withPrimaryPhone(PrimaryPhoneType.TC_WORK)
      .withEmailAddress1((insured[0][0] + insured[1] + "@gmail.com").toLowerCase())

      // ensure uniqueness for contact manager
      .withWorkPhone("650-867-" + (5309 + policyCtr))
      .withCellPhone("415-652-" + (3080 + policyCtr))
      .withDateOfBirth(Date.createDateInstance(11, 16, 1981).addDays(policyCtr))
      .clearOfficialIDs()
      .withOfficialID(OfficialIDType.TC_SSN, "989-32-" + (1200 + policyCtr))
      .withLicenseNumber("N996" + (3179 + policyCtr))
    var namedInsuredBldr = new NamedInsuredBuilder()
    var accountContactBldr = new AccountContactBuilder().withRole(namedInsuredBldr).withContact(contactBldr)

    var accountNumber = ACCOUNT_PREFIX + (STARTING_ACCOUNT + policyCtr)
    
    var account = new AccountBuilder()
      .withAccountLocation(location1)
      .withAccountContact(accountContactBldr)  
      .withAccountNumber(accountNumber)
      .create(bundle)

    var primaryNamedInsured = new PolicyPriNamedInsuredBuilder().withAccountContactRole(namedInsuredBldr)


    var cpBldg = new CPBuildingBuilder()
            .withCoverage(new CoverageBuilder(CPBuildingCov)
              .withPatternCode("CPBldgCov")
              .withTypekeyCovTerm("CPBldgCovCauseOfLoss", typekey.CPCauseOfLoss.TC_BASIC)
              .withDirectTerm("CPBldgCovLimit", covAmount))
           
    var policyLocationBuilder = new PolicyLocationBuilder()
      .withAccountLocation(location1)

    var cpLocationBuilder = new CPLocationBuilder()
      .withLocation(policyLocationBuilder)
      .withBuilding(cpBldg)

    var cpLineBuilder = new CommercialPropertyLineBuilder()
      .withCPLocation(cpLocationBuilder)

    var period = new CPSubmissionBuilder()
      .withProduct("CommercialProperty")
      .isBound() 
      .withAccount(account)
      .withPrimaryPolicyLocation(policyLocationBuilder)
      .withPolicyLine(cpLineBuilder)
      .withEffectiveDate(effectiveDate)
      .withPrimaryNamedInsured(primaryNamedInsured) 
      .create(bundle)
    return period
  }

}