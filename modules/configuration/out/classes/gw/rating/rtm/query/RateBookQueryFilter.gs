package gw.rating.rtm.query

uses java.util.Date

/**
 * A <code>RateBookQueryFilter </code> holds parameters that are used to query for a <code>RateBook</code>
 */
@Export
class RateBookQueryFilter {

  var _refDate : Date as QueryRefDate
  var _rateDate : Date as OriginalRateDate
  var _line : String as PolicyLine
  var _jurisdiction : Jurisdiction as Jurisdiction
  var _uwCompany : UWCompany as UWCompany
  var _offering : String as Offering
  var _minimumRatingLevel : RateBookStatus as MinimumRatingLevel
  var _renewalJob : boolean as RenewalJob

  construct(refDate : Date, rateDate : Date, line : String) {
    this._refDate = refDate
    this._rateDate = rateDate
    this._line = line
    this._minimumRatingLevel = RateBookStatus.TC_ACTIVE
    this._renewalJob = false
  }

  override function toString() : String {
    return "[ref date: ${_refDate}, rate date: ${_rateDate}] " +
      "Line: ${_line} " +
      "Jurisdiction: ${_jurisdiction.Code} " +
      "UWCompany: ${_uwCompany.Name} " +
      "Offering: ${_offering} " +
      "Minimum Rating Level: ${_minimumRatingLevel} " +
      "Is Renewal Job: ${_renewalJob}"
  }
}
