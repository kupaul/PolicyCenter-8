package gw.lob.bop

uses gw.api.domain.CoverableAdapter
uses gw.api.util.JurisdictionMappingUtil

uses java.lang.UnsupportedOperationException
uses java.util.ArrayList
uses java.util.Date
uses gw.policy.PolicyLineConfiguration

@Export
class BOPLocationCoverableAdapter implements CoverableAdapter {
  var _owner : BOPLocation
  construct(owner : BOPLocation) {
    _owner = owner
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BOPLine
  }

  override property get PolicyLocations() : PolicyLocation[] {
    var locs = new ArrayList<PolicyLocation>()
    locs.add(_owner.Location)
    return locs.toTypedArray()
  }

  override property get State() : Jurisdiction {
    var retVal : Jurisdiction
    if(_owner.Location != null){
      retVal = JurisdictionMappingUtil.getJurisdiction(_owner.Location )
    }
    return retVal
  }

  override property get AllCoverages() : Coverage[] {
    return _owner.Coverages
  }

  override function addCoverage( p0: Coverage ) : void {
    _owner.addToCoverages( p0 as BOPLocationCov )
  }

  override function removeCoverage( p0: Coverage ) : void {
    _owner.removeFromCoverages( p0 as BOPLocationCov )
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
    return _owner.BOPLine.PreferredCoverageCurrency
  }

  override property get AllowedCurrencies() : List<Currency> {
    return PolicyLineConfiguration.getByLine(InstalledPolicyLine.TC_BOP).AllowedCurrencies
  }
}
