package gw.api.domain

enhancement StateSetEnhancement : StateSet {

  public static property get WC_NOTMONOPOLISTIC() : String {
    return "WCNotMonopolistic"
  }

  public static property get WC_MONOPOLISTIC() : String {
    return "WCMonopolistic"
  }

  public static property get US50() : String {
    return "US50"
  }
  
  public static property get PIPSTATES() : String {
    return "PipStates"
  }
  
  public static property get NCCI() : String {
    return "NCCI"
  }
  
  public static property get NONNCCI() : String {
    return "NonNCCI"
  }
}
