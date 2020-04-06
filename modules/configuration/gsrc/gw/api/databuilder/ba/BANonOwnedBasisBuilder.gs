package gw.api.databuilder.ba

uses gw.api.databuilder.DataBuilder
uses java.lang.Integer

@Export
class BANonOwnedBasisBuilder extends DataBuilder<entity.BANonOwnedBasis, BANonOwnedBasisBuilder> {
  
  construct() {
    super(BANonOwnedBasis)
  }
  
  function withNumEmployees(numEmployees : Integer) : BANonOwnedBasisBuilder {
    set(BANonOwnedBasis.Type.TypeInfo.getProperty("NumEmployees"), numEmployees)
    return this
  }
  
  function withNumPartners(numPartners : Integer) : BANonOwnedBasisBuilder {
    set(BANonOwnedBasis.Type.TypeInfo.getProperty("NumPartners"), numPartners)
    return this
  }
  
  function withNumVolunteers(numVolunteers : Integer) : BANonOwnedBasisBuilder {
    set(BANonOwnedBasis.Type.TypeInfo.getProperty("NumVolunteers"), numVolunteers)
    return this
  }
}
