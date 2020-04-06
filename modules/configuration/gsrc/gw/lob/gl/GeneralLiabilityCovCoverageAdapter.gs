package gw.lob.gl
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class GeneralLiabilityCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : GeneralLiabilityCov
  
  construct(owner : GeneralLiabilityCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.GLLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.GLLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.GLLine)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.GLLine.addToGLLineCoverages( p0 as GeneralLiabilityCov )
  }

  override function removeFromParent() : void
  {
    _owner.GLLine.removeFromGLLineCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
