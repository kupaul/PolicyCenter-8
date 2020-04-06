package gw.lob.wc.financials
uses java.lang.Integer
uses gw.api.util.JurisdictionMappingUtil

@Export
class WCCovEmpCostMethodsImpl extends GenericWCCostMethodsImpl<WCCovEmpCost>
{
  construct( owner : WCCovEmpCost )
  {
    super( owner )
  }

  override property get JurisdictionState() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(Cost.WCCoveredEmployee.Location)
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.WorkersCompLine
  }

  override property get LocationNum() : Integer
  {
    return Cost.WCCoveredEmployee.Location.LocationNum
  }

  override property get ClassCode() : String
  {
    return Cost.WCCoveredEmployee.ClassCode.Code
  }

  override property get Description() : String
  {
    return Cost.WCCoveredEmployee.ClassCode.Classification
  }

}
