package gw.lob.im.contractorsequip

uses gw.api.domain.CoverableAdapter

uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class ContractorsEquipmentPartCoverableAdapter implements CoverableAdapter {
  var _owner : ContractorsEquipPart

  construct(owner : ContractorsEquipPart) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.InlandMarineLine
  }

  override property get PolicyLocations() : PolicyLocation[] {
    // there are no locations for Contractors Equipment
    return new PolicyLocation[0]
  }

  override property get State() : Jurisdiction {
    return _owner.InlandMarineLine.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.ContrEquipPartCovs
  }

  override function addCoverage( p0: Coverage ) : void
  {
    _owner.addToContrEquipPartCovs( p0 as ContrEquipPartCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromContrEquipPartCovs( p0 as ContrEquipPartCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return _owner.ContrEquipPartExclusions
  }

  override function addExclusion( p0: Exclusion ) : void {
    _owner.addToContrEquipPartExclusions( p0 as ContrEquipPartExcl )
  }

  override function removeExclusion( p0: Exclusion ) : void {
    _owner.removeFromContrEquipPartExclusions( p0 as ContrEquipPartExcl )
  }

  override property get AllConditions() : PolicyCondition[] {
    return _owner.ContrEquipPartConditions
  }

  override function addCondition( p0: PolicyCondition ) : void {
    _owner.addToContrEquipPartConditions( p0 as ContrEquipPartCond )
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    _owner.removeFromContrEquipPartConditions( p0 as ContrEquipPartCond )
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
