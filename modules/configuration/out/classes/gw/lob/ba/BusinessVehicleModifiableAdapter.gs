package gw.lob.ba
uses gw.api.domain.ModifiableAdapter
uses gw.api.util.JurisdictionMappingUtil
uses java.util.Date

@Export
class BusinessVehicleModifiableAdapter implements ModifiableAdapter {
  var _owner : BusinessVehicle
  
  construct(owner : BusinessVehicle) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BALine
  }

  override property get PolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }

  override property get State() : Jurisdiction {
    var retVal : Jurisdiction
    if(_owner.Location != null){
      retVal = JurisdictionMappingUtil.getJurisdiction(_owner.Location)
    }
    return(retVal)
  }

  override property get AllModifiers() : Modifier[] {
    return _owner.BusinessVehicleModifiers
  }

  override function addToModifiers(element : Modifier ) {
    _owner.addToBusinessVehicleModifiers(element as BusinessVehicleModifier)
  }

  override function removeFromModifiers(element : Modifier ) {
    _owner.removeFromBusinessVehicleModifiers(element as BusinessVehicleModifier)
  }  

  override function createRawModifier() : Modifier {
    return new BusinessVehicleModifier(_owner.Branch)
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
