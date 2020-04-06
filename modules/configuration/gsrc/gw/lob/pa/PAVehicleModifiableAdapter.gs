package gw.lob.pa
uses gw.api.domain.ModifiableAdapter
uses gw.api.util.JurisdictionMappingUtil
uses java.util.Date

@Export
class PAVehicleModifiableAdapter implements ModifiableAdapter {
  var _owner : PersonalVehicle
  
  construct(owner : PersonalVehicle) {
    _owner = owner
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.PAVehicleModifiers
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.PALine
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return PolicyLine.Branch
  }

  override property get State() : Jurisdiction {
    return JurisdictionMappingUtil.getJurisdiction(_owner.GarageLocation)
  }

  override function addToModifiers(element : Modifier) {
    _owner.addToPAVehicleModifiers(element as PAVehicleModifier)
  }

  override function createRawModifier() : Modifier {
    return new PAVehicleModifier(_owner.PALine.Branch)
  }

  override function removeFromModifiers(element : Modifier) {
    _owner.removeFromPAVehicleModifiers(element as PAVehicleModifier)
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
