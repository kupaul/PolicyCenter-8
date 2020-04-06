package gw.note

uses gw.api.copy.Copier

/**
 * Copies a {@link Note} onto a policyPeriod. 
 */
@Export
class NoteCopier extends Copier<PolicyPeriod> {
  var _sourceNote : Note

  construct(sourceNote : Note) {
    _sourceNote = sourceNote
  }
  

  override property get Source() : Note {
    return _sourceNote
  }

  override function copy(target : PolicyPeriod) {
    var note = target.Job.newNote()
    note.Body = Source.Body
    note.Subject = Source.Subject
    note.SecurityType = Source.SecurityType
    note.Topic = Source.Topic
  }
}



