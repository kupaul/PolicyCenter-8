package gw.webservice.pc.pc800.productmodel

uses gw.lang.reflect.IType
uses gw.xml.ws.annotation.WsiExportable
uses gw.api.productmodel.LookupRoot
uses gw.lang.reflect.TypeSystem
uses com.guidewire.pc.system.dependency.PCDependencies

/**
 * This object is used for product model entities availability lookup. Properties of this object
 * are used to get value for filters & dimentions when we perform look up on lookuptables.xml.
 */
@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/productmodel/LookupRootImpl")
final class LookupRootImpl implements LookupRoot{
  
  var _lookupTypeInternal : IType
  
  construct() {
  }
  
  override function lookupType() : IType {
    if(_lookupTypeInternal == null){
      _lookupTypeInternal = TypeSystem.getByFullNameIfValid("entity." + LookupTypeName)
    }
    return _lookupTypeInternal
  }
  
  public property set LookupTypeName(name : String) {
    _lookupTypeName = name
    _lookupTypeInternal = null //reset lookup type internal so it's recalculated on next access
  }

  override function getValue(field : String, root : String) : Object {
    switch(field){
      // these associated with field property in lookuptables.xml
      // to add more mapping, add the mapping logic here and add a property to the parent class
      case "PolicyLinePatternCode": return PolicyLinePatternCode
      case "CovTermPatternCode" : return CovTermPatternCode
      case "JobType": return JobType
      case "State": return Jurisdiction
      case "PolicyType": return PolicyType
      case "ProductCode": return ProductCode
      case "UWCompanyCode": return UWCompanyCode
      case "IndustryCode": return findIndustryCode()  // callers depend on getting entity.IndustryCode
      case "VehicleType": return VehicleType
      default: return null
    }
  }

  private function findIndustryCode() : IndustryCode {
    return PCDependencies.getIndustryCodeFinder().findIndustryCodeByCodeAndType(_industryCode, _industryCodeType, false)
  }
  
  var _lookupTypeName : String as LookupTypeName
  var _policyLinePatternCode : String as PolicyLinePatternCode
  var _covTermPatternCode : String as CovTermPatternCode
  var _ProductCode : String as ProductCode
  var _jobType : typekey.Job as JobType
  var _jurisdiction : Jurisdiction as Jurisdiction
  var _policyType : BAPolicyType as PolicyType
  var _UWCompanyCode : UWCompanyCode as UWCompanyCode
  var _industryCodeType : IndustryCodeType as IndustryCodeType  // cannot pass entity.IndustryCode in an API, so pass its components instead
  var _industryCode : String as IndustryCode  // cannot pass entity.IndustryCode in an API, so pass its components instead
  var _VehicleType : VehicleType as VehicleType
}
