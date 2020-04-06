package gw.lob.wc.forms

uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_00_01_04A extends WCFormData {
  var _felaStates : List<FELAStateInfo>
  
  override function getLookupDate(context : FormInferenceContext, state : Jurisdiction) : DateTime {
    return context.Period.WorkersCompLine.WCFedEmpLiabCov.ReferenceDate
  }

  private static class FELAStateInfo {
    var _state : State
    var _deductible : productmodel.PackageWCDeductibleType
    
    construct(s : State, d : productmodel.PackageWCDeductibleType) {
      _state = s
      _deductible = d  
    }
  }

  override function populateInferenceData(context : FormInferenceContext, specialCaseStates : Set<Jurisdiction>) : void {
    var line = context.Period.WorkersCompLine
    if (!line.WCFedEmpLiabCovExists) {
      _felaStates = {}  
    } else {
      var states = mapEmployeeBases(context, \ w -> w.SpecialCov == "fela" , \ w -> JurisdictionMappingUtil.getJurisdiction(w.Location))
      _felaStates = states.map(\s -> new FELAStateInfo(StateJurisdictionMappingUtil.getStateMappingForJurisdiction(s), line.getJurisdiction(s).WCWorkCompDeductCov.WCDeductibleTerm)) 
    }
  }

  override property get InferredByCurrentData() : boolean {
    return !_felaStates.Empty
  }

  override function addDataForComparisonOrExport(contentNode : XMLNode) : void {
  }
}
