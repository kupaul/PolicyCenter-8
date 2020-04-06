package gw.lob.cp
uses gw.api.domain.ModifiableAdapter
uses java.util.Date

@Export
class CPLineModifiableAdapter implements ModifiableAdapter {
  var _owner : CommercialPropertyLine
  
  construct(owner : CommercialPropertyLine) {
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
    return _owner.CPModifiers
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToCPModifiers(element as CPModifier)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromCPModifiers(element as CPModifier)
  }

  override function createRawModifier() : Modifier {
    return new CPModifier(_owner.Branch)
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
