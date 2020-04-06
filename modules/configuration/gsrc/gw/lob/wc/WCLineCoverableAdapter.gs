package gw.lob.wc

uses entity.WorkersCompLine

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class WCLineCoverableAdapter implements CoverableAdapter {
  var _owner : WorkersCompLine

  construct(owner : WorkersCompLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    //assumption is that WC is never in a package
    return _owner.Branch.PolicyLocations
  }

  override property get State() : Jurisdiction{
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.WCLineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToWCLineCoverages( p0 as WorkersCompCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromWCLineCoverages( p0 as WorkersCompCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.WCLineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToWCLineExclusions( p0 as WorkersCompExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromWCLineExclusions( p0 as WorkersCompExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.WCLineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToWCLineConditions( p0 as WorkersCompCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromWCLineConditions( p0 as WorkersCompCond )
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }

  override property set ReferenceDateInternal( date : Date ) {
    _owner.ReferenceDateInternal = date
  }

  override property get DefaultCurrency() : Currency {
    return _owner.Branch.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_WC).AllowedCurrencies
  }
}