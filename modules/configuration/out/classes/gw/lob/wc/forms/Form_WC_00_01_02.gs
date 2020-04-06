package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_00_01_02 extends WCFormData {

  var _states : Set<State>
  
  override function populateInferenceData( context: FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    _states = mapEmployeeBases(context, \e -> e.SpecialCov == "fcmh", \e -> e.Location.State)
  }

  override property get InferredByCurrentData() : boolean {
    return !_states.Empty
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    var statesNode = new XMLNode("States")
    contentNode.addChild(statesNode)
    for (s in _states) {
      var stateNode = new XMLNode("State")
      statesNode.addChild(stateNode)
      stateNode.addChild(createTextNode("Code", s.Code))
      stateNode.addChild(ignoreAll(createTextNode("Name", s.DisplayName)))
    }
  }

}
