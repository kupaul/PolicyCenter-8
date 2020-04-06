package gw.lob.ba

uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BusinessVehicleCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : BusinessVehicleCov
  
  construct(owner : BusinessVehicleCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return null
  }

  override property get PolicyLine() : PolicyLine
  {
    var retVal : PolicyLine
    if(_owner.Vehicle != null){
      retVal = _owner.Vehicle.PolicyLine
    }
    return(retVal)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.Vehicle)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.Vehicle.addToCoverages( p0  as BusinessVehicleCov )
  }

  override function removeFromParent() : void
  {
    _owner.Vehicle.removeCoverageFromCoverable( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
