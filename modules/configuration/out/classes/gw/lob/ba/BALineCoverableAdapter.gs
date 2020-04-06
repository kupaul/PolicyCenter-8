package gw.lob.ba

uses entity.BusinessAutoLine

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class BALineCoverableAdapter implements CoverableAdapter {
  var _owner : BusinessAutoLine

  construct(owner : BusinessAutoLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    return _owner.Branch.PolicyLocations
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.BALineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToBALineCoverages( p0 as BusinessAutoCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromBALineCoverages( p0 as BusinessAutoCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.BALineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToBALineExclusions( p0 as BusinessAutoExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromBALineExclusions( p0 as BusinessAutoExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.BALineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToBALineConditions( p0 as BusinessAutoCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromBALineConditions( p0 as BusinessAutoCond )
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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_BA).AllowedCurrencies
  }
}
