package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_00_01_01A extends WCFormData {
  var _classCodes : Set<WCClassCode> // set of "deba" class codes

  override function populateInferenceData( context : FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    _classCodes = mapEmployeeBases(context, \e -> e.SpecialCov == "deba", \e -> e.ClassCode)
  }

  override property get InferredByCurrentData() : boolean {
    return !_classCodes.Empty
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    var classCodesNode = new XMLNode("ClassCodes")
    contentNode.addChild(classCodesNode)
    for (c in _classCodes) {
      var classCodeNode = new XMLNode("ClassCode")
      classCodesNode.addChild(classCodeNode)
      classCodeNode.addChild(createTextNode("PublicId", c.PublicID))
      classCodeNode.addChild(ignoreAll(createTextNode("Description", c.ShortDesc)))
    }
  }

}
