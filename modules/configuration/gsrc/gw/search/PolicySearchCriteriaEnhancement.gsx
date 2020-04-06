package gw.search
uses gw.api.database.IQueryBeanResult
uses gw.api.util.DisplayableException

enhancement PolicySearchCriteriaEnhancement : entity.PolicySearchCriteria {

  function search() : IQueryBeanResult<PolicyPeriodSummary> {
    /**
    // Additional criteria can be added to the policy period search query using 
    // SummaryQuery like the following...  
    
    // construct the query using the base product criteria fields
    var query = this.SummaryQuery
    
    // Add any additional query logic here for extension criteria fields
    // In this example, we are adding a subselect to find policy periods containing a vehicle with
    // a matching VIN
    var subQuery = new Query<PolicyPeriodSummary>(PolicyPeriodSummary)
    var vehTable = subQuery.subselect("ID", CompareIn, PersonalVehicle, "BranchValue")
    vehTable.compare("Vin", Equals, vin)
    query = query.intersect(subQuery)
    
    // Then execute the query and check whether it exceeds a max number of rows
    var result = query.select()
    if(result.getCountLimitedBy(MAX + 1) > MAX) throw "Too many results"
    */
    
    // If no additional criteria are required, this method will construct the query and execute 
    // the select as above.
    if (!meetsMinimumSearchCriteria()) throw new DisplayableException(displaykey.Web.Policy.MinimumSearchCriteria);
    var result = this.performSearch()
    return result
  }
  
  @Deprecated("PC 7.0.4. Use search() instead")
  function validateAndSearchForCopyData() : PolicyPeriodSummaryQuery  {
    return search()
  }
  
  /**
  * Check that the search criteria meets the minimum requirements.
  */
  function meetsMinimumSearchCriteria() : boolean {
    if (this.NameCriteria.OfficialId.NotBlank) return true
    if (this.AccountNumber.NotBlank) return true
    if (this.PolicyNumber.NotBlank) return true
    if (this.PrimaryInsuredPhone.NotBlank) return true
    // Producer is force-populated for external users and therefore ignored
    if (this.Producer != null and not User.util.CurrentUser.ExternalUser) return true
    if (this.ProducerCode != null) return true
    if (this.JobNumber != null) return true
    
    if (this.NameCriteria.CompanyName.NotBlank) {
      if (this.CompanyNameExact || this.PermissiveSearch) return true
      else if (this.NameCriteria.CompanyName.length() >= 5) return true
    }
    if (this.NameCriteria.CompanyNameKanji.NotBlank) return true

    if (this.NameCriteria.FirstNameKanji.NotBlank || this.NameCriteria.LastNameKanji.NotBlank) {
      return true;
    }

    var has_name = (this.NameCriteria.FirstName.NotBlank && (this.NameCriteria.FirstName.length >= 3 || this.FirstNameExact)) &&
                   (this.NameCriteria.LastName.NotBlank && (this.NameCriteria.LastName.length >= 3 || this.LastNameExact))

    var has_location = ((this.PrimaryInsuredCity.NotBlank || this.PrimaryInsuredCityKanji.NotBlank)
        && this.PrimaryInsuredState != null) || this.PrimaryInsuredPostalCode.NotBlank
     
    return has_name && (this.LastNameExact || has_location || this.PermissiveSearch)
  }

  @Deprecated("PC 7.0.4. Use meetsMinimumSearchCriteria() instead.")
  property get MinimumCopyDataCriteriaForSearch() : boolean {
    return meetsMinimumSearchCriteria()
  }

  /**
   * Used to reset the search for search items, typically after a search failure.
   */
  function resetForSearchItems(searchObjectType : SearchObjectType, policyNumber : String, jobNumber : String) {
    this.SearchObjectType = searchObjectType
    this.PolicyNumber = policyNumber
    this.JobNumber = jobNumber
  }
  
  /**
   * Return the date fields to search on based on the search object type.
   */
  property get DateFieldsSearchType() : List<DateFieldsToSearchType> {
    return IsAuditSearch ? DateFieldsToSearchType.TF_AUDITSEARCHTYPES.TypeKeys : DateFieldsToSearchType.TF_NONAUDITSEARCHTYPES.TypeKeys
  }

  property get WorkOrderSearchForCopyData() : boolean {
    return this.SearchObjectType == SearchObjectType.TC_SUBMISSION or
           this.SearchObjectType == SearchObjectType.TC_POLICYCHANGE or 
           this.SearchObjectType == SearchObjectType.TC_REWRITENEWACCOUNT or 
           this.SearchObjectType == SearchObjectType.TC_RENEWAL or 
           this.SearchObjectType == SearchObjectType.TC_REWRITE  
  }
  
  /**
   * Returns the appropriate PolicySearch LV mode to use in the UI.
   */
  property get ResultsLVMode() : String {
    return IsAuditSearch ? "Audit" : this.SearchObjectType.Code
  }
  
  private property get IsAuditSearch() : boolean {
    return new SearchObjectType[]{"FinalAudit", "PremiumReport"}.contains(this.SearchObjectType)
  }
  
}
