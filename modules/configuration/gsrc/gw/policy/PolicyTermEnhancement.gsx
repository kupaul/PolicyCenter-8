package gw.policy

uses gw.api.database.Query
uses gw.api.policy.period.PolicyPeriodQueryFilters

uses java.util.Date

enhancement PolicyTermEnhancement : PolicyTerm {
  property get PolicyNumber() : String {
    return getPeriodAsOf(DateTime.Today).PolicyNumber
  }

  property get PolicyNumberDisplayString() : String {
    return getPeriodAsOf(DateTime.Today).PolicyNumberDisplayString
  }

  property get Periods() : PolicyPeriod[] {
    return this.Policy.Periods.where(\ period -> period.PolicyTerm == this)
  }

  /**
   * Returns policy period as of the given date, or last bound period if the period is null asOf date
   * @param date the date to be checked
   * @return policy period
   */
  function getPeriodAsOf(date : DateTime) : PolicyPeriod {
    var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(this.Policy, date)
    if (period == null) {
      period = this.Policy.Periods.last()
    }
    return period
  }

  function removePreRenewalDirection() {
    //clear out the fields that represent pre-renewal direction
    this.PreRenewalDirection = null
    this.NonRenewAddExplanation = null
    this.NonRenewReason = null
    this.NonRenewalExplanations.each( \ n -> this.removeFromNonRenewalExplanations( n ) )
  }

  function getAvailableNonRenewalExplanationPatterns() : NonRenewalExplanationPattern[]{
    var currentDate = Date.CurrentDate
    var existingPatternList = this.NonRenewalExplanations.map( \ n -> n.Code ).toList()
    var result = Query.make(NonRenewalExplanationPattern)
      .and(\ andRestriction -> andRestriction
        .or(\ restriction -> {
          var effDateColumnName = NonRenewalExplanationPattern#EffectiveDate.PropertyInfo.Name
          restriction.compare(effDateColumnName, Equals, null)
          restriction.compare(effDateColumnName, LessThanOrEquals, currentDate)
        })
        .or(\ restriction -> {
          var expDateColumnName = NonRenewalExplanationPattern#ExpirationDate.PropertyInfo.Name
          restriction.compare(expDateColumnName, Equals, null)
          restriction.compare(expDateColumnName, GreaterThanOrEquals, currentDate)
        })
      ).select().where(\ n -> not existingPatternList.contains( n.Code )).toTypedArray()
    return result
  }

  @Deprecated("In PC 8.0.  Use getAvailableNonRenewalExplanationPatterns directly instead.")
  function findEffectiveNonRenewalExplanationPattern() : NonRenewalExplanationPatternQuery {
    var currentDate = Date.CurrentDate

    var result = Query.make(NonRenewalExplanationPattern)
      .and(\ andRestriction -> andRestriction
        .or(\ restriction -> {
          restriction.compare("EffectiveDate", Equals, null)
          restriction.compare("EffectiveDate", LessThanOrEquals, currentDate)
        })
        .or(\ restriction -> {
          restriction.compare("ExpirationDate", Equals, null)
          restriction.compare("ExpirationDate", GreaterThan, currentDate)
        })
      ).select()
    return result
  }

  function createPreRenewalDirectionHistoryDescription(originalValue : typekey.PreRenewalDirection) : String{
    return originalValue == null ?
           displaykey.Web.History.PreRenewal.PreRenewalDirectionSet( this.PreRenewalDirection ) : displaykey.Web.History.PreRenewal.PreRenewalDirection( originalValue, this.PreRenewalDirection )
  }

  function createNonRenewalReasonHistoryDescription(originalValue : NonRenewalCode) : String{
    return originalValue == null ?
           displaykey.Web.History.PreRenewal.NonRenewReasonSet( this.NonRenewReason ) : displaykey.Web.History.PreRenewal.NonRenewReason( originalValue, this.NonRenewReason )
  }

  function createNonRenewalAdditionalExplanationHistoryDescription() : String{
    return displaykey.Web.History.PreRenewal.NonRenewAddExplanation
  }

  function createPreRenewalAssignmentHistoryDescription(assignment : UserRoleAssignment) : String{
     return displaykey.Web.History.PreRenewal.AssignmentUser( assignment.AssignedUser)
  }

  function createNonRenewalExplanationRemovedHistoryDescription() : String{
     return displaykey.Web.History.PreRenewal.NonRenewalExplanations.Remove
  }

  function createNonRenewalExplanationAddedHistoryDescription() : String{
     return displaykey.Web.History.PreRenewal.NonRenewalExplanations.Add
  }

  function findMostRecentPeriod() : PolicyPeriod {
    var query = Query.make(PolicyPeriod)
    var termTable = query.join("PolicyTerm")
    termTable.compare("ID", Equals, this.ID)
    PolicyPeriodQueryFilters.inForce(query)
    return query.select().AtMostOneRow
  }
}
