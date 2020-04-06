package gw.lob.cp
uses entity.CPBlanketCov
uses gw.coverage.CoverageAdapterBase

@Export
class CPBlanketCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : CPBlanketCov
  
  construct(owner : CPBlanketCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return null // This is correct
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.CPBlanket.PolicyLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.CPBlanket)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.CPBlanket.addToCoverages(p0 as CPBlanketCov )
  }

  override function removeFromParent() : void
  {
    // Do nothing is correct
  }

}
