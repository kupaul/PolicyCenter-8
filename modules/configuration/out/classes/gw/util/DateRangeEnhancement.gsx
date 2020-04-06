package gw.util

enhancement DateRangeEnhancement : gw.util.DateRange {
  function overlaps(otherRange : DateRange) : boolean {
    return (otherRange.start < this.end) and (otherRange.end > this.start)
  }

  property get LeapDaysInInterval() : int {
    var earlier = this._start
    var later = this._end
    
    if(earlier.compareTo(later) > 0){
      earlier = this._end
      later = this._start  
    }
    
    return com.guidewire.pl.system.util.DateRange.allDatesIncluding(earlier, later).NumOfLeapYearDays    
  }  
  
}
