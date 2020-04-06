package gw.util

uses com.guidewire.pl.system.util.DateRange
uses gw.api.effdate.EffDatedUtil
uses gw.api.util.Range
uses java.util.ArrayList
uses java.util.Date
uses java.util.HashSet
uses java.util.Set
uses java.lang.IllegalArgumentException

enhancement EffDatedEnhancement : EffDated
{
  property get EffectiveDateRange() : DateRange{
    return DateRange.allDatesBetween(this.EffectiveDate, this.ExpirationDate)
  }

  property set EffectiveDateRange(range : DateRange) {
    this.EffectiveDate = range.Start
    this.ExpirationDate = range.End
  }

  property get TypeIDString() : String {
    return this.FixedId.Type.Name + ":" + this.FixedId.Value
  }

  /**
   * Call before setting value in Window Mode
   */
  public function assertWindowMode(valueToSet: EffDated) {
    if (this.Slice) {
      throw displaykey.WorkersComp.CoveredEmployee.NotInWindowMode
    }
    if(valueToSet.Slice){
      throw displaykey.WorkersComp.CoveredEmployee.NotInWindowMode
    }
  }

  /**
   * End EffDated in Window Mode
   */
  function endDateWM(editEffDate : Date){
    var allVersions = this.VersionList.AllVersionsUntyped.iterator()
    for(version in allVersions){
      if(editEffDate.after( version.EffectiveDate )){
        if(editEffDate.before( version.ExpirationDate)){
          version.ExpirationDate = editEffDate
        }
      }else{
        version.removeWM()
        return // all subsequent slices will be deleted automatically
      }
    }
  }

  /**
   * Split EffDated in Window Mode
   */
  function splitWM(editEffDate : Date){
    var allVersions = this.VersionList.AllVersionsUntyped
    for(version in allVersions){
      if(version.isEffective( editEffDate )){
        version.splitUntyped( editEffDate )
      }
    }
  }

  /**
   * Get next event date.
   *
   * @param effDate date for which the next event date is returned
   * @return The next event date that occurs after <param>effDate</param>.  If there are no event dates after effDate,
   *         the associated period's end date is returned.
   */
  function getNextEventDate(effDate : Date) : Date {
    var evntDates = this.BranchUntyped.AllEffectiveDates
    for (eventDate in evntDates) {
      if (eventDate > effDate) {
        return eventDate
      }
    }
    return this.BranchUntyped.PeriodEnd
  }

  /**
   * Remove the EffDated in WM
   * @see endDateWM
   */
  function removeWM(){
    this.getSliceUntyped( this.EffectiveDate ).remove()
  }

  /**
   * Removes all slices for the EffDated.
   */
  function removeAllSlicesWM() {
    var firstSlice = this.VersionList.AllVersionsUntyped.first()
    if (firstSlice != null) {
      firstSlice.removeWM()
    }
  }

  /**
   * Removes a chunk from this eff dated.  The EffDated this method is called on must be effective on the start date and
   * have no edits between then and the end date.  Makes changes in window mode.
   *
   * @param start Start date for the chunk to remove.
   * @param end   End date for the chunk to remove.
   */
  function removeChunk(start : Date, end : Date) {
    EffDatedUtil.removeChunk(this, start, end)
  }

  /**
   * Sets the passed field to the passed value between the passed dates.  The EffDated this method is called on must be
   * effective on the start date and have no edits between there and the end date.  If the field is already set to the
   * passed value for the passed date range, no changes will occur.  Makes change in window mode.
   *
   * @param field Name of the field to change.
   * @param value New value for the field.
   * @param start Start date for the field change.
   * @param end   End date for the field change.
   */
  function setFieldValueForChunk(field : String, value : Object, start : Date, end : Date) {
    EffDatedUtil.setFieldValueForChunk(this, field, value, start, end)
  }

  /**
   * Returns <code>true</code> if and only if this EffDated is open for removal in its bundle.
   */
  property get Removed() : boolean {
    return this.Bundle.RemovedBeans.toSet().contains(this)
  }

  /**
   * Returns the slice prior to the passed date with the latest effective date.  If no slice exists with an effective
   * date earlier than the passed date, returns the slice after the passed date with the earliest effective date.  If
   * the EffDated is effective on the passed date, this method will return the same value as the
   * <code>getVersionAsOf()</code> method called on the related <code>VersionList</code>.  If the EffDated is never
   * effective, this method will return <code>null</code>.
   *
   * @param effDate The date of the desired slice.
   * @return The nearest slice to the given date.
   */
  @Deprecated("Depricated in PC8.0.0")
  function getNearestVersionAsOf(effDate : Date) : EffDated {
    var nearestVersion : EffDated = null
    var versions = this.VersionList.AllVersionsUntyped
    for (version in versions) {
      if (version.EffectiveDate <= effDate) {
        nearestVersion = version
      } else {
        if (nearestVersion != null) {
          return nearestVersion
        } else {
          return version
        }
      }
    }
    return nearestVersion
  }

  /**
   * Returns all event dates for the EffDated.  An event date is anywhere where an edit occurs, the EffDated becomes
   * effective, or the EffDated expires.  Since this method returns a set, the results will be unique but unordered.
   *
   * @return All event dates for the EffDated
   */
  property get EventDates() : Set<Date> {
    var dates = new HashSet<Date>()
    this.VersionList.AllVersionsUntyped.each(\ s -> {
      dates.add(s.EffectiveDate)
      dates.add(s.ExpirationDate)
    })
    return dates
  }

  /**
   * Return the date this bean start to exist
   */
  property get EarliestEffectiveDate() : Date{
    return this.VersionList.AllVersionsUntyped.first().EffectiveDate
  }

  /**
   * Return the date this bean cease to exist
   */
  property get LatestExpirationDate() : Date{
    return this.VersionList.AllVersionsUntyped.last().ExpirationDate
  }

  /**
   * Returns the ranges of dates for which this EffDated is effective, ignoring edit dates.
   *
   * @return The contiguous date ranges when this EffDated is effective.
   */
  property get ContiguousDateRanges() : List<Range<Date>> {
    var ranges = new ArrayList<Range<Date>>()
    var start : Date = null
    var end : Date = null
    for (version in this.VersionList.AllVersionsUntyped) {
      if (start == null) {
        // This is the first version, so just copy the dates.
        start = version.EffectiveDate
        end = version.ExpirationDate
      } else if (end == version.EffectiveDate) {
        // These versions are contiguous, so extend the date range.
        end = version.ExpirationDate
      } else {
        // These versions are not contiguous, so add the range to the list of ranges and start a new one.
        ranges.add(Range.closedOpen(start, end))
        start = version.EffectiveDate
        end = version.ExpirationDate
      }
    }
    // Add any remaining ranges.
    if (start != null) {
      ranges.add(Range.closedOpen(start, end))
    }

    return ranges
  }

  /**
   * Return all versions of an exposure except the original (first) version
   */
  property get AdditionalVersions() : EffDated[] {
    var allVersions = this.VersionList.AllVersionsUntyped
    if(allVersions.Count <= 1){
      return new EffDated[0]
    }
    return allVersions.subList( 1, allVersions.Count ).toTypedArray()
  }
}