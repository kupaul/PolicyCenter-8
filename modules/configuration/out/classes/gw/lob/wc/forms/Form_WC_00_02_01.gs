package gw.lob.wc.forms

uses gw.api.util.JurisdictionMappingUtil
uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode

uses java.math.BigDecimal
uses java.util.Date
uses java.util.Set

@Export
class Form_WC_00_02_01 extends WCFormData {

  var _mariInfoSet : Set<MARIInfo>

  private static class MARIInfo {
    var _classCode : WCClassCode
    var _premium : BigDecimal
    var _deductible : productmodel.PackageWCDeductibleType
    
    construct(c : WCClassCode, p : BigDecimal, d : productmodel.PackageWCDeductibleType) {
      _classCode = c
      _premium = p
      _deductible = d  
    }
    
    override function equals(o : Object) : boolean {
      if (this === o) {
        return true
      }
      if (o == null || !(o typeis MARIInfo)) {
        return false
      }
      var otherInfo = o as MARIInfo
      return otherInfo._classCode == _classCode and otherInfo._premium == _premium and otherInfo._deductible == _deductible
    }
    
    override function hashCode() : int {
      var result = 7
      result += _classCode == null ? 0 : _classCode.hashCode()
      result = result * 31 + (_premium == null ? 0 : _premium.hashCode())
      result = result * 31 + (_deductible == null ? 0 : _deductible.hashCode())
      return result
    }
  }

  override function getLookupDate(context : FormInferenceContext, state : Jurisdiction) : DateTime {
    return context.Period.WorkersCompLine.WCFedEmpLiabCov.ReferenceDate
  }

  override function populateInferenceData( context: FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    var line = context.Period.WorkersCompLine
    if (!line.WCFedEmpLiabCovExists) {
      _mariInfoSet = {} 
    } else {    
      _mariInfoSet = mapEmployees(context, \ w -> w.SpecialCov == "mari", \w -> createMARIInfo(line, w)) 
    }    
  }
  
  private function createMARIInfo(line : WorkersCompLine, emp : WCCoveredEmployee) : MARIInfo {
    var jurisdiction = line.getJurisdiction( JurisdictionMappingUtil.getJurisdiction(emp.Location))
    return new MARIInfo(emp.ClassCode, emp.WCCovEmpCost.ActualAmount, jurisdiction.WCWorkCompDeductCov.WCDeductibleTerm)    
  }

  override property get InferredByCurrentData() : boolean {
    return !_mariInfoSet.Empty
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
  }

}
