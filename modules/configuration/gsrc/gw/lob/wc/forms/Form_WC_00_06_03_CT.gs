package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.ArrayList
uses java.util.Set

@Export
class Form_WC_00_06_03_CT extends WCFormData {
  var _deductible : gw.api.productmodel.CovTermPack
  
  override function getLookupDate(context : FormInferenceContext, state : Jurisdiction) : DateTime {
    return context.Period.WorkersCompLine.getJurisdiction(state).WCWorkCompDeductCov.ReferenceDate
  }

  override function populateInferenceData( context: FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    var jurisdiction = context.Period.WorkersCompLine.getJurisdiction( "CT" )
    if (jurisdiction != null and jurisdiction.WCWorkCompDeductCovExists and jurisdiction.WCWorkCompDeductCov.WCDeductibleTerm.PackageValue != null) {
      _deductible = jurisdiction.WCWorkCompDeductCov.WCDeductibleTerm.PackageValue    
    }   
  }

  override property get InferredByCurrentData() : boolean {
    return _deductible != null
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    contentNode.addChild(createScheduleNode( "States", "State", new ArrayList<String>(){"" + _deductible.PackageCode}))
  }

}
