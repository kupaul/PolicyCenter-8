package gw.lob.gl
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class GLLineSchCovItemCovCoverageAdapter extends CoverageAdapterBase {
  var _owner : GLLineSchCovItemCov
  
  construct(owner : GLLineSchCovItemCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return PolicyLine.BaseState
  }

  override property get OwningCoverable() : Coverable {
    return _owner.GLLineScheduleCovItem
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.GLLineScheduleCovItem.Schedule.GLLine
  }

  override function removeFromParent() : void {
    _owner.GLLineScheduleCovItem.removeCoverageFromCoverable(_owner)
  }

  override function addToCoverageArray(p0 : Coverage) {
    //Do nothing
  }
  
  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }
}

