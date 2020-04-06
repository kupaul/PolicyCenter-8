package gw.lob.pa

uses entity.PersonalAutoLine

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class PALineCoverableAdapter implements CoverableAdapter {
  var _owner : PersonalAutoLine

  construct(owner : PersonalAutoLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    return _owner.GarageLocations
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.PALineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToPALineCoverages( p0 as PersonalAutoCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromPALineCoverages( p0 as PersonalAutoCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.PALineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToPALineExclusions( p0 as PersonalAutoExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromPALineExclusions( p0 as PersonalAutoExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.PALineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToPALineConditions( p0 as PersonalAutoCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromPALineConditions( p0 as PersonalAutoCond )
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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_PA).AllowedCurrencies
  }
}