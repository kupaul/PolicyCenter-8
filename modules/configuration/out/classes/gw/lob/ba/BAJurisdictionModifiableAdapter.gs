package gw.lob.ba
uses gw.api.domain.ModifiableAdapter
uses java.util.Date

@Export
class BAJurisdictionModifiableAdapter implements ModifiableAdapter {
  var _owner : BAJurisdiction
  
  construct(owner : BAJurisdiction) {
    _owner = owner
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.BAJurisModifiers
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BALine
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }

  override property set ReferenceDateInternal(date : Date) {
    _owner.ReferenceDateInternal = date
  }

  override property get State() : Jurisdiction{
    return _owner.State
  }

  override function addToModifiers(p0 : Modifier) {
    _owner.addToBAJurisModifiers(p0 as BAJurisModifier)
  }

  override function createRawModifier() : Modifier {
    return new BAJurisModifier(_owner.Branch)
  }

  override function postUpdateModifiers() {
  }

  override function removeFromModifiers(p0 : Modifier) {
    _owner.removeFromBAJurisModifiers(p0 as BAJurisModifier)
  }
}
