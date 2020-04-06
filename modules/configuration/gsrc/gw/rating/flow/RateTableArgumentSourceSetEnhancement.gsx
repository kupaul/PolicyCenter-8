package gw.rating.flow

uses gw.api.database.Query
uses java.util.Set

enhancement RateTableArgumentSourceSetEnhancement : entity.RateTableArgumentSourceSet {

  /**
   * Used to check whether or not the associated rate table argument set is in use by
   * a rate routine which is referenced in a promoted (non-draft) rate book.
   *
   * @return Returns true if the rate table argument source set is used in a rate routine
   * referenced in a non-draft (promoted) rate book, else return false.
   */
  function isUsedInPromotedBookViaRoutine() : boolean {
    return statusesOfRateBooksReferencingRoutine().hasMatch(\ r -> r != RateBookStatus.TC_DRAFT)
  }

  /**
   * Used to check whether or not the associated rate table argument set is in use by
   * a rate routine which is referenced in any rate book.
   *
   * @return Returns true if the rate table argument source set is used in a rate routine
   * referenced in any rate book, else return false.
   */
  function isUsedInAnyRateBookViaRateRoutine(): boolean {
    return statusesOfRateBooksReferencingRoutine().HasElements
  }

  /**
   * Determine the set of rate book statuses for the rate books that reference rate
   * routines that use this rate table argument source set.
   *
   * @return Set The set of rate book statuses for rate books that contain rate routines
   *             which use this rate table argument source set.
   */
  private function statusesOfRateBooksReferencingRoutine()  : Set<RateBookStatus> {
    var rateBooksQuery = new Query(RateBook)

    var routineDefQuery = new Query(CalcRoutineDefinition)
        .compare("PolicyLinePatternCode", Equals, this.RateTableDefinition.PolicyLine)

    var routines = routineDefQuery.join(RateBookCalcRoutine, "CalcRoutineDefinition")
        .subselect("RateBook",CompareIn,rateBooksQuery,"ID")
        .select()
        .whereTypeIs(CalcRoutineDefinition)
        
    return routines.where(\ routine -> {
        var steps = routine.Steps
        return steps.hasMatch(\ s -> {
          return s.PrimaryOperand.TableCode == this.RateTableDefinition.TableCode
            and s.PrimaryOperand.ArgumentSources.hasMatch(\ csda -> not csda.OverrideSource) 
            and s.PrimaryOperand.ArgumentSourceSetCode == this.Code
        })
     }).flatMap(\ cr -> cr.RateBooks.map(\ r -> r.Status).toSet()).toSet()
     
  }
}
