package gw.lob.wc

enhancement InclusionPersonEnhancement : InclusionPerson {

  /*
   * This rule is used to filter the relationship typelist for WC inclusion or exclusion
   */
   function filterRelationship(rel : Relationship) : boolean {
    //ambulance only applies in new york
    if (rel == "AmbEmp" and not ((this.State == "NY") and (this.Inclusion == "incl"))) {
       return false
    }
    return true
  }
  
}
