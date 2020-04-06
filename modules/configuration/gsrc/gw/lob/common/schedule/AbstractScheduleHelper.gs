package gw.lob.common.schedule
uses java.util.ArrayList
uses gw.api.domain.Clause
uses gw.api.productmodel.Schedule

@Export
/**
 * Defines common behaviors for schedule helper classes
*/
abstract class AbstractScheduleHelper<T extends PolicyLine, K extends ScheduledItem> {
  /**
   * Return a list of item scheduled item for a {@link PolicyLine}
   *
   * @param line          the PolicyLine that has 0 to n items
   * @param <K>           the type of elements returned by the returned list
   * @return              a {@link java.util.List} of items that are used by this PolicyLine
  */
  function getScheduledItemsForPolicyLine(line : T) : List<K> {    
    return getScheduledItemsForAllCoverables(line)
  }

  /**
   * Subclasses of this object need to implement this method to return a list of scheduled items
   * used by this PolicyLine
   *
   * @param line          the PolicyLine that has 0 to n items
   * @param <K>           the type of elements returned by the returned list
   * @return              a {@link java.util.List} of items that are used by this PolicyLine
  */
  abstract function getScheduledItemsForAllCoverables(line : T) : List<K>

  /**
   * This is a default implementation that returns the <code>Coverages</code>, <code>Conditions</code>
   * and <code>Exclusions</code> used by a <code>Coverable</code>
   *
   * @param aCoverable    the Coverable that has 0 to n items
   * @param <K>           the type of elements returned by the returned list
   * @return              a {@link java.util.List} of items that are used by this Coverable
  */
  function getScheduledItemsForCoverable(aCoverable : Coverable) :  List<K> {
    var results = new ArrayList<K>()
    results.addAll(iterateAndDowncastSchedules(aCoverable.CoveragesFromCoverable))
    results.addAll(iterateAndDowncastSchedules(aCoverable.ConditionsFromCoverable))
    results.addAll(iterateAndDowncastSchedules(aCoverable.ExclusionsFromCoverable))
    return results
  }

  /**
   * Subclasses of this object need to implement this method to return a list of current and future scheduled items
   * used by this PolicyLine
   *
   * @param line          the PolicyLine that has 0 to n items
   * @param <K>           the type of elements returned by the returned list
   * @return              a {@link java.util.List} of current and future scheduled items that are used by this Coverable
  */
  abstract function getCurrentAndFutureScheduledItemsForPolicyLine(line : T) : List<K>

  /**
   * This is a default implementation that returns a list of scheduled items used by the clauses downcast to the kind
   * of objects K
   *
   * @param clauseArray   the Clauses that have 0 to n items
   * @param <K>           the type of elements returned by the returned list
   * @return              a {@link java.util.List} of scheduled items used by the any of the clauses in clauseArray
  */
  private function iterateAndDowncastSchedules(clauseArray : Clause[]) : List<K> {
    var results = new ArrayList<K>()
    for (aClause in clauseArray){
      if (Schedule.Type.isAssignableFrom(typeof aClause)){
        var items = (aClause as Schedule).ScheduledItems
        items.each(\il-> results.add(il as K))
      }
    }
    return results
  }
  
}
