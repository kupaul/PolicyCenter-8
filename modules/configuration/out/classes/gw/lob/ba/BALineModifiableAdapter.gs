package gw.lob.ba
uses gw.api.domain.ModifiableAdapter
uses entity.BusinessAutoLine
uses java.util.Date

@Export
class BALineModifiableAdapter implements ModifiableAdapter {
  var _owner : BusinessAutoLine
  
  construct(owner : BusinessAutoLine) {
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
    return _owner.BAModifiers
  }

  override function addToModifiers(element : Modifier ) {
    _owner.addToBAModifiers(element as BAModifier)
  }

  override function removeFromModifiers(element : Modifier ) {
    _owner.removeFromBAModifiers(element as BAModifier)
  }  

  override function createRawModifier() : Modifier {
    return new BAModifier(_owner.Branch)
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
