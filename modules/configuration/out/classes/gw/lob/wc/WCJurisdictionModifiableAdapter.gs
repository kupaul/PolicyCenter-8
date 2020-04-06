package gw.lob.wc
uses gw.api.domain.ModifiableAdapter
uses java.util.Date

@Export
class WCJurisdictionModifiableAdapter implements ModifiableAdapter {
  var _owner : WCJurisdiction
  
  construct(owner : WCJurisdiction) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.WCLine
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return PolicyLine.Branch
  }

  override property get State() : Jurisdiction{
    return _owner.State
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.WCModifiers
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToWCModifiers(element as WCModifier)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromWCModifiers(element as WCModifier)
  }

  override function createRawModifier() : Modifier {
    return new WCModifier(_owner.Branch)
  }

  override function postUpdateModifiers() {
    _owner.splitModifiers()
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDate
  }
  
  override property set ReferenceDateInternal(date : Date) {
    _owner.ReferenceDate = date
  }
}
