package gw.plugin.policyperiod.impl

uses gw.plugin.policyperiod.IEffectiveTimePlugin

uses java.util.Date


@Export
class EffectiveTimePlugin implements IEffectiveTimePlugin {

  /**
   * Default date/time string for times - 1 minute into the Java epoch
   * (1970-01-01) per default Locale and TimeZone.
   */
  public static final var DEFAULT_TIME_STRING : String = "1970-01-01 00:01:00"

  override function getSubmissionEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : Submission) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  override function getSubmissionExpirationTime(effectiveDateTime : Date, expirationDate : Date, period : PolicyPeriod, job : Submission) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  override function getPolicyChangeEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : PolicyChange) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  override function getCancellationEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : Cancellation, refundCalcMethod: CalculationMethod) : Date {
    if (refundCalcMethod == "Flat" or job.CancelReasonCode == "FlatRewrite" or period.Policy.IssueDate == null) {
      return period.PeriodStart
    } else {
      return timeAsDate(DEFAULT_TIME_STRING)
    }
  }

  override function getReinstatementEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : Reinstatement) : Date {
    if (period.CancellationDate != null) {
      return period.CancellationDate
    } else {
      // Should never get here
      return timeAsDate(DEFAULT_TIME_STRING)
    }
  }

  override function getReinstatementExpirationTime(effectiveDateTime : Date, expirationDate : Date, period : PolicyPeriod, job : Reinstatement) : Date {
    return period.PeriodEnd
  }

  override function getRewriteEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : Rewrite) : Date {
    if (period.CancellationDate != null) {
      return period.CancellationDate
    } else {
      // Should never get here
      return timeAsDate(DEFAULT_TIME_STRING)
    }
  }

  override function getRewriteExpirationTime(effectiveDateTime : Date, expirationDate : Date, period : PolicyPeriod, job : Rewrite) : Date {
    if (job.RewriteType == "RewriteNewTerm") {
      return timeAsDate(DEFAULT_TIME_STRING)
    } else {
      // period.Rewrite.RewriteType == RewriteFullTerm or period.Rewrite.RewriteType == RewriteRemainderOfTerm
      return period.PeriodEnd
    }
  }

  override function getRewriteNewAccountEffectiveTime(effectiveDate : Date, period : PolicyPeriod, job : RewriteNewAccount) : Date {
    if (period.CancellationDate != null) {
      return period.CancellationDate
    } else {
      // Should never get here
      return timeAsDate(DEFAULT_TIME_STRING)
    }
  }

  override function getRewriteNewAccountExpirationTime(effectiveDateTime : Date, expirationDate : Date, period : PolicyPeriod, job : RewriteNewAccount) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  override function getRenewalEffectiveTime(effectiveDate : Date, inForcePeriod : PolicyPeriod, job : Renewal) : Date {
    return inForcePeriod.PeriodEnd
  }

  override function getRenewalExpirationTime(effectiveDateTime : Date, expirationDate : Date, inForcePeriod : PolicyPeriod, job : Renewal) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  private function timeAsDate(time : String) : Date {
    return time as Date
  }

  override function getConversionRenewalEffectiveTime(effectiveDate : Date, period : PolicyPeriod) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }

  override function getConversionRenewalExpirationTime(effectiveDateTime : Date, expirationDate : Date, period : PolicyPeriod) : Date {
    return timeAsDate(DEFAULT_TIME_STRING)
  }
}