package gw.lob.im.contractorsequip

uses gw.api.domain.CoverableAdapter

uses java.lang.UnsupportedOperationException
uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class ContractorsEquipmentCoverableAdapter implements CoverableAdapter {
  var _owner : entity.ContractorsEquipment

  construct(owner : entity.ContractorsEquipment) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.ContractorsEquipPart.PolicyLine
  }

  override property get PolicyLocations() : PolicyLocation[] {
    // there are no locations for Contractors Equipment
    return new PolicyLocation[0]
  }

  override property get State() : Jurisdiction {
    return _owner.ContractorsEquipPart.InlandMarineLine.BaseState
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.Coverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToCoverages( p0 as ContractorsEquipCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromCoverages( p0 as ContractorsEquipCov )
  }

  override property get AllExclusions() : Exclusion[] {
    return new Exclusion[0]
  }

  override function addExclusion( p0: Exclusion ) : void {
    throw new UnsupportedOperationException(displaykey.CoverableAdapter.Error.ExclusionsNotImplemented)
  }

  override function removeExclusion( p0: Exclusion ) : void {
    throw new UnsupportedOperationException(displaykey.CoverableAdapter.Error.ExclusionsNotImplemented)
  }

  override property get AllConditions() : PolicyCondition[] {
    return new PolicyCondition[0]
  }

  override function addCondition( p0: PolicyCondition ) : void {
    throw new UnsupportedOperationException(displaykey.CoverableAdapter.Error.ConditionsNotImplemented)
  }

  override function removeCondition( p0: PolicyCondition ) : void {
    throw new UnsupportedOperationException(displaykey.CoverableAdapter.Error.ConditionsNotImplemented)
  }

  override property get ReferenceDateInternal() : Date {
    return _owner.ReferenceDateInternal
  }

  override property set ReferenceDateInternal( date : Date ) {
    _owner.ReferenceDateInternal = date
  }

  override property get DefaultCurrency() : Currency {
    return _owner.ContractorsEquipPart.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_IM).AllowedCurrencies
  }
}
