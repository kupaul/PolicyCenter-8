package gw.note
uses gw.api.copy.GroupingCompositeCopier

/**
 * A copier for copying all {@link entity.Note}s associated with a policy.  
 * This copier delegates to {@link NoteCopier} for actually copying the 
 * contents of each individual note.
 */
@Export
class AllNoteCopier extends GroupingCompositeCopier<NoteCopier, PolicyPeriod> {

  var _period : PolicyPeriod as readonly Source
  
  construct(thePeriod : PolicyPeriod) {
    _period = thePeriod
    var notes = _period.Policy.getAllNotesForView()
    var noteCopiers = notes.map(\ n -> new NoteCopier(n) ).toList()
    addAllCopiers(noteCopiers.toList())
  }

}
