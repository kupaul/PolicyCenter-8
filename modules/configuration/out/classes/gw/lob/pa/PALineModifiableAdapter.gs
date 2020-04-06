package gw.lob.pa
uses gw.api.domain.ModifiableAdapter
uses entity.PersonalAutoLine
uses java.util.Date

@Export
class PALineModifiableAdapter implements ModifiableAdapter {
  var _owner : PersonalAutoLine
  
  construct(owner : PersonalAutoLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return PolicyLine.Branch
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.PAModifiers
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToPAModifiers(element as PAModifier)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromPAModifiers(element as PAModifier)
  }

  override function createRawModifier() : Modifier {
    return new PAModifier(_owner.Branch)
  }

  override function postUpdateModifiers() : void {
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }
  
  override property set ReferenceDateInternal(date : Date) {
    _owner.ReferenceDateInternal = date
  }
}
