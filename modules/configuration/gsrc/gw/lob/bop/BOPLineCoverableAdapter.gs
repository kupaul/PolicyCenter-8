package gw.lob.bop

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class BOPLineCoverableAdapter implements CoverableAdapter {

  var _owner : BusinessOwnersLine

  construct(owner : BusinessOwnersLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    return _owner.BOPLocations*.Location
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.BOPLineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToBOPLineCoverages( p0 as BusinessOwnersCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromBOPLineCoverages( p0 as BusinessOwnersCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.BOPLineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToBOPLineExclusions( p0 as BusinessOwnersExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromBOPLineExclusions( p0 as BusinessOwnersExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.BOPLineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToBOPLineConditions( p0 as BusinessOwnersCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromBOPLineConditions( p0 as BusinessOwnersCond )
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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_BOP).AllowedCurrencies
  }
}
