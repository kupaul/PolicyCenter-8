package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_00_06_03_US extends WCFormData {
  var _jurisdictions : WCJurisdiction[]

  override function getLookupDate(context : FormInferenceContext, state : Jurisdiction) : DateTime {
    return context.Period.WorkersCompLine.getJurisdiction(state).WCWorkCompDeductCov.ReferenceDate
  }

  override function populateInferenceData(context : FormInferenceContext, specialCaseStates : Set<Jurisdiction>) : void {
    _jurisdictions = context.Period.WorkersCompLine.Jurisdictions
      .where(\j -> specialCaseStates.contains(j.State) and j.WCWorkCompDeductCov.WCDeductibleTerm.PackageValue != null)
  }

  override property get InferredByCurrentData() : boolean {
    return _jurisdictions.Count > 0
  }

  override function addDataForComparisonOrExport(contentNode : XMLNode) : void {
    var scheduleNode = createScheduleNode("States", "State",
      _jurisdictions.map(\j -> j.State.Code + " - " + j.WCWorkCompDeductCov.WCDeductibleTerm.PackageValue.PackageCode).toList())
    contentNode.Children.add(scheduleNode)
  }
}
