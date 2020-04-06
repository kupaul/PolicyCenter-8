package gw.lob.cp
uses gw.coverage.CoverageAdapterBase

@Export
class CommercialPropertyCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : CommercialPropertyCov
  
  construct(owner : CommercialPropertyCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.CPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.CPLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.CPLine)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.CPLine.addToCPLineCoverages( p0 as CommercialPropertyCov )
  }

  override function removeFromParent() : void
  {
    _owner.CPLine.removeFromCPLineCoverages( _owner )
  }

}
