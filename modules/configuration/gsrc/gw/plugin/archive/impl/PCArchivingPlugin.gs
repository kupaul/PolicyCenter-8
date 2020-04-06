package gw.plugin.archive.impl

uses gw.api.util.DateUtil
uses gw.plugin.archive.IPCArchivingPlugin
uses java.util.Date
uses gw.plugin.Plugins
uses gw.plugin.claimsearch.IClaimSearchPlugin
uses gw.losshistory.ClaimSearchCriteria
uses gw.api.system.PCConfigParameters
uses gw.api.archive.PCArchivingUtil
uses gw.plugin.claimsearch.NoResultsClaimSearchException


@Export
class PCArchivingPlugin implements IPCArchivingPlugin {
  private static final var _defaultRecheckDelay = PCConfigParameters.ArchiveDefaultRecheckDays.getValue()

  /**
   * This methods looks at the passed <code>PolicyTerm</code> and decides on which date it should be archived.
   *
   * @param policyTerm The PolicyTerm to inspect.
   * @return the non-null date on which to archive the passed PolicyTerm, trimmed to midnight.
   */
  override function getArchiveDate(policyTerm : PolicyTerm) : Date {
    var today = DateUtil.currentDate().trimToMidnight()

    // Check for open claims.
    var openClaimDate = calculateOpenClaimDate(today, policyTerm)

    // Get the maximum date of all the above dates and today.
    return PCArchivingUtil.getLatestDate({openClaimDate, today})
  }

  private function calculateOpenClaimDate(today : Date, policyTerm : PolicyTerm) : Date {
    // Construct a ClaimSearchCriteria object that will filter to open claims associated with the passed PolicyTerm.

    // Filter down to the PeriodStart and PeriodEnd of the PolicyTerm.
    var dateCriteria = new DateCriteria()
    var recentBoundPeriods = policyTerm.Periods.where(\ period -> period.MostRecentModel)
    if (not recentBoundPeriods.HasElements) {
      return null
    }
    var inForcePeriod = recentBoundPeriods.single()
    dateCriteria.StartDate = inForcePeriod.PeriodStart
    dateCriteria.EndDate = inForcePeriod.PeriodEnd

    // Filter down to claims associated with the same PolicyNumber as the term and the same date range.
    var claimSearchCriteria = new ClaimSearchCriteria()
    claimSearchCriteria.PolicyNumber = policyTerm.PolicyNumber
    claimSearchCriteria.DateCriteria = dateCriteria

    // Perform the plugin call and then filter the results down to open claims.
    var claimSearchPlugin = Plugins.get(IClaimSearchPlugin)
    var claims : ClaimSet
    try{
      claims = claimSearchPlugin.searchForClaims(claimSearchCriteria)
    } catch (e : NoResultsClaimSearchException) {
      // No existing claims, so go ahead and archive.
      return null
    }
    var openClaims = claims.Claims.where(\ claim -> claim.Status == "Open")

    if (openClaims.IsEmpty) {
      // If no open claims exist, we return null to say this date shouldn't be used in the calculation.
      return null
    } else {
      // If any open claims exist, delay ArchiveDefaultRecheckDays (defaults to 30 days) from today.
      return DateUtil.addDays(today, _defaultRecheckDelay)
    }
  }
}