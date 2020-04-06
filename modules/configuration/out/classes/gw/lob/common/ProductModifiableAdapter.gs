package gw.lob.common

uses gw.api.domain.ModifiableAdapter
uses java.util.Date
uses java.lang.UnsupportedOperationException

@Export
class ProductModifiableAdapter implements ModifiableAdapter {
  var _owner : EffectiveDatedFields
  
  construct(owner : EffectiveDatedFields) {
    _owner = owner
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.ProductModifiers
  }

  override property get PolicyLine() : PolicyLine {
    return null
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get State() : Jurisdiction {
    return PolicyPeriod.BaseState
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToProductModifiers(element as ProductModifier)
  }

  override function createRawModifier() : Modifier {
    return new ProductModifier(_owner.Branch)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromProductModifiers(element as ProductModifier)
  }

  override function postUpdateModifiers() : void {
  }

  override property get ReferenceDateInternal() : Date {
    throw new UnsupportedOperationException(displaykey.ModifiableAdapter.Error.ReferenceDateNotPersisted)
  }
  
  override property set ReferenceDateInternal(date : Date) {
    throw new UnsupportedOperationException(displaykey.ModifiableAdapter.Error.ReferenceDateNotPersisted)
  }
}
