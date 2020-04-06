package gw.pcf.rating.ratebook

@Export
class NewRateBookUIHelper {
  static function create() : RateBook {
    var book = new RateBook()
    book.LastStatusChangeDate = java.util.Date.CurrentDate
    book.Status = RateBookStatus.TC_DRAFT

    return book
  }
}