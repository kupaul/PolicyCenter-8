package gw.lob.gl
uses gw.api.domain.ModifiableAdapter
uses java.util.Date

@Export
class GLLineModifiableAdapter implements ModifiableAdapter {
  var _owner : GeneralLiabilityLine
  
  construct(owner : GeneralLiabilityLine) {
    _owner = owner
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.GLModifiers
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }

  override property set ReferenceDateInternal(value: Date) {
    _owner.ReferenceDateInternal = value
  }

  override property get State() : Jurisdiction{
    return _owner.BaseState
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToGLModifiers(element as GLModifier)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromGLModifiers(element as GLModifier)
  }

  override function createRawModifier() : Modifier {
    return new GLModifier(_owner.Branch)
  }

  override function postUpdateModifiers() {
  }

}
