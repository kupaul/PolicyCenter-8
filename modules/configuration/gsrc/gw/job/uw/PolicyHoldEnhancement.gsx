package gw.job.uw
uses java.util.Date
uses gw.api.util.DateUtil
uses gw.api.domain.covterm.DirectCovTerm
uses java.math.BigDecimal
uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.admin.PolicyHoldsLogger

enhancement PolicyHoldEnhancement : entity.PolicyHold {

  /**
   * Updates the LastEvalTime of the PolicyHoldJob
   * associated to this policy hold and job. Creates a new
   * PolicyHoldJob if not found.
   * 
   * @param job - the associated job
   * @param lastEvalTime - the date to update time to 
   * 
   */
  function updateLastEvalTime(job : Job, lastEvalTime : Date, period : PolicyPeriod) {
    var policyHoldJob : PolicyHoldJob


    policyHoldJob = this.HeldJobs.firstWhere(\ p -> p.Job.ID == job.ID and (p.Period.ID == period.ID or p.Period == null))

    if (policyHoldJob == null) {
      policyHoldJob  = new PolicyHoldJob(this){:PolicyHold = this,
                                        :Job = job,
                                        :Period = period,
                                        :LastEvalTime = lastEvalTime}
      this.addToHeldJobs(policyHoldJob)
    } else {
      policyHoldJob.LastEvalTime = lastEvalTime  
    }
  }

  /**
   * Creates a new PolicyHoldRule and adds it to this PolicyHold's array of rules.
   * 
   * @return the policy hold rule created
   */
  function createAndAddRule() : PolicyHoldRule {
    var rule = new PolicyHoldRule(this.Bundle)
    this.addToRules(rule)
    return rule
  }
  
  /**
   * Make a copy of the policy hold
   *
   * @param copyRules - whether or not the rules should be copied
   * @param copyRegions - whether or not the regions should be copied
   * @return PolicyHold - return copied policy hold
   * 
   */  
  function copyPolicyHold(copyRules : boolean, copyRegions : boolean) : PolicyHold {
    // Copy basic details from policy hold
    var newPolicyHold = this.shallowCopy() as PolicyHold
    
    // Copy rules from policy hold
    if (copyRules) {
      this.Rules.each(\ rule -> newPolicyHold.addToRules(rule.shallowCopy() as PolicyHoldRule))
    }
    
    // Copy regions from policy hold
    if (copyRegions) {
      this.PolicyHoldZones.each(\ zone -> newPolicyHold.addToPolicyHoldZones(zone.shallowCopy() as PolicyHoldZone))
    }
    
    // Set different code, description, and long description for the new policy hold
    newPolicyHold.PolicyHoldCode = displaykey.Web.Admin.PolicyHold.CodeCopy(this.PolicyHoldCode)
    newPolicyHold.Description = displaykey.Web.Admin.PolicyHold.Copy(this.Description)
    newPolicyHold.UWIssueLongDesc = displaykey.Web.Admin.PolicyHold.Copy(this.UWIssueLongDesc)

    return newPolicyHold
  }
    
  /**
   * Create and set policy hold zones to the selected zones
   *
   * @param zones - Zone array
   */
  function createPolicyHoldZones(zones : Zone[]) {
    for (zone in zones) {
      var holdZone = new PolicyHoldZone(this.Bundle)
      holdZone.Country = zone.Country
      holdZone.ZoneType = zone.ZoneType
      holdZone.Code = zone.Code
      this.addToPolicyHoldZones(holdZone)
    }
  }
  
  /**
   * Compare the passed in period with the hold
   *
   * @param period - the policy period for use in comparison with the policy hold
   * @return boolean - returns true if the policy period matches any of the hold rules 
   */
  function compareWithPolicyPeriod(period : PolicyPeriod) : boolean {
    var matchingJobRules = getMatchingJobRules(period.Job.Subtype)
    
    // Evaluate all the lines that are on this period against the matching rules
    for (rule in matchingJobRules) {
      if (evaluateLines(period, rule)){
        return true
      }
    }
    return false
  }
  
  /**
   * Get all the policy hold rules that have a definition for the particular job type
   *
   * @param jobType - the type of job
   * @return List<PolicyHoldRule> - returns a list of policy hold rules
   */
  function getMatchingJobRules(jobType : typekey.Job) : List<PolicyHoldRule> {
    // Get all the rules that matches the current job
    return this.Rules.where(\ rule -> rule.JobType == jobType).toList()
  }

  /**
   * Go through all the lines on the period to see if there's a matching policy hold rule for any of the lines.
   * If there is a matching rule for a line, then evaluate the line's coverages, dates, or policy locations. 
   *
   * @param period - the policy period 
   * @param rule -  the rule to use to evaluate the lines
   * @return boolean - true if there is a match with the policy hold rule
   */  
  function evaluateLines(period : PolicyPeriod, rule : PolicyHoldRule) : boolean {
    for (line in period.Lines) {
      // If a line on the period matches one of the lines on the rule, check dates, regions, and coverages
      if (rule.PolicyLineType == line.Subtype) {
        if (PolicyHoldsLogger.isDebugEnabled()) {
          PolicyHoldsLogger.logDebug("Matching job and policy change in policy hold rules for: " + period.Job.Subtype + ", " + line.Subtype)
        }
        if (rule.CovPatternCode != null and rule.CovPatternCode != "Any") {
          return evaluateCoverages(rule.JobDateType, rule.CovPatternCode, line.AllCoverages)
        } else if (evaluateDates(rule.JobDateType, period.EditEffectiveDate, period.WrittenDate, 
                          line.getReferenceDateForCurrentJob(line.BaseState), line.DisplayName)) {
          return evaluatePolicyLocations(period.PolicyLocations)
        }
      }
    }
    return false
  }

  /**
   * Evaluate the dates on the period to see if they're within the policy hold start and end dates
   *
   * @param jobDateType - the date type 
   * @param effDate - the effective date of the policy
   * @param writtenDate - the written date of the policy
   * @param referenceDate - the reference date of the policy
   * @param beanDisplay - the display name of the bean
   * @return boolean - true if the dates on the period are within the policy hold start and end dates
   */    
  function evaluateDates(dateType : JobDateType, effDate : Date, writtenDate : Date, referenceDate: Date, beanDisplay : String) : boolean {
    if (PolicyHoldsLogger.isDebugEnabled()) {
      PolicyHoldsLogger.logDebug("(evaluatePeriodDates) DateType: " + dateType + ", PolicyLine: " + beanDisplay)
    }
    // If the start and end dates are equal, then the hold should not exist
    if (this.EndDate != null and DateUtil.compareIgnoreTime(this.StartDate, this.EndDate) == 0) {
      return false
    }
    if (dateType == JobDateType.TC_REFERENCE) {
      // Reference date is in use
      // Rule is 
      //   ** If the Reference Date of the object specified by the rule is greater than or equal to the hold start date AND
      //      the Reference Date is less than the hold end date       
      //   *** Then the rule applies
      if (DateUtil.compareIgnoreTime(referenceDate, this.StartDate) >= 0 and
         (this.EndDate == null or DateUtil.compareIgnoreTime(referenceDate, this.EndDate) < 0)) {
        return true 
      } 
    } else {
      // Rule #1
      //  ** If the written or effective date (as specified in the hold) of the job is greater than or equal to the hold start date and 
      //     the written or effective date of the job is less than the hold end date.      
      //  *** Then the rule applies.   
      var thedate = effDate
      if (dateType == typekey.JobDateType.TC_WRITTEN) {
        thedate = writtenDate
      }
      if (DateUtil.compareIgnoreTime(thedate, this.StartDate) >= 0 and 
         (this.EndDate == null or DateUtil.compareIgnoreTime(thedate, this.EndDate) < 0)) {
         return true
      }
      // Rule # 2
      //   ** If the effective date
      //      now modified to be effective or written date of the object specified by the rule
      //      (coverage or policy line) is less than the hold start date and
      //      if today (the time the rules are run) is greater than or equal to the hold start date. 
      //   *** Then the rule applies 
      if (DateUtil.compareIgnoreTime(thedate, this.StartDate) < 0 and 
          DateUtil.compareIgnoreTime(Date.Today, this.StartDate) >= 0) {
        return true
      }
    }
    return false
  }

  /**
   * Go through all the coverages that matches a specific pattern code, and check to see if any coverages
   * match the hold start and end dates, is within the hold regions, and has increased limits.
   *
   * @param dateType - the date type
   * @param patternCode - the code of the coverage pattern
   * @param allCoverages - an array of coverages to be checked
   * @return boolean - true if there is a match with the policy hold rule
   */    
  function evaluateCoverages(dateType : JobDateType, patternCode : String, allCoverages : Coverage[]) : boolean {
    var matchingCoverages = allCoverages.where(\ cov -> cov.PatternCode == patternCode)
    for (cov in matchingCoverages) {
      if (evaluateDates(dateType, cov.EffectiveDate, cov.PolicyLine.Branch.WrittenDate, cov.ReferenceDate, cov.DisplayName)) {
        if (evaluatePolicyLocations(cov.OwningCoverable.PolicyLocations)) {
          // This is a new coverage, so we should not allow it to be bound
          if (cov.BasedOnUntyped == null) {
            if (PolicyHoldsLogger.isDebugEnabled()) {
              PolicyHoldsLogger.logDebug("(evaluateCoverage) Coverage: " + cov + " is new")
            }
            return true
          }
          if (checkCoverageTerm(cov)) {
            return true
          }
        }
      }
    }
    if (PolicyHoldsLogger.isDebugEnabled()) {
      PolicyHoldsLogger.logDebug("(evaluateCoverage) No matching rules for: " + matchingCoverages.map(\ c -> c.DisplayName).join(", "))
    }
    return false
  }

  /**
   * Check to see if there are any increases to the direct or option cov terms on the coverage. 
   *
   * @param cov - the coverage to check for increased cov term values
   * @return boolean - true if there is an increase to the direct or option cov term value
   */    
  function checkCoverageTerm(cov : Coverage) : boolean {
    var oldTermValue : BigDecimal
    var newTermValue : BigDecimal
    // Get all limit coverage terms
    var currentCovTerms = cov.CovTerms.where(\ term -> term.ModelType == CovTermModelType.TC_LIMIT)
    // Iterate through all the current coverage terms and compare the values with the based on terms
    for (currentCovTerm in currentCovTerms) {
      var basedOnCov = cov.BasedOnUntyped as Coverage
      var basedOnCovTerm = basedOnCov.CovTerms.singleWhere(\ term -> term.PatternCode == currentCovTerm.PatternCode)
      if (currentCovTerm typeis DirectCovTerm ) {
        newTermValue = currentCovTerm.Value
        oldTermValue = (basedOnCovTerm as DirectCovTerm).Value
      } else if (currentCovTerm typeis OptionCovTerm) {
        newTermValue = currentCovTerm.Value
        oldTermValue = (basedOnCovTerm as OptionCovTerm).Value
      }
      if (oldTermValue == null and newTermValue != null) {
        if (PolicyHoldsLogger.isDebugEnabled()) {
          PolicyHoldsLogger.logDebug("(isCovTermIncreased) new cov term added")
        }
        return true
      } else if (newTermValue > oldTermValue) {
        if (PolicyHoldsLogger.isDebugEnabled()) {
          PolicyHoldsLogger.logDebug("(isCovTermIncreased) new cov term > old cov term: " + newTermValue + " > " + oldTermValue + " for coverage term: " + currentCovTerm)
        }
        return true
      }
    }
    if (PolicyHoldsLogger.isDebugEnabled()) {
      PolicyHoldsLogger.logDebug("(isCovTermIncreased) No increase cov terms for: " + currentCovTerms.map(\ c -> c.DisplayName).join(", "))
    }
    return false
  }

  /**
   * Go through all the policy locations and check to see if any locations match any of the defined policy hold zones
   *
   * @param locations - the array of policy locations
   * @return boolean - true if there is a match with the locations
   */        
  function evaluatePolicyLocations(locations : PolicyLocation[]) : boolean {
    if (this.PolicyHoldZones.IsEmpty) {
      return true
    }
    for (zone in this.PolicyHoldZones) {
      for (loc in locations) {
        if (zone.isLocWithinZone(loc)) {
          return true
        }
      }
    }
    if (PolicyHoldsLogger.isDebugEnabled()) {
      PolicyHoldsLogger.logDebug("(evaluatePolicyLocations) No matching zones for locations: " + locations.map(\ l -> l.DisplayName).join(", "))
    }
    return false
  }
}
