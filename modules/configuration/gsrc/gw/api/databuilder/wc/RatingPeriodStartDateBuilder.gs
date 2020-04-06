package gw.api.databuilder.wc

uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses java.lang.IllegalStateException
uses java.util.Date

/**
 * @author dpetrusca
 */
@Export
class RatingPeriodStartDateBuilder extends DataBuilder<RatingPeriodStartDate, RatingPeriodStartDateBuilder> {

  var _rpsdDate : Date
  var _rpsdType : RPSDType

  construct() {
    super(RatingPeriodStartDate)
  }

  protected override function createBean(context : BuilderContext) : RatingPeriodStartDate {
    var period = context.ParentBean as WCJurisdiction
    var rpsd = period.addRatingPeriodStartDate(_rpsdDate, _rpsdType)
    if (rpsd == null) {
      throw new IllegalStateException(displaykey.Builder.RatingPeriodStartDate.Error.CannotCreate(_rpsdType, _rpsdDate))
    }
    return rpsd
  }

  function withDate(rpsdDate : Date) : RatingPeriodStartDateBuilder {
    _rpsdDate = rpsdDate
    return this
  }

  function withType(rpsdType : RPSDType) : RatingPeriodStartDateBuilder {
    _rpsdType = rpsdType
    return this
  }
}
