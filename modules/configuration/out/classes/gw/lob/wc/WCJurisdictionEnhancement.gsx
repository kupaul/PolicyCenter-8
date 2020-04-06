package gw.lob.wc

uses com.guidewire.pl.system.util.DateTimeUtil
uses java.util.Date
uses java.util.ArrayList
uses java.lang.IllegalStateException
uses org.apache.commons.lang.StringUtils
uses java.util.Calendar
uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses gw.api.util.DateUtil
uses gw.lob.wc.rating.WCRatingPeriod
uses gw.api.domain.StateSet
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.api.util.DisplayableException
uses java.util.HashMap
uses gw.api.productmodel.ModifierPattern

enhancement WCJurisdictionEnhancement: WCJurisdiction {
  property get AnniversaryDate(): Date {
    return this.getFieldValue("AnniversaryDateInternal") as Date
  }

  /**
   * Sets the anniversary date on this policy line and adds or modifies an
   * anniversary-type {@link com.guidewire.pc.domain.policy.lines.wc.RatingPeriodStartDate}
   * (RPSD) to the PolicyPeriod if required. <p/> <p><b>Side Effects:</p> May
   * add a new RPSD to the policy period, or change an existng anniversary-type
   * RPSD. Use {@link com.guidewire.pc.domain.policy.lines.wc.WorkersCompLine#setFieldValue} if the side effects are not
   * desired.
   */
  property set AnniversaryDate(value: Date) {
    if (value == null) {
      throw new DisplayableException(displaykey.Java.Job.WC.AnniversaryNotNull)
    }

    var periodStart = getPeriodStart()
    var newAnniversary = DateTimeUtil.setHourMinuteSecondFromDate(value, periodStart)

    if (newAnniversary > periodStart) {
      newAnniversary = periodStart
    }
    // find the anniversary date for this period
    if (newAnniversary < periodStart.addYears(- 1)) {
      newAnniversary = newAnniversary.addYears(1)
    }

    this.getSlice(this.EffectiveDate).setFieldValue("AnniversaryDateInternal", newAnniversary)
    // Either anniversary date change or policy period effective window change (eg. renewal, cancel),
    // we'll have to update the RPSDs
    var existingSplits = new HashMap<Date, RatingPeriodStartDate>()
    var existingAnniversarySplit: entity.RatingPeriodStartDate
    for (rpsd in this.RatingPeriodStartDates) {
      if (rpsd.Type == TC_ANNIVERSARY) {
        existingAnniversarySplit = rpsd
      } else {
        existingSplits.put(rpsd.StartDate, rpsd)
      }
    }
    // Add new RPSDs
    var splitDate = newAnniversary.addYears(1)
    if (splitDate <> existingAnniversarySplit.StartDate){
      var otherSplit = existingSplits.get(splitDate)
      if (otherSplit <> null) {
        // AnniversaryDate should take priority
        otherSplit.getSlice(otherSplit.EffectiveDate).Type = TC_ANNIVERSARY
      } else if (newAnniversary <> periodStart and canAddRPSD(splitDate) == null){
        addRatingPeriodStartDate(splitDate, TC_ANNIVERSARY)
      }
      // Removing irrelavent RPSDs
      if (existingAnniversarySplit <> null){
        existingAnniversarySplit.getSlice(existingAnniversarySplit.EffectiveDate).remove()
      }
    }
  }

  property get ReferenceDate(): Date {
    return this.getFieldValue("ReferenceDateInternal") as Date
  }

  /**
   * @see get AnniversaryDate
   */
  property set ReferenceDate(refDate: Date) {
    this.getSlice(this.EffectiveDate).setFieldValue("ReferenceDateInternal", refDate)
  }

  property get AllModifierVersions(): List<WCModifier> {
    return this.VersionList.WCModifiers.flatMap(\w -> w.AllVersions)
  }

  property get AllCoverageVersions(): List<WCStateCov> {
    return this.VersionList.Coverages.flatMap(\w -> w.AllVersions)
  }

  /**
   * Indicates whether or not this jurisdiction can be removed.  A jurisidiction can only be removed if it has no covered employees at 
   * any point during the policy and if it is not used by the primary location
   */
  property get CanRemove(): boolean {
    var usedByPrimaryLoc = this.WCLine.Branch.PrimaryLocation.State.Code == this.State.Code
    return !usedByPrimaryLoc and this.WCLine.getWCCoveredEmployeesWM(this.State).IsEmpty
  }

  function adjustAnniversaryDate() {
    var policyStart = this.WCLine.Branch.PeriodStart.trimToMidnight()
    if (this.AnniversaryDate.addYears(1) < policyStart) {
      this.AnniversaryDate = policyStart
    }
  }

  function removeRatingPeriodStartDate(date: Date, type: RPSDType) {
    var rpsd = getRPSD(date, type)
    if (rpsd == null) {
      return
    } else {
      rpsd.getSlice(rpsd.EffectiveDate).remove()
    }
  }

  function getSortedRPSDs(): RatingPeriodStartDate[] {
    var ratingPeriodsList = innerGetUnsortedRPSDs(null, null)
    ratingPeriodsList = ratingPeriodsList.sortBy(\rpsd -> rpsd.StartDate)
    return ratingPeriodsList.toTypedArray()
  }

  function getSortedRPSDs(type: RPSDType): RatingPeriodStartDate[] {
    var ratingPeriodsList = innerGetUnsortedRPSDs(null, type)
    ratingPeriodsList = ratingPeriodsList.sortBy(\rpsd -> rpsd.StartDate)
    return ratingPeriodsList.toTypedArray()
  }

  function hasRPSDOnDate(startDate: Date): boolean {
    var ratingPeriodsList = innerGetUnsortedRPSDs(startDate, null)
    return not ratingPeriodsList.isEmpty()
  }

  function getRPSD(startDate: Date, type: RPSDType): RatingPeriodStartDate {
    var ratingPeriodsList = innerGetUnsortedRPSDs(startDate, type)
    if (ratingPeriodsList.isEmpty()) {
      return null
    } else if (ratingPeriodsList.size() > 1) {
      throw new IllegalStateException(displaykey.WorkersComp.Jurisdiction.MultipleRPSDs(startDate, type))
    } else {
      return ratingPeriodsList.get(0)
    }
  }

  function getPriorRatingDate(date: Date): Date {
    checkIncludesDateIgnoreTime(date)
    var _sortedRPSDs = getSortedRPSDs()
    var ratingDateList = new ArrayList<Date>()
    var anniversary: Date = null

    for (rpsd in _sortedRPSDs) {
      var type = rpsd.getType()
      if (type == RPSDType.TC_FORCEDRERATING) {
        ratingDateList.add(rpsd.getStartDate())
      }
      if (type == RPSDType.TC_ANNIVERSARY) {
        ratingDateList.add(rpsd.getStartDate())
        anniversary = rpsd.getStartDate()
      }
    }
    if (anniversary == null and this.WCLine != null) {
      var effDate = getPeriodStart()
      var wcAnni = this.getAnniversaryDate()
      if (wcAnni != null) {
        if (effDate.before(wcAnni)) {
          wcAnni = calculateUpcomingAnniversaryDate()
        }
        if (effDate != wcAnni) {
          anniversary = wcAnni.addYears(1)
        }
      }
    }
    if (anniversary != null) {
      ratingDateList.add(0, anniversary.addYears(- 1))
    } else {
      ratingDateList.add(0, getPeriodStart())
    }
    ratingDateList.add(getPeriodEnd())
    if (ratingDateList.size() > 0) {
      for (i in 0..|(ratingDateList.size() - 1)) {
        var date1 = ratingDateList.get(i)
        var date2 = ratingDateList.get(i + 1)
        if (DateUtil.compareIgnoreTime(date, date1) >= 0 and DateUtil.compareIgnoreTime(date, date2) < 0) {
          return date1
        }
      }
    }
    throw new IllegalStateException(displaykey.WorkersComp.Jurisdiction.NoDateFound(date, StringUtils.join(ratingDateList.iterator(), ", ")))
  }

  function calculateUpcomingAnniversaryDate(): Date {
    var anniversaryCal = getTrimmedCalendar(this.getAnniversaryDate())
    var effectiveCal = getTrimmedCalendar(getPeriodStart())
    setAnniversaryYear(anniversaryCal, effectiveCal)
    return anniversaryCal.getTime()
  }

  /**
   * Return the rating periods in this jurisdiction that are in-force (not completely canceled
   * or hidden by an audit window).  The rating periods are sorted by start date.
   */
  property get InForceRatingPeriods(): List<WCRatingPeriod>
  {
    return RatingPeriods.where(\rp -> rp.NumRatingDays > 0).toList()
  }

  /**
   * Return the rating periods in this jurisdiction sorted by start date.  For example,
   * if a jurisdiction has a forced rerating date, followed by an anniversary date,
   * this will return three rating periods:<ul><li>[PolicyPeriodStart-RerateDate),
   * <li>[RerateDate-AnniversaryDate),
   * <li>[AnniversaryDate-PolicyPeriodEnd)
   * </ul>
   * A jurisdiction without any rating period start dates will only return one rating period
   * [PolicyPeriodStart-PolicyPeriodEnd).
   */
  property get RatingPeriods(): List<WCRatingPeriod> {
    return createRatingPeriods(SplitDates)
  }

  /**
   * Sorted list of the dates this period is splitted on
   */
  property get SplitDates(): List<Date> {
    var rpsds = this.VersionList.RatingPeriodStartDates
        .map(\rpsd -> rpsd.AllVersions.single().StartDate)
    rpsds.add(this.Branch.PeriodStart)
    rpsds.add(this.Branch.PeriodEnd)
    return rpsds.sort()
  }

  property get AuditRatingPeriods(): List<WCRatingPeriod> {
    var start = this.Branch.Audit.AuditInformation.AuditPeriodStartDate
    var end = this.Branch.Audit.AuditInformation.AuditPeriodEndDate
    var rpsds = this.getRatingPeriodStartDates().map(\rpsd -> rpsd.StartDate).where(\d -> d > start and d < end).toList()
    rpsds.add(start)
    rpsds.add(end)
    var sortedRPSDs = rpsds.sort()
    return createRatingPeriods(sortedRPSDs)
  }

  /**
   * If cannot add RPSD, return error message. This is used in UI as well.
   */
  function canAddRPSD(date: Date): String {
    // this compare is based on assumption that all RPSD has the same time as the period start
    if (SplitDates.hasMatch(\r -> r == date)){
      return displaykey.Web.Policy.WC.DuplicatedDate(this.State, date.ShortFormat)
    }
    if (not this.Branch.includes(date)) {
      return displaykey.Java.Job.WC.RPSDOutsidePeriod(date, getPeriodStart(), getPeriodEnd())
    }
    return null
  }

  function addRatingPeriodStartDateWithNoARDCheck(splitDate: Date, type: RPSDType): RatingPeriodStartDate {
    var date = DateTimeUtil.setHourMinuteSecondFromDate(splitDate, getPeriodStart())
    var rpsd = new RatingPeriodStartDate(this.Branch)
    rpsd.StartDate = date
    rpsd.Type = type
    this.addToRatingPeriodStartDates(rpsd)
    rpsd = rpsd.getUnsliced()
    rpsd.EffectiveDate = getPeriodStart()
    return rpsd
  }

  function addRatingPeriodStartDate(splitDate: Date, type: RPSDType): RatingPeriodStartDate {
    var date = DateTimeUtil.setHourMinuteSecondFromDate(splitDate, getPeriodStart())
    var rpsdErrorMsg = canAddRPSD(date)
    if (rpsdErrorMsg <> null){
      throw new DisplayableException(rpsdErrorMsg)
    }
    return addRatingPeriodStartDateWithNoARDCheck(splitDate, type)
  }

  function getRatingPeriodStartDates(): RatingPeriodStartDate[] {
    return this.VersionList.RatingPeriodStartDates
        .map(\r -> r.AllVersions.single()).toTypedArray()
  }

  function splitModifiers() {
    updateSplitsOnEffDatedBeans(this.VersionList.WCModifiers, \e -> {
      var pattern = (e as WCModifier).Pattern as ModifierPattern
      return pattern.SplitOnAnniversary
    })
    // split rate factors
    for (modifier in this.VersionList.WCModifiers) {
      var pattern = modifier.AllVersions.first().Pattern
      updateSplitsOnEffDatedBeans(modifier.WCRateFactors, \r -> {
        return (pattern as ModifierPattern).SplitOnAnniversary
      })
    }
  }

  function joinExposures(allVersions: List<EffDated>) {
    var arrow = 0
    var dot = 1
    while (dot < allVersions.size()) {
      var bean1 = allVersions.get(arrow) as WCCoveredEmployeeBase
      var bean2 = allVersions.get(dot) as WCCoveredEmployeeBase
      if (bean1.ExpirationDate == bean2.EffectiveDate and not hasRPSDOnDate(bean1.ExpirationDate)) {
        // Override automatic basis calculation. If we just relied on them
        // being scaled automatically then we'd get rounding errors.
        // instead we'll add them up and use that new value. Alternatively
        // we could store a denormalized basis amount as a double and scale
        // that to get the correct value.
        var newBasis = bean1.BasisAmount + bean2.BasisAmount
        bean1.ExpirationDate = bean2.ExpirationDate
        bean2.ExpirationDate = bean2.EffectiveDate
        bean1.BasisAmount = newBasis
        dot = dot + 1
      } else {
        arrow = dot
        dot = arrow + 1
      }
    }
  }

  function splitCoverages() {
    updateSplitsOnEffDatedBeans(this.VersionList.Coverages, \e -> true)
  }

  function updateRPSDsAfterPeriodChange(oldPeriodStart: Date) {
    var periodStart = getPeriodStart()
    var periodEnd = getPeriodEnd()
    var ratingPeriodStartDates = this.VersionList.RatingPeriodStartDates
    for (rpsdVL in ratingPeriodStartDates) {
      var versions = rpsdVL.AllVersions
      if (versions.size() != 1) {
        throw new IllegalStateException(displaykey.WorkersComp.Jurisdiction.CannotSplitRPSD)
      }
      var rpsd = versions.get(0).getUnslicedUntyped() as RatingPeriodStartDate
      if (DateUtil.compareIgnoreTime(rpsd.getStartDate(), periodStart) <= 0 or DateUtil.compareIgnoreTime(rpsd.getStartDate(), periodEnd) >= 0) {
        rpsd.getSlice(rpsd.EffectiveDate).remove()
      }
    }
    var anniDate = this.getAnniversaryDate()
    if (anniDate != null and DateUtil.compareIgnoreTime(anniDate, oldPeriodStart) == 0) {
      this.AnniversaryDate = periodStart
    } else {
      this.AnniversaryDate = anniDate
    }
  }

  function updateRPSDsInNewPeriod() {
    for (oldRPSD in this.BasedOn.RatingPeriodStartDates) {
      var splitDate = oldRPSD.StartDate
      if (oldRPSD.Type <> TC_ANNIVERSARY and this.Branch.includes(splitDate)) {
        // Rewrite Jobs do not need to do check on adding RSPD as the job itself may be on an ARD Date
        this.addRatingPeriodStartDateWithNoARDCheck(splitDate, oldRPSD.Type)
      }
    }
    var oldARD1 = this.getBasedOn().getAnniversaryDate()
    var oldARD2 = DateTimeUtil.addYears(this.getBasedOn().getAnniversaryDate(), 1)
    var periodStart = getPeriodStart()
    if (DateUtil.compareIgnoreTime(periodStart, oldARD2) >= 0) {
      this.AnniversaryDate = periodStart
    } else {
      this.AnniversaryDate = oldARD1
    }
    updateExposures()
  }

  function updateExposures() {
    for (beanVL in this.WCLine.VersionList.WCCoveredEmployees) {
      var beanVersions = beanVL.AllVersions
      var location = beanVersions[0].getLocation()
      if (location != null and location.getState() == StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.getState())) {
        joinExposures(beanVersions)
      }
    }
    splitWCCoveredEmployees()
    // we should not split WCFedCoveredEmployees
  }

  function getPossibleGoverningLaws(): SpecialCov[] {
    var typeKeys = SpecialCov.getTypeKeys(false)
        .where(\typeKey -> typeKey.hasCategory("WorkersComp" as LiabilityAct))
    var monopolisticStates = StateSet.get(StateSet.WC_MONOPOLISTIC)
    if (monopolisticStates.contains(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.State))) {
      typeKeys.remove(SpecialCov.TC_STAT)
      typeKeys.remove(SpecialCov.TC_VOCO)
      typeKeys.remove(SpecialCov.TC_LTDM)
    }
    return typeKeys as SpecialCov[]
  }

  // ---------------------------- Private Helper Methods

  private property get PeriodStart(): Date {
      return this.PolicyLine.Branch.PeriodStart
    }

  private property get PeriodEnd(): Date {
      return this.PolicyLine.Branch.PeriodEnd
    }

  private function checkIncludesDateIgnoreTime(date: Date) {
    if (getPeriodStart().compareIgnoreTime(date) > 0 or getPeriodEnd().compareIgnoreTime(date) <= 0) {
      throw displaykey.WorkersComp.Jurisdiction.DateOutsidePeriod(date, getPeriodStart(), getPeriodEnd())
    }
  }

  private function setAnniversaryYear(anniversaryCal: Calendar, effectiveCal: Calendar) {
    anniversaryCal.set(Calendar.YEAR, effectiveCal.get(Calendar.YEAR))
    var anniDate = anniversaryCal.getTime()
    var effectiveDate = effectiveCal.getTime()
    if (anniDate != effectiveDate
        and anniDate == DateTimeUtil.getEarlierOfTwoDates(anniDate, effectiveDate)) {
      anniversaryCal.add(Calendar.YEAR, 1)
    }
  }

  private function getTrimmedCalendar(date: Date): Calendar {
    if (null == date) {
      return null
    }
    var cal = Calendar.getInstance()
    cal.setTime(DateTimeUtil.trimToDay(date))
    return cal
  }

  private function splitWCCoveredEmployees() {
    var ratingPeriodStartDates = getRatingPeriodStartDates()
    for (rpsd in ratingPeriodStartDates) {
      var wcCoveredEmployeesVLs = this.getWCLine().VersionList.WCCoveredEmployees
      for (wcCoveredEmployeeVL in wcCoveredEmployeesVLs) {
        var allVersions = wcCoveredEmployeeVL.AllVersions
        var location = allVersions.get(0).getLocation()
        if (location != null and location.getState() != StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.getState())) {
          continue
        }
        for (wcCoveredEmployee in allVersions) {
          if (wcCoveredEmployee.isEffective(rpsd.getStartDate())) {
            wcCoveredEmployee.split(rpsd.getStartDate())
          }
        }
      }
    }
  }

  /**
   * Helper: returns the list of RPSDs for this PolicyPeriod, optionally
   * filtered by RPSDType
   *
   * @param startDate if non-null, filters RPSDs by date
   * @param type      if non-null, filters RPSDs by type
   * @return unsorted List of RPSDs
   */
  private function innerGetUnsortedRPSDs(startDate: Date, type: RPSDType): List<RatingPeriodStartDate> {
    var ratingPeriodsList = new ArrayList<RatingPeriodStartDate>()
    var rpsd = this.RatingPeriodStartDates
    for (ratingPeriod in rpsd) {
      if ((startDate == null or startDate == ratingPeriod.getStartDate() ) and
          (type == null or type == ratingPeriod.getType())) {
        ratingPeriodsList.add(ratingPeriod)
      }
    }
    return ratingPeriodsList
  }

  /**
   * Takes the list of version lists, joins the beans where necessary, and then re-splits them as appropriate based on the
   * current set of RPSDs.
   */
  private function updateSplitsOnEffDatedBeans(versionLists: List<EffDatedVersionList>, shouldSplit(bean: EffDated): boolean) {
    var ratingPeriodStartDates = getRatingPeriodStartDates()

    // join all beans that are split with no RPSD
    for (beanVL in versionLists) {
      joinBeans(beanVL.AllVersionsUntyped)
    }

    for (rpsd in ratingPeriodStartDates) {
      var coverageVLs = versionLists
      for (coverageVL in coverageVLs) {
        var allVersions = coverageVL.AllVersionsUntyped
        for (coverage in allVersions) {
          if (shouldSplit(coverage) && coverage.isEffective(rpsd.getStartDate())) {
            coverage.splitUntyped(rpsd.getStartDate())
          }
        }
      }
    }
  }

  /**
   * Given a list of beans that represent the same bean through time, joins adjacent versions if there's
   * currently no RPSD that should separate them.
   */
  private function joinBeans(allVersions: java.util.List<EffDated>) {
    var arrow = 0
    var dot = 1
    while (dot < allVersions.size()) {
      var bean1 = allVersions.get(arrow)
      var bean2 = allVersions.get(dot)
      if (bean1.ExpirationDate == bean2.EffectiveDate and not hasRPSDOnDate(bean1.ExpirationDate)) {
        bean1.ExpirationDate = bean2.ExpirationDate
        bean2.ExpirationDate = bean2.EffectiveDate
        dot = dot + 1
      } else {
        arrow = dot
        dot = arrow + 1
      }
    }
  }

  private function createRatingPeriods(rpsds: List<Date>): List<WCRatingPeriod> {
    var periods = new ArrayList<WCRatingPeriod>()
    if (rpsds.size() > 0) {
      for (i in 0..|(rpsds.size() - 1)) {
        var startDate = rpsds[i]
        var endDate = rpsds[i + 1]
        if (startDate < endDate) {
          periods.add(new WCRatingPeriod(this, startDate, endDate, i + 1))
        }
      }
    }
    return periods
  }
}
