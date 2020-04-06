package gw.lob.pa

enhancement PAUMBICovEnhancement : productmodel.PAUMBICov {
  property get StateMinPackage() : java.util.Map<Jurisdiction, String> {
    return  {
      "OR" -> "25/50", "MT" -> "25/50", "MO" -> "25/50", "MN" -> "25/50", "KS" -> "25/50",
      "MA" -> "20/40",
      "UT" -> "10/20",
      "VA" -> "50/100",
      "AK" -> "50/100",
      "CO" -> "20/50",
      "ME" -> "50/100",
      "NC" -> "30/60",
      "VT" -> "50/100"
    }
  }
}
