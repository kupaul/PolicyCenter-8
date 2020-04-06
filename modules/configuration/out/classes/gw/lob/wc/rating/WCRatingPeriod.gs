package gw.lob.wc.rating
uses java.math.BigDecimal
uses entity.windowed.WCJurisdictionCostVersionList
uses java.util.ArrayList
uses java.util.Set
uses gw.financials.Prorater
uses gw.pl.currency.MonetaryAmount
uses gw.financials.PolicyPeriodFXRateCache

/**
 * Container for information about a rating period.
 */

@Export
class WCRatingPeriod
{
  /**
   * owning jurisdiction
   */
  var _juris : WCJurisdiction as readonly Jurisdiction

  /**
   * period start
   */
  var _start : DateTime as readonly Start

/**
 * period end
 */
  var _end   : DateTime as readonly End

  /**
   * number of days in [Start-End)
   */
  var _numDays : int as NumDays

  /**
   * date at which to look up rates
   */
  var _ratingDate : DateTime as readonly RatingDate

  /**
   * period start accounting for audit
   */
  var _ratingStart : DateTime as readonly RatingStart

  /**
   * period end accounting for audit and cancellation
   */
  var _ratingEnd   : DateTime as readonly RatingEnd

  /**
   * number of days in [RatingStart-RatingEnd)
   */
  var _numRatingDays : int as readonly NumRatingDays

  /**
   * period number
   */
  var _ratingPeriodNumber : int as readonly Number
  
  construct( jurisArg : WCJurisdiction, startArg : DateTime, endArg : DateTime, _number : int)
  {
    var prorater = Prorater.forFinancialDays(TC_PRORATABYDAYS)

    _juris = jurisArg
    _start = startArg
    _end   = endArg
    _ratingPeriodNumber = _number
    _numDays = prorater.financialDaysBetween(Start, End)

    _ratingDate = Jurisdiction.getPriorRatingDate( Start )

    _ratingStart = calculateRatingStart()
    _ratingEnd   = calculateRatingEnd()
    _numRatingDays = RatingStart > RatingEnd ? 0 : prorater.financialDaysBetween(RatingStart, RatingEnd)
  }
  
  /**
   * Returns the start date of this period for rating purposes.
   * This will be the later of the period's start date and the audit window start date, if any.
   * Note that the StartDateForRating might end up being after the EndDateForRating.
   *
   * @return {@link java.util.Formatter.DateTime) a date that represents the starting date for this rating period
   */
  private function calculateRatingStart() : DateTime
  {
    var effDate = Start
    if ( Jurisdiction.Branch.Audit.AuditInformation.AuditPeriodStartDate > effDate )
    {
      effDate = Jurisdiction.Branch.Audit.AuditInformation.AuditPeriodStartDate
    }
    return effDate
  }
  
  /**
   * Returns the end date of this period for rating purposes.
   * This will return the earlier of the period's end date, the audit window end date, and
   * the cancellation date, if any.
   * Note that the EndDateForRating might end up being before the StartDateForRating.
   *
   * @return  the end date of this period for rating purposes.
   */
  private function calculateRatingEnd() : DateTime
  {
    var expDate = End
    if ( Jurisdiction.Branch.CancellationDate < expDate )
    {
      expDate = Jurisdiction.Branch.CancellationDate
    }
    if ( Jurisdiction.Branch.Audit.AuditInformation.AuditPeriodEndDate < expDate )
    {
      expDate = Jurisdiction.Branch.Audit.AuditInformation.AuditPeriodEndDate
    }
    return expDate
  }
  
  /**
   * Compute the sum of all the costs in this rating period's jurisdiction, within the rating period's
   * [RatingStart-RatingEnd) period, across the term.
   *
   * @param calcOrder   only costs where the CalcOrder is < this value will be summed
   * @param currency    the currency that should be used to compute the cost amount
   * @return the sum of all the costs in this rating period's jurisdiction, within the rating period's
   * [RatingStart-RatingEnd) period, across the term.
   */
  function getCostAmountSum(calcOrder : int, currency : Currency) : MonetaryAmount
  {
    return Jurisdiction.WCLine.Costs.cast( WCCost )
      .where( \ c -> c.JurisdictionState == Jurisdiction.State && c.CalcOrder < calcOrder)
      .toSet()
      .byRatingPeriod( this )
      .AmountSum(currency)
  }

  /**
   * Return a set of all jurisdictions in all version inside this rating period
   *
   * @return all jurisdictions in all version inside this rating period
  */
  property get JurisdictionCosts() : Set<WCJurisdictionCost> {
    return Jurisdiction.VersionList.Costs.flatMap( \ costVL -> costVL.AllVersions ).toSet().byRatingPeriod(this)
  }

  /**
   * Create a new cost data object
   *
   * @param step the rating step that is used to create the cost data
   * @return a cost data object based on the WCRatingStepExt that is passed in
  */
  function createCostData( step : WCRatingStepExt, rateCache : PolicyPeriodFXRateCache) : WCJurisdictionCostData {
    var cost = new WCJurisdictionCostData(RatingStart, RatingEnd, Jurisdiction.Branch.PreferredCoverageCurrency, rateCache, Jurisdiction.FixedId, Jurisdiction.State, step)
    cost.NumDaysInRatedTerm = RatingStart.differenceInDays( RatingEnd )
    return cost
  }

  /**
   * Return the cost version list for a given step
   *
   * @param step  the step used in the search of costs values
   * @return the cost version list for a given step
   */
  function getExistingWCJurisdictionCost( step : WCRatingStepExt ) : WCJurisdictionCost {
    var allCosts = Jurisdiction.VersionList.Costs
    var matchingVLs = allCosts.where(\costVL -> matchesStep(costVL.AllVersions.first(), step))
    if (matchingVLs.size() > 1) {
      throw "Expected at most one cost version list on " + Jurisdiction + " matching step " + step + "; found " + matchingVLs.Count  
    }
    var costVL = matchingVLs.first()
    if (costVL != null) {
      return costVL.AsOf( RatingStart )
    } else {
      return null  
    }
  }

  /**
   * Returns true if a given JurisdictionCost matches a given step
   *
   * @return  true if a given JurisdictionCost matches a given step
   */
  function matchesStep( cost : WCJurisdictionCost, step : entity.WCRatingStepExt) : boolean {
    return cost.WCJurisdictionCostType == step.aggCostType &&
           cost.CalcOrder == step.calcOrder &&
           cost.RateAmountType == step.amountType &&
           cost.StatCode == step.classcode  
  }

  /**
   * Return a string representation of a WCRatingPeriod
   *
   * @return    String that represents the data stored in a WCRatingPeriod
   */
  override function toString() : String
  {
    return "{Jurisdiction=" + Jurisdiction + ", Start=" + Start + ", End=" + End + "}"
  }
}
