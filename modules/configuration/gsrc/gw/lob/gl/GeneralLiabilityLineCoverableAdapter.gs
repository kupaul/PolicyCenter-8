package gw.lob.gl

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class GeneralLiabilityLineCoverableAdapter implements CoverableAdapter {
  var _owner : GeneralLiabilityLine

  construct(owner : GeneralLiabilityLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    var expolocs = _owner.Exposures*.Location
    // only return the unique policy locations
    return _owner.Branch.PolicyLocations.where(\ p -> expolocs.contains(p))
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.GLLineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToGLLineCoverages( p0 as GeneralLiabilityCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromGLLineCoverages( p0 as GeneralLiabilityCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.GLLineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToGLLineExclusions( p0 as GeneralLiabilityExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromGLLineExclusions( p0 as GeneralLiabilityExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.GLLineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToGLLineConditions( p0 as GeneralLiabilityCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromGLLineConditions( p0 as GeneralLiabilityCond )

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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_GL).AllowedCurrencies
  }
}
