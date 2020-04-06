package gw.lob.pa
uses java.math.BigDecimal

enhancement PALiabilityCovEnhancement : productmodel.PALiabilityCov
{
  property get StateMinPackage() : java.util.Map<Jurisdiction, String> {
    return  { 
      "AK" -> "50/100/50", "ME" -> "50/100/50",
      "AL" -> "20/40/10", "CT" -> "20/40/10", "HI" -> "20/40/10", "MD" -> "20/40/10", "MI" -> "20/40/10",
      "WV" -> "20/40/10",
      "MO" -> "25/50/10", "MT" -> "25/50/10", "NM" -> "25/50/10", "NY" -> "25/50/10", "OR" -> "25/50/10", "VT" -> "25/50/10",
      "WA" -> "25/50/10", "WI" -> "25/50/10", "IN" -> "25/50/10", "KY" -> "25/50/10", "KS" -> "25/50/10", "TN" -> "25/50/10",
      "MS" -> "25/50/25", "NE" -> "25/50/25", "NH" -> "25/50/25", "ND" -> "25/50/25", "RI" -> "25/50/25", "SC" -> "25/50/25", "SD" -> "25/50/25",
      "AR" -> "25/50/15", "CO" -> "25/50/15", "ID" -> "25/50/15",
      "AZ" -> "15/30/10", "GA" -> "15/30/10", "NV" -> "15/30/10",  		
      "CA" -> "15/30/5", "DE" -> "15/30/5", "NJ" -> "15/30/5", "PA" -> "15/30/5", 	
      "FL" -> "10/20/10", "LA" -> "10/20/10", "OK" -> "10/20/10",	
      "IL" -> "20/40/15", "IA" -> "20/40/15", "TX" -> "20/40/15",
      "MA" -> "20/40/10",
      "MN" -> "30/60/10", 
      "NC" -> "30/60/25", 
      "OH" -> "12.5/25/7.5", 
      "UT" -> "25/50/15",
      "VA" -> "25/50/20", "WY" -> "25/50/20"
    }
  }
  
  function areBILimitsAvailable(umPerPersonBI : BigDecimal, umPerAccidentBI : BigDecimal) : boolean {
    var liabPackValue = this.PALiabilityTerm.PackageValue
    var liabPerPersonBI : BigDecimal
    var liabPerAccidentBI : BigDecimal
    
    if (liabPackValue.PackageTerms.Count == 3) {
      for (term in liabPackValue.PackageTerms) {
        if (term.AggregationModel == "pp" and term.RestrictionModel == "bi" ) {
          liabPerPersonBI = term.Value
        } else if (term.AggregationModel == "ea" and term.RestrictionModel == "bi" ) {
          liabPerAccidentBI = term.Value
        }
      }
    } else {
      liabPerPersonBI = liabPackValue.PackageTerms[0].Value
      liabPerAccidentBI = liabPackValue.PackageTerms[0].Value
    }  

    return (umPerPersonBI <= liabPerPersonBI && umPerAccidentBI <= liabPerAccidentBI)
  }
  
  function arePDLimitsAvailable(umPerAccidentPD : BigDecimal) : boolean {
    var liabPackValue = this.PALiabilityTerm.PackageValue
    var liabPerAccidentPD : BigDecimal
    
    if (liabPackValue.PackageTerms.Count == 3) {
      for (term in liabPackValue.PackageTerms) {
        if (term.AggregationModel == "ea" and term.RestrictionModel == "pd" ) {
          liabPerAccidentPD = term.Value
          break
        }
      }
    } else {
      liabPerAccidentPD = liabPackValue.PackageTerms[0].Value
    }  

    return (umPerAccidentPD <= liabPerAccidentPD)
  }
}
