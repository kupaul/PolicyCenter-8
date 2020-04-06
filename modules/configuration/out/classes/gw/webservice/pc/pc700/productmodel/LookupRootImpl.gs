package gw.webservice.pc.pc700.productmodel
uses gw.lang.reflect.IType
uses gw.xml.ws.annotation.WsiExportable
uses gw.api.productmodel.LookupRoot
uses gw.lang.reflect.TypeSystem

/**
 * This object is used in Webservices to look up Product Model. Properties of this object
 * are used to get value for filters & dimentions when we perform look up on lookuptables.xml.
 */
@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/productmodel/LookupRootImpl")
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.productmodel.LookupRootImpl instead")
final class LookupRootImpl implements LookupRoot{
  private var _lookupTypeInternal : IType

  override function lookupType() : IType {
    if(_lookupTypeInternal == null){
      _lookupTypeInternal = TypeSystem.getByFullNameIfValid("entity." + LookupTypeName)
    }
    return _lookupTypeInternal
  }

  override function getValue(field : String, root : String) : Object {
    switch(field){
      // these associated with field property in lookuptables.xml
      // to add more mapping, add the mapping logic here and add a property to the parent class
      case "PolicyLinePatternCode": return PolicyLinePatternCode
      case "JobType": return typekey.Job.TC_SUBMISSION
      case "State": return Jurisdiction
      case "PolicyType": return PolicyType
      case "ProductCode": return ProductCode
      case "UWCompanyCode": return UWCompanyCode
      case "IndustryCode": return IndustryCode
      case "VehicleType": return VehicleType
      default: return null
    }
  }

  var _lookupTypeName : String as LookupTypeName
  var _policyLinePatternCode : String as PolicyLinePatternCode
  var _ProductCode : String as ProductCode
  var _jurisdiction : Jurisdiction as Jurisdiction
  var _policyType : BAPolicyType as PolicyType
  var _UWCompanyCode : UWCompanyCode as UWCompanyCode
  var _IndustryCode : String as IndustryCode
  var _VehicleType : VehicleType as VehicleType

  construct() {
  }

}
