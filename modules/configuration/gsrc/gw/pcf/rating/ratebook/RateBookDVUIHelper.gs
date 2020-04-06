package gw.pcf.rating.ratebook

uses java.util.Date

@Export
class RateBookDVUIHelper {
  var _rateBook: RateBook as RateBook

  construct(rateBook : RateBook) {
    _rateBook = rateBook
  }

  property get StatusChangeDateLabel() : String {
    return RateBook.isActive()
        ? displaykey.Web.Rating.RateBooks.ActivationDate
        : displaykey.Web.Rating.RateBooks.LastStatusChangeDate
  }

  function possiblyAutoPopulateRenewalEffectiveDate() {
    if (RateBook.RenewalEffectiveDate == null)
      RateBook.RenewalEffectiveDate = RateBook.EffectiveDate
  }

  function checkDateIsEarlierThanBefore(targetDate : Date) : String {
    if (RateBook.ExpirationDate == null) {return null}
    if (targetDate != null and RateBook.ExpirationDate <= targetDate) {
      return displaykey.Web.Rating.RateBooks.DateIsNotEarlierThanBefore(displaykey.Web.Rating.RateBooks.RenewalEffectiveDate.Before)
    }
    return null
  }

  function checkBeforeOccursLaterThanPolicyEffectiveDateOrRenewalEffectiveDate() : String {
    if (RateBook.ExpirationDate == null) {
      return null
    }
    if ((RateBook.EffectiveDate != null and RateBook.ExpirationDate <= RateBook.EffectiveDate) or
        (RateBook.RenewalEffectiveDate != null and RateBook.ExpirationDate <= RateBook.RenewalEffectiveDate)) {
      return displaykey.Web.Rating.RateBooks.BeforeMustBeLaterThanOnOrAfter(displaykey.Web.Rating.RateBooks.EffectiveDate.After)
    }
    return null
  }
}