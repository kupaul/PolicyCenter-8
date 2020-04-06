package gw.lob.im.ar

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class IMAccountsRecPartCoverableAdapter  implements CoverableAdapter {
  var _owner : IMAccountsRecPart

  construct(owner : IMAccountsRecPart) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.InlandMarineLine
  }

  override property get PolicyLocations() : PolicyLocation[] {
    var arlocs = _owner.IMAccountsReceivables*.IMBuilding*.IMLocation*.Location
    // only return the unique policy locations
    return _owner.Branch.PolicyLocations.where(\ p -> arlocs.contains (p))
  }

  override property get State() : Jurisdiction {
    return _owner.InlandMarineLine.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.IMAccountsRecPartCovs
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToIMAccountsRecPartCovs( p0 as IMAccountsRecPartCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromIMAccountsRecPartCovs( p0 as IMAccountsRecPartCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.IMAccountsRecPartExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToIMAccountsRecPartExclusions( p0 as IMAccountsRecPartExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromIMAccountsRecPartExclusions( p0 as IMAccountsRecPartExcl )
  }

  override property get AllConditions() : PolicyCondition[]
  {
    return _owner.IMAccountsRecPartConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToIMAccountsRecPartConditions( p0 as IMAccountsRecPartCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromIMAccountsRecPartConditions( p0 as IMAccountsRecPartCond )
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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_IM).AllowedCurrencies
  }
}