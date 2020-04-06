package gw.lob.bop
uses gw.api.domain.ModifiableAdapter
uses java.util.Date

@Export
class BOPLineModifiableAdapter implements ModifiableAdapter {
  var _owner : BusinessOwnersLine
  
  construct(owner : BusinessOwnersLine) {
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
    return _owner.BOPModifiers
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToBOPModifiers(element as BOPModifier)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromBOPModifiers(element as BOPModifier)
  }

  override function createRawModifier() : Modifier {
    return new BOPModifier(_owner.Branch)
  }

  override function postUpdateModifiers() {
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }
  
  override property set ReferenceDateInternal(date : Date) {
    _owner.ReferenceDateInternal = date
  }
}
