package gw.lob.gl.schedule
uses gw.lob.common.schedule.AbstractScheduleHelper
uses java.util.ArrayList
uses java.util.LinkedHashSet
uses gw.api.domain.Clause
uses gw.api.productmodel.Schedule

@Export
class GLScheduleHelper extends AbstractScheduleHelper<GeneralLiabilityLine, ScheduledItem>{
  
  override function getScheduledItemsForAllCoverables(line : GeneralLiabilityLine) : List<ScheduledItem> {
    var allItems = new ArrayList<ScheduledItem>()
    
    allItems.addAll(getScheduledItemsForCoverable(line))
    return allItems
  }

  override function getCurrentAndFutureScheduledItemsForPolicyLine(line : GeneralLiabilityLine) : List<ScheduledItem> {
    var allItems = new ArrayList<ScheduledItem>()
    var editEffectiveDates = line.Branch.AllEffectiveDates.where(\ d -> d.afterOrEqual(line.Branch.EditEffectiveDate)).toList()
    var lineVersionList = line.getVersionsOnDates<GeneralLiabilityLine>(editEffectiveDates)
    for (var lineVersion in lineVersionList) {
      allItems.addAll(getScheduledItemsForAllCoverables(lineVersion))
    }        
    var uniqueItems = new LinkedHashSet<ScheduledItem>(allItems)
    return uniqueItems.toList()
  }

  /**
   * A convenience function that looks through the passed array safely checking if each element is a Schedule.
   * It then returns an array of the schedules.
   *
   * @param clauses The array of potential schedules to filter
   */
  static function filterSchedules(clauses : Clause[]) : Schedule[] {
    var schedules : List<Schedule> = {}
    clauses.each(\ clause -> {
      if (clause typeis Schedule) {
        schedules.add(clause)
      }
    })
    return schedules.toTypedArray()
  }

  /**
   * A convenience function that looks through the passed array safely checking if each element is a Schedule.
   * It then returns an array of the schedule coverages with cov terms.
   *
   * @param coverages The array of coverages to filter
   */
  static function filterScheduleCovsWithCovTerms(coverages : Coverage[]) : Schedule[] {
    var schedules : List<Schedule> = {}
    coverages.each(\ cov -> {
      if (cov typeis Schedule) {
        if (cov.ScheduledItemMultiPatterns != null) {
          schedules.add(cov)
        }
      }
    })
    return schedules.toTypedArray()
  }
    
  /**
   * A convenience function that looks through the passed array of coverages
   * It then returns an array of coverages and schedule coverages with no cov terms.
   *
   * @param coverages The array of coverages to filter
   */
  static function filterCoveragesAndScheduleCovsWithNoCovTerms(coverages : Coverage[]) : Coverage[] {
    var covAndSchCovWithNoCovTerms : List<Coverage> = {}
    coverages.each(\ cov -> {
      if (cov typeis Schedule) {
        if (cov.ScheduledItemMultiPatterns == null) {
          covAndSchCovWithNoCovTerms.add(cov)
        }
      } else {
        covAndSchCovWithNoCovTerms.add(cov)
      }
    })
    return covAndSchCovWithNoCovTerms.toTypedArray()
  }  
}
  
