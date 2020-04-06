package gw.sampledata.monolinejobstatus
uses gw.sampledata.AbstractSampleDataCollection
uses java.util.Stack
uses gw.api.system.PCLoggerCategory
uses gw.api.builder.SubmissionBuilderBase
uses gw.api.builder.SubmissionStatus
uses gw.api.builder.CancellationStatus
uses gw.api.builder.CancellationBuilder
uses gw.api.builder.IssuanceStatus
uses gw.api.builder.IssuanceBuilder
uses gw.api.builder.PolicyChangeStatus
uses gw.api.builder.ReinstatementStatus
uses gw.api.builder.RenewalStatus
uses gw.api.builder.RewriteStatus
uses gw.api.builder.RewriteNewAccountStatus
uses gw.api.builder.PolicyChangeBuilder
uses gw.api.builder.ReinstatementBuilder
uses gw.api.builder.RenewalBuilder
uses gw.api.builder.RewriteBuilder
uses gw.api.builder.RewriteNewAccountBuilder
uses gw.pl.persistence.core.Bundle

/**
 * d
 */
@Export
class ProductXJobStatusPolicyData extends AbstractSampleDataCollection {

  static final var CANCELLATIONS_MAKER = new JobsMaker<CancellationStatus>() {
    override property get JobStatuses() : CancellationStatus[] { return CancellationStatus.values() }
    override property get JobType() : Type<Job> { return Cancellation }

    override function makeJobChain(productType : Type, status : CancellationStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var basedOn = makeBasedOnSubmission(bundle, productType)
          logJobTypeAndRun( \ -> {
              new CancellationBuilder(basedOn)
                  .withProrataRefund()
                  .withEffectiveDate(basedOn.PeriodStart.addMonths(2))
                  .withStatus(status).create(bundle)
          })
      })
    }
  }

  static final var ISSUANCES_MAKER = new JobsMaker<IssuanceStatus>() {
    override property get JobStatuses() : IssuanceStatus[] { return IssuanceStatus.values() }
    override property get JobType() : Type<Job> { return Issuance }

    override function getConfiguredSubmissionBuilder(productType : Type) : SubmissionBuilderBase {
      return super.getConfiguredSubmissionBuilder(productType).doNotIssuePolicy()
    }

    override function makeJobChain(productType : Type, status : IssuanceStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var basedOn = makeBasedOnSubmission(bundle, productType)
          logJobTypeAndRun( \ -> { new IssuanceBuilder(basedOn).withStatus(status).create(bundle) })
      })
    }
  }

  static final var POLICY_CHANGES_MAKER = new JobsMaker<PolicyChangeStatus>() {
    override property get JobStatuses() : PolicyChangeStatus[] { return PolicyChangeStatus.values() }
    override property get JobType() : Type<Job> { return PolicyChange }

    override function makeJobChain(productType : Type, status : PolicyChangeStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var basedOn = makeBasedOnSubmission(bundle, productType)
          logJobTypeAndRun( \ -> {
              new PolicyChangeBuilder(basedOn)
                  .withEffectiveDate(basedOn.PeriodStart.addMonths(2))
                  .withStatus(status)
                  .create(bundle)
          })
      })
    }
  }

  static final var REINSTATEMENTS_MAKER = new JobsMaker<ReinstatementStatus>() {
    override property get JobStatuses() : ReinstatementStatus[] { return ReinstatementStatus.values() }
    override property get JobType() : Type<Job> { return Reinstatement }

    override function makeJobChain(productType : Type, status : ReinstatementStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var submissionPeriod = makeBasedOnSubmission(bundle, productType)
          var basedOn : PolicyPeriod
          logInfoAndRun("Based-on Cancellation", \ -> { basedOn = new CancellationBuilder(submissionPeriod).create(bundle) })
          logJobTypeAndRun( \ -> { new ReinstatementBuilder(basedOn).withStatus(status).create(bundle) })
      })
    }
  }

  static final var RENEWALS_MAKER = new JobsMaker<RenewalStatus>() {
    override property get JobStatuses() : RenewalStatus[] { return RenewalStatus.values() }
    override property get JobType() : Type<Job> { return Renewal }

    override function makeJobChain(productType : Type, status : RenewalStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var basedOn = makeBasedOnSubmission(bundle, productType)
          logJobTypeAndRun( \ -> { new RenewalBuilder(basedOn).withStatus(status).create(bundle) })
      })
    }
  }

  static final var REWRITES_MAKER = new JobsMaker<RewriteStatus>() {
    override property get JobStatuses() : RewriteStatus[] { return RewriteStatus.values() }
    override property get JobType() : Type<Job> { return Rewrite }

    override function makeJobChain(productType : Type, status : RewriteStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var submissionPeriod = makeBasedOnSubmission(bundle, productType)
          var basedOn : PolicyPeriod
          logInfoAndRun("Based-on Cancellation", \ -> { basedOn = new CancellationBuilder(submissionPeriod).create(bundle) })
          logJobTypeAndRun( \ -> { new RewriteBuilder(basedOn).withStatus(status).create(bundle) })
      })
    }
  }

  static final var REWRITE_NEW_ACCOUNTS_MAKER = new JobsMaker<RewriteNewAccountStatus>() {
    override property get JobStatuses() : RewriteNewAccountStatus[] { return RewriteNewAccountStatus.values() }
    override property get JobType() : Type<Job> { return RewriteNewAccount }

    override function makeJobChain(productType : Type, status : RewriteNewAccountStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          var submissionPeriod = makeBasedOnSubmission(bundle, productType)
          var basedOn : PolicyPeriod
          logInfoAndRun("Based-on Cancellation", \ -> { basedOn = new CancellationBuilder(submissionPeriod).create(bundle) })
          logJobTypeAndRun( \ -> { new RewriteNewAccountBuilder(basedOn).withStatus(status).create(bundle) })
      })
    }
  }

  static final var SUBMISSIONS_MAKER = new JobsMaker<SubmissionStatus>() {
    override property get JobStatuses() : SubmissionStatus[] { return SubmissionStatus.values() }
    override property get JobType() : Type<Job> { return Submission }

    override function makeJobChain(productType : Type, status : SubmissionStatus) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          logJobTypeAndRun( \ -> { makeSubmission(bundle, productType) })
      })
    }
  }

  construct() {}

  override property get CollectionName() : String {
    return "Product x Job Status Policies"
  }

  override property get AlreadyLoaded() : boolean {
    return false  // can load multiple times
  }

  override function load() {
    CANCELLATIONS_MAKER.make()
    ISSUANCES_MAKER.make()
    POLICY_CHANGES_MAKER.make()
    REINSTATEMENTS_MAKER.make()
    RENEWALS_MAKER.make()
    REWRITES_MAKER.make()
    REWRITE_NEW_ACCOUNTS_MAKER.make()
    SUBMISSIONS_MAKER.make()
  }

  private abstract static class JobsMaker<S> {
    static final var PRODUCT_TYPES : List<Type> = {
          productmodel.BusinessAuto,
          productmodel.BusinessOwners,
          productmodel.CommercialPackage,
          productmodel.CommercialProperty,
          productmodel.GeneralLiability,
          productmodel.InlandMarine,
          productmodel.PersonalAuto,
          productmodel.WorkersComp
    }

    var _logInfoStack = new Stack<String>()

    function makeBasedOnSubmission(bundle : Bundle, productType : Type) : PolicyPeriod {
      var period : PolicyPeriod
      logInfoAndRun("Based-on Submission", \ -> { period = makeSubmission(bundle, productType) })
      return period
    }

    function makeSubmission(bundle : Bundle, productType : Type) : PolicyPeriod {
      return getConfiguredSubmissionBuilder(productType).create(bundle)
    }

    function getConfiguredSubmissionBuilder(productType : Type) : SubmissionBuilderBase {
      return SubmissionBuilderFactory.INSTANCE.get(productType).withEffectiveDate(DateTime.Today.addMonths(-4))
    }

    abstract property get JobStatuses() : S[]

    abstract property get JobType() : Type<Job>

    function make() {
      for (productType in PRODUCT_TYPES) {
        for (status in JobStatuses) {
          logInfoAndRun("${status} ${productType.RelativeName} ${JobType.RelativeName}", \ -> makeJobChain(productType, status))
        }
      }
    }

    abstract function makeJobChain(productType : Type, status : S)

    function logJobTypeAndRun(code()) {
      logInfoAndRun(JobType.RelativeName, code)
    }

    function logInfoAndRun(logInfo : String, code()) {
      _logInfoStack.push(logInfo)
      try {
        PCLoggerCategory.SAMPLE_DATA.info(_logInfoStack.join(": "))
        code()
      } finally {
        _logInfoStack.pop()
      }
    }
  }

}
