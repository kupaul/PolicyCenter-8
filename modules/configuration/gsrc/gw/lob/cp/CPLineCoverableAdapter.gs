package gw.lob.cp

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.api.productmodel.PolicyLinePattern
uses gw.pc.policy.typekey.InstalledPolicyLine
uses gw.policy.PolicyLineConfiguration
uses gw.util.IOrderedList
uses java.util.Collection

@Export
class CPLineCoverableAdapter implements CoverableAdapter {
  var _owner : entity.CommercialPropertyLine

  construct(owner : entity.CommercialPropertyLine) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner
  }

  override property get PolicyLocations() : PolicyLocation[] {
    return _owner.CPLocations*.Location
  }

  override property get State() : Jurisdiction {
    return _owner.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.CPLineCoverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToCPLineCoverages( p0 as CommercialPropertyCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromCPLineCoverages( p0 as CommercialPropertyCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.CPLineExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToCPLineExclusions( p0 as CommercialPropertyExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromCPLineExclusions( p0 as CommercialPropertyExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.CPLineConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToCPLineConditions( p0 as CommercialPropertyCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromCPLineConditions( p0 as CommercialPropertyCond )
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
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_CP).AllowedCurrencies
  }
}
