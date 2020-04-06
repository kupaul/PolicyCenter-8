package gw.lob.pa
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class PersonalVehicleCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : PersonalVehicleCov  
  
  construct(owner : PersonalVehicleCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.PersonalVehicle.PALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.PersonalVehicle.PALine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.PersonalVehicle)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.PersonalVehicle.addToCoverages( p0 as PersonalVehicleCov )
  }

  override function removeFromParent() : void
  {
    _owner.PersonalVehicle.removeFromCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.PersonalVehicle.GarageLocation)
  }

}
