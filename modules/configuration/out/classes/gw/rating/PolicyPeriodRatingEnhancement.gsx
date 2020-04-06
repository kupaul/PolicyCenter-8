package gw.rating

uses java.math.BigDecimal
uses java.util.Date

enhancement PolicyPeriodRatingEnhancement : PolicyPeriod {
  
  property get EffectiveDatesForRating() : List<Date> {
    var effectiveDates = this.AllEffectiveDates.toSet()
    // The EditEffectiveDate may not be in the list of AllEffectiveDates if no changes have been made.
    // In order for the "rate this slice forward" to work correctly, we need to ensure there _is_ a slice
    // from the EditEffectiveDate and on.  Thus, we ensure the EditEffectiveDate is in the list of dates.
    effectiveDates.add(this.EditEffectiveDate)
    var cancDate = this.CancellationDate
    if (cancDate != null and cancDate != this.PeriodEnd) {
      effectiveDates.add(cancDate)
    }
    return effectiveDates.toList().sort()
  }

  function getProductModifierFactor () : BigDecimal {
    var factor : BigDecimal = 1
    if (this.EffectiveDatedFields.ProductModifiers.Count < 1) {
      return factor
    }
    //  If there are multiple modifiers they combine multiplicatively, not additively
    this.EffectiveDatedFields.ProductModifiers
        .where(\ m -> m.DataType == typekey.ModifierDataType.TC_RATE and m.RateModifier != null)
        .each(\ mod -> {factor = factor * (1 + mod.RateModifier)})
    return factor
  }
        
  // before running rating, want to clear out any old rating worksheets.
  function removeDiagnosticRatingWorksheets() {
    var dates = this.AllEffectiveDates.toSet()
    for (l in this.Lines) {
      for (d in dates) {
        if (l.isEffective(d)) {
          var sliced = l.getSlice(d)
          sliced.DiagnosticRatingWorksheets.each(\ ws -> ws.remove())
        }
      }
    }
  }
}
