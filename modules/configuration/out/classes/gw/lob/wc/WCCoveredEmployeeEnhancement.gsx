package gw.lob.wc
uses gw.api.util.Math
uses gw.api.util.JurisdictionMappingUtil
uses gw.financials.Prorater

enhancement WCCoveredEmployeeEnhancement : entity.WCCoveredEmployee {

  /**
   * @return the jurisdiction that matches this employee's state
   */
  property get Jurisdiction() : WCJurisdiction {
    var line = this.WorkersCompLine
    var jurisdictions = line.Jurisdictions
    return jurisdictions.firstWhere(\ jur -> jur.State == JurisdictionMappingUtil.getJurisdiction(this.Location ))
  }

  /**
   * Returns the BasisAmount prorated, from its own effective period, to the period it is
   * effective for rating, that is, taking any cancellation or audit window into account.
   * If this WCCoveredEmployee falls after the cancellation date, or outside of the audit window,
   * then it returns 0 basis.
   */
  property get BasisForRating() : int {
    if (NumDaysEffectiveForRating == 0 or NumDaysEffective == 0) {
      return 0
    }

    // If it's an audit job OR we're rating the whole thing, do no pro-ration
    if (this.Branch.Audit != null || NumDaysEffectiveForRating == NumDaysEffective) {
      return UnproratedBasisForRating
    } else {
      return Math.roundNearest((UnproratedBasisForRating as double) * NumDaysEffectiveForRating / NumDaysEffective) as int
    }
  }

  /**
   * Returns the number of days this WCCoveredEmployee is effective.
   */
  property get NumDaysEffective() : int {
    return Prorater.forFinancialDays(TC_PRORATABYDAYS).financialDaysBetween(this.EffectiveDate, this.ExpirationDate)
  }

  /**
   * Returns the number of days this WCCoveredEmployee is effective, taking any cancellation or audit window into account.
   * If the employee falls after the cancellation or outside the audit window, the [EffectiveDateForRating-ExpirationDateForRating)
   * period is meaningless (with the exp being before the eff), so return 0 days.
   */
  property get NumDaysEffectiveForRating() : int {
    var effDate = EffectiveDateForRating
    var expDate = ExpirationDateForRating
    if (effDate > expDate) {
      return 0
    }
    return Prorater.forFinancialDays(TC_PRORATABYDAYS).financialDaysBetween(effDate, expDate)
  }
  
  /**
   * Returns either the audited amount, or the basis amount depending on if the job is an audit.
   * Returns 0 if the basis is null to handle "If Any Exposure".
   */
  property get UnproratedBasisForRating() : int {
    var unproratedBasis = this.Branch.Audit == null ? this.BasisAmount : this.AuditedAmount
    if (unproratedBasis == null) {
      return 0
    }
    return unproratedBasis
  }

  property get ProratedEstimatedAmount() : int {
    if (NumDaysEffectiveForRating == 0 or NumDaysEffective == 0) {
      return 0
    }
    return Math.roundNearest((this.BasisAmount as double) * NumDaysEffectiveForRating / NumDaysEffective) as int
  }

  /**
   * Returns the effective date of this WCCoveredEmployee for rating purposes.
   * This will be the later of the employee's effective date and the audit window start date, if any.
   * Note that the EffectiveDateForRating might end up being after the ExpirationDateForRating.
   */
  property get EffectiveDateForRating() : DateTime {
    var effDate = this.EffectiveDate
    if (this.Branch.Audit.AuditInformation.AuditPeriodStartDate > effDate) {
      effDate = this.Branch.Audit.AuditInformation.AuditPeriodStartDate
    }
    return effDate
  }

  /**
   * Returns the expiration date of this WCCoveredEmployee for rating purposes.
   * This will return the earlier of the employee's expiration date, the audit window end date, and
   * the cancellation date, if any.
   * Note that the ExpirationDateForRating might end up being before the EffectiveDateForRating.
   */
  property get ExpirationDateForRating() : DateTime {
    var expDate = this.ExpirationDate
    if (this.Branch.CancellationDate < expDate) {
      expDate = this.Branch.CancellationDate
    }
    if (this.Branch.Audit.AuditInformation.AuditPeriodEndDate < expDate) {
      expDate = this.Branch.Audit.AuditInformation.AuditPeriodEndDate
    }
    return expDate
  }

  /**
   * Get the one cost that overlaps this covered employee's SliceDate
   * and return it in slice mode.  If no such cost exists, return null.
   */
  property get WCCovEmpCost() : WCCovEmpCost {
    if (this.Costs.Count > 1) {
      throw "Expected at most one cost on " + this + "; found " + this.Costs.Count
    }
    return this.Costs.first()
  }

  property get LocationWM(): PolicyLocation {
    if (NewEmployee) {
      // we have to do this or change location out-of-sequence will show 2 versions of the same
      // location. This should return the latest version of the location because it is unsliced
      return this.Location
    } else {
      if (this.EffectiveDate.afterOrEqual(this.ExpirationDate)) {
        return this.Location
      }
      return this.getSlice( this.EffectiveDate ).Location
    }
  }

  property get LastBilledCoveredEmployee() : WCCoveredEmployee {
    return this.BasedOn
  }

  property set LocationWM(_location: PolicyLocation)  {
    this.assertWindowMode(_location)
    this.Location = _location
    if(_location != null){
      var exposureDateRange = _location.EffectiveDateRangeWM
        .intersect( _location.Branch.EditEffectiveDateRange )
      this.EffectiveDateRange = exposureDateRange
    }
  }

  property set IfAnyExposureAndClearBasisAmount(value : Boolean) {
    if (value == true) {
      this.BasisAmount = null
    }
    this.IfAnyExposure = value
  }

  property get IfAnyExposureAndClearBasisAmount() : Boolean {
    return this.isIfAnyExposure()
  }

  property get NewEmployee() : boolean{
    return this.BasedOn == null
  }

  function getIfAnyOrExposureAmount() : String {
    if (this.isIfAnyExposure() != null and this.isIfAnyExposure()) {
      return displaykey.Java.WorkersComp.IfAnyExposure
    }
    final var amount = this.getBasisAmount()
    return amount == null ? null : amount.toString()
  }

  protected function deletable() : boolean {
    return true
  }

}
