package gw.sampledata.large

uses gw.sampledata.AbstractSampleDataCollection
uses gw.sampledata.SampleDataConstants
uses gw.transaction.Transaction
uses gw.api.builder.PolicyChangeBuilder
uses gw.api.builder.RenewalBuilder
uses gw.api.builder.CancellationBuilder
uses gw.api.builder.ReinstatementBuilder

/**
 * A much fuller set of sample Jobs and Policies.
 */
@Export
class LargeSamplePolicyData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Large Policies"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return jobLoaded("85746564938")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    
    // SIMPLE SUBMISSIONS
    runBlockAsUser("ccraft", "LargeSamplePolicyData -- ccraft", \->{
      loadSubmission("85746564938", "S000212121", "BusinessOwners", SampleDataConstants.getBaseDateMinus(265), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      loadSubmission("456783759", "C000148456", "PersonalAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), new String[0], true)
    
    // JOB CHAINS
      loadSubmission("85746534578", "C000212105", "BusinessAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "PolicyChange 556345345", \bundle -> {
        new PolicyChangeBuilder().withJobNumber("556345345").withBasedOnPeriod(findPeriodByJobNumber("85746534578", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Cancellation 2345456334", \bundle -> {
        var basedOnPeriod = findPeriodByJobNumber("556345345", bundle)
        new CancellationBuilder().withJobNumber("2345456334").withBasedOnPeriod(basedOnPeriod).withEffectiveDate(basedOnPeriod.PeriodStart.addMonths(1)).canceledByCarrier().canceledForNonpayment().withProrataRefund().create(bundle)
      })
      runTransactionAsUser(null, "Reinstatement 344525456", \bundle -> {
        new ReinstatementBuilder().withJobNumber("344525456").withBasedOnPeriod(findPeriodByJobNumber("2345456334", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Renewal 346634523", \bundle -> {
        new RenewalBuilder().withJobNumber("346634523").withBasedOnPeriod(findPeriodByJobNumber("344525456", bundle)).create(bundle)
      })

//    runTransactionAsUser(null, "PolicyChange 256546345", \bundle -> {
//      new PolicyChangeBuilder().withJobNumber("256546345").withBasedOnPeriod(findPeriodByJobNumber("85746385638", bundle)).create(bundle)
//    })
//    runTransactionAsUser(null, "Cancellation 356452545", \bundle -> {
//      new CancellationBuilder().withJobNumber("356452545").withBasedOnPeriod(findPeriodByJobNumber("256546345", bundle)).canceledByCarrier().withProrataRefund().create(bundle)
//    })
//    runTransactionAsUser(null, "Reinstatement 3464256543", \bundle -> {
//      new ReinstatementBuilder().withJobNumber("3464256543").withBasedOnPeriod(findPeriodByJobNumber("356452545", bundle)).create(bundle)
//    })
//    runTransactionAsUser(null, "Renewal 436643345", \bundle -> {
//      new RenewalBuilder().withJobNumber("436643345").withBasedOnPeriod(findPeriodByJobNumber("3464256543", bundle)).create(bundle)
//    })
//
      runTransactionAsUser(null, "Renewal 643467744", \bundle -> {
        new RenewalBuilder().withJobNumber("643467744").withBasedOnPeriod(findPeriodByJobNumber("456783759", bundle)).create(bundle)
      })

      //a couple of open submissions
      loadSubmission("377653123", "A000377655", "BusinessOwners", SampleDataConstants.getBaseDateMinus(24), SampleDataConstants.ACCOUNT_COMPANY_NAMES, false)
      loadSubmission("377653224", "A000377766", "PersonalAuto", SampleDataConstants.getBaseDateMinus(18), new String[0], false)
      loadSubmission("377653125", "A000377655", "BusinessOwners", SampleDataConstants.getBaseDateMinus(24), SampleDataConstants.ACCOUNT_COMPANY_NAMES, false)
      loadSubmission("377653227", "A000377766", "PersonalAuto", SampleDataConstants.getBaseDateMinus(18), new String[0], false)

      //these submissions allow us to have an open renewal/policy change
      loadSubmission("467653123", "B000467655", "BusinessOwners", SampleDataConstants.getBaseDateMinus(24), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      loadSubmission("457653224", "B000457766", "PersonalAuto", SampleDataConstants.getBaseDateMinus(18), new String[0], true)
      runTransactionAsUser(null, "PolicyChange 378653123", \bundle -> {
        new PolicyChangeBuilder().withJobNumber("378653123").withBasedOnPeriod(findPeriodByJobNumber("467653123", bundle)).isDraft().create(bundle)
      })
      runTransactionAsUser(null, "Renewal 568653224", \bundle -> {
        new RenewalBuilder().withJobNumber("568653224").withBasedOnPeriod(findPeriodByJobNumber("457653224", bundle)).isDraft().create(bundle)
      })

    })
      
    runBlockAsUser("aapplegate", "LargeSamplePolicyData -- aapplegate", \->{
      loadSubmission("643467745", "C000456353", "PersonalAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), new String[0], true)
      runTransactionAsUser(null, "Cancellation 643467746", \bundle -> {
        var basedOnPeriod = findPeriodByJobNumber("643467745", bundle)
        new CancellationBuilder().withJobNumber("643467746").withBasedOnPeriod(basedOnPeriod).withEffectiveDate(basedOnPeriod.PeriodStart.addMonths(1)).canceledByCarrier().canceledForNonpayment().withProrataRefund().create(bundle)
      })
      runTransactionAsUser(null, "Reinstatement 643467748", \bundle -> {
        new ReinstatementBuilder().withJobNumber("643467748").withBasedOnPeriod(findPeriodByJobNumber("643467746", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Cancellation 643467747", \bundle -> {
        var basedOnPeriod = findPeriodByJobNumber("643467748", bundle)
        new CancellationBuilder().withJobNumber("643467747").withBasedOnPeriod(basedOnPeriod).withEffectiveDate(basedOnPeriod.PeriodStart.addMonths(1)).canceledByCarrier().canceledForNonpayment().withProrataRefund().create(bundle)
      })

      loadSubmission("456783911", "C000478567", "WorkersComp", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "Renewal 643467861", \bundle -> {
        new RenewalBuilder().withJobNumber("643467861").withBasedOnPeriod(findPeriodByJobNumber("456783911", bundle)).create(bundle)
      })

      loadSubmission("456783912", "C000478567", "BusinessAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)  
      runTransactionAsUser(null, "Renewal 643467862", \bundle -> {
        new RenewalBuilder().withJobNumber("643467862").withBasedOnPeriod(findPeriodByJobNumber("456783912", bundle)).create(bundle)
      })

      loadSubmission("456783913", "C000478567", "BusinessOwners", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "Renewal 643467863", \bundle -> {
        new RenewalBuilder().withJobNumber("643467863").withBasedOnPeriod(findPeriodByJobNumber("456783913", bundle)).create(bundle)
      })

      loadSubmission("643467914", "C000478975", "WorkersComp", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "Renewal 643467864", \bundle -> {
        new RenewalBuilder().withJobNumber("643467864").withBasedOnPeriod(findPeriodByJobNumber("643467914", bundle)).create(bundle)
      })

      loadSubmission("643467915", "C000478975", "BusinessAuto", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)     
      runTransactionAsUser(null, "Renewal 643467865", \bundle -> {
        new RenewalBuilder().withJobNumber("643467865").withBasedOnPeriod(findPeriodByJobNumber("643467915", bundle)).create(bundle)
      })
    })
      
    runBlockAsUser("bbaker", "LargeSamplePolicyData -- bbaker", \->{
      loadSubmission("643467916", "C000478975", "BusinessOwners", SampleDataConstants.getBaseDateMinus(2, 0, 90), SampleDataConstants.ACCOUNT_COMPANY_NAMES, true)
      runTransactionAsUser(null, "Renewal 643467866", \bundle -> {
        new RenewalBuilder().withJobNumber("643467866").withBasedOnPeriod(findPeriodByJobNumber("643467916", bundle)).create(bundle)
      })
      runTransactionAsUser(null, "Cancellation 643467917", \bundle -> {
        var basedOnPeriod = findPeriodByJobNumber("643467866", bundle)
        new CancellationBuilder().withJobNumber("643467917").withBasedOnPeriod(basedOnPeriod).withEffectiveDate(basedOnPeriod.PeriodStart.addMonths(1)).canceledByCarrier().canceledForNonpayment().withProrataRefund().create(bundle)
      })
    })
    
    // ACTIVITIES as SU
    loadJobActivity("SUB00000002", "Review Submission", "aapplegate")
    loadJobActivity("643467864", "Review renewal policy UW issues", "aapplegate")
  }
    
}
