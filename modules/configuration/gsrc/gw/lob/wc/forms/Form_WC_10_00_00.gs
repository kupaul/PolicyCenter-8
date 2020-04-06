package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_10_00_00 extends WCFormData {
  var _manuscriptDesc : String

  override function populateInferenceData( context: FormInferenceContext, availableStates: Set<Jurisdiction> ) : void {
    _manuscriptDesc = context.Period.WorkersCompLine.ManuscriptOptionDesc
  }

  override property get InferredByCurrentData() : boolean {
    return _manuscriptDesc != null
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    var node = new XMLNode("ManuscriptOption")
    node.Text = _manuscriptDesc
    contentNode.addChild(node)
  }

}
