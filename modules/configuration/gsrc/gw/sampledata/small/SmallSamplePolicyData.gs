package gw.sampledata.small

uses gw.sampledata.AbstractSampleDataCollection
uses gw.sampledata.SampleDataConstants
uses gw.api.builder.*

/**
 * A small set of Policies, really just enough for every line of business and a couple kinds of job
 * (but not the cross-product of the two).
 */
@Export
class SmallSamplePolicyData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Small Policies"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return jobLoaded("47586734721")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    var period : PolicyPeriod
    runBlockAsUser( "aapplegate", "SmallSamplePolicyData -- aapplegate", \ -> {
      // SIMPLE SUBMISSIONS    
      period = loadSubmission("47586734721", "C000143542", "PersonalAuto", SampleDataConstants.getBaseDateMinus(30), new String[0], true)

      loadSubmission("47586734722", "C000456352", "BusinessOwners", SampleDataConstants.getBaseDateMinus(275), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      loadSubmission("453453462", "C000456354", "PersonalAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), new String[0], true)
  
      // JOB CHAINS
      loadSubmission("SUB00000001", "C000212105", "WorkersComp", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "PolicyChange PC0000012", \ bundle -> {
        new PolicyChangeBuilder().withJobNumber("PC0000012").withBasedOnPeriod(findPeriodByJobNumber("SUB00000001", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Renewal RNW0000324", \bundle -> {
        new RenewalBuilder().withJobNumber("RNW0000324").withBasedOnPeriod(findPeriodByJobNumber("PC0000012", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Cancellation CAN0000012", \bundle -> {
        new CancellationBuilder().withJobNumber("CAN0000012").withBasedOnPeriod(findPeriodByJobNumber("RNW0000324", bundle)).canceledByCarrier().withFlatRefund().create(bundle)
      })
      runTransactionAsUser(null, "Reinstatement RST0000324", \bundle -> {
        new ReinstatementBuilder().withJobNumber("RST0000324").withBasedOnPeriod(findPeriodByJobNumber("CAN0000012", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Renewal RNW0000325", \bundle -> {
        new RenewalBuilder().withJobNumber("RNW0000325").withBasedOnPeriod(findPeriodByJobNumber("RST0000324", bundle)).create(bundle)
      })
    })

    runBlockAsUser( "bbaker", "SmallSamplePolicyData -- bbaker", \ -> {
      loadSubmission("SUB00000002", "C000212105", "BusinessOwners", SampleDataConstants.getBaseDateMinus(1, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "PolicyChange 43534634", \bundle -> {
        new PolicyChangeBuilder().withJobNumber("43534634").withBasedOnPeriod(findPeriodByJobNumber("SUB00000002", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Cancellation 34534235", \bundle -> {
        var basedOnPeriod = findPeriodByJobNumber("43534634", bundle)
        new CancellationBuilder().withJobNumber("34534235").withBasedOnPeriod(basedOnPeriod).withEffectiveDate(basedOnPeriod.PeriodStart.addMonths(1)).canceledByCarrier().canceledForNonpayment().withProrataRefund().create(bundle)
      })
      runTransactionAsUser(null, "Reinstatement 24534566", \bundle -> {
        new ReinstatementBuilder().withJobNumber("24534566").withBasedOnPeriod(findPeriodByJobNumber("34534235", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Renewal 2234534", \bundle -> {
        new RenewalBuilder().withJobNumber("2234534").withBasedOnPeriod(findPeriodByJobNumber("24534566", bundle)).create(bundle)
      })
    })

    // ACTIVITIES - back to su 

    loadJobActivity("SUB00000001", "Review Submission", "aapplegate")
    loadPolicyActivity(period.PolicyNumber, "Review Risk Information", "aapplegate")
  }

}
