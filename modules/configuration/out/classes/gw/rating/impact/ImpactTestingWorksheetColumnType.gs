package gw.rating.impact

@Export
enum ImpactTestingWorksheetColumnType {
    AccountNumber(displaykey.Rating.Impact.AccountNumber),
    AccountName(displaykey.Rating.Impact.AccountName),
    AccountJurisdiction(displaykey.Rating.Impact.AccountJurisdiction),
    Product(displaykey.Rating.Impact.Product),
    Offering(displaykey.Rating.Impact.Offering),
    Issued(displaykey.Rating.Impact.Issued),
    PolicyNumber(displaykey.Rating.Impact.PolicyNumber),
    PolicyJurisdiction(displaykey.Rating.Impact.PolicyJurisdiction),
    PeriodStart(displaykey.Rating.Impact.PeriodStart),
    PeriodEnd(displaykey.Rating.Impact.PeriodEnd),
    TermNumber(displaykey.Rating.Impact.TermNumber),
    BaselineTotalCost(displaykey.Rating.Impact.BaselineTotalCost),
    ComparisonTotalCost(displaykey.Rating.Impact.ComparisonTotalCost),
    ProducerCodeOfRecord(displaykey.Rating.Impact.ProducerCodeOfRecord),
    ProducerCodeOfService(displaykey.Rating.Impact.ProducerCodeOfService),
    UWCompany(displaykey.Rating.Impact.UWCompany),
    CostDescription(displaykey.Rating.Impact.CostDescription),
    CostType(displaykey.Rating.Impact.CostType),
    ActiveRateBook(displaykey.Rating.Impact.ActiveRateBook),
    BaseTermAmount(displaykey.Rating.Impact.BaseTermAmount),
    BaseActualAmount(displaykey.Rating.Impact.BaseActualAmount),
    ComparisonRateBook(displaykey.Rating.Impact.ComparisonRateBook),
    ComparisonTermAmount(displaykey.Rating.Impact.ComparisonTermAmount),
    ComparisonActualAmount(displaykey.Rating.Impact.ComparisonActualAmount),
    InvalidQuote(displaykey.Rating.Impact.InvalidQuote),
    Coverable(displaykey.Rating.Impact.Coverable);

    var _label : String as readonly Label
   
    private construct(labelString : String) {
      this._label = labelString
    }
 }
