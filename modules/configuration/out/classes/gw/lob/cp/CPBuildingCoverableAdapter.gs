package gw.lob.cp

uses gw.api.domain.CoverableAdapter
uses gw.api.util.JurisdictionMappingUtil
uses gw.policy.PolicyLineConfiguration

uses java.lang.UnsupportedOperationException
uses java.util.Date
uses java.util.ArrayList

@Export
class CPBuildingCoverableAdapter implements CoverableAdapter {
  var _owner : CPBuilding

  construct(owner : CPBuilding) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    var retVal : PolicyLine
    var cpLocation = _owner.CPLocation
    if(cpLocation != null){
      retVal = cpLocation.CPLine
    }
    return retVal
  }

  override property get PolicyLocations() : PolicyLocation[] {
    var locs = new ArrayList<PolicyLocation>()
    locs.add(_owner.CPLocation.Location)
    return locs.toTypedArray()
  }

  override property get State() : Jurisdiction {
    var retVal : Jurisdiction
    var cpLocation = _owner.CPLocation
    var location = cpLocation == null ? null : cpLocation.Location
    if(location != null){
      retVal = JurisdictionMappingUtil.getJurisdiction(location)
    }
    return retVal
  }

  override property get AllCoverages() : Coverage[] {
     return _owner.Coverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToCoverages( p0 as CPBuildingCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromCoverages( p0 as CPBuildingCov )
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
    return _owner.CPLocation.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_CP).AllowedCurrencies
  }
}