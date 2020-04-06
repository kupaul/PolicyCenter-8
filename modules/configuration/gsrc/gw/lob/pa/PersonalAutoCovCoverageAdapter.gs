package gw.lob.pa

uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class PersonalAutoCovCoverageAdapter extends CoverageAdapterBase
{ 
  var _owner : PersonalAutoCov
  
  construct(owner : PersonalAutoCov)  
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.PALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.PALine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.PALine)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.PALine.addToPALineCoverages( p0 as PersonalAutoCov )
  }

  override function removeFromParent() : void
  {
    _owner.PALine.removeFromPALineCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}