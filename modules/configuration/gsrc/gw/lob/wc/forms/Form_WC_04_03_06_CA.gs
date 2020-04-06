package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.forms.generic.AbstractMultipleCopiesForm
uses gw.xml.XMLNode
uses java.util.Set

@Export
class Form_WC_04_03_06_CA extends AbstractMultipleCopiesForm<WCWaiverOfSubro> {

  override function getEntities(context : FormInferenceContext, availableStates : Set<Jurisdiction>) : List<WCWaiverOfSubro> {
    return context.Period.WorkersCompLine.WCWaiverOfSubros.toList()  
  }
  
  override property get FormAssociationPropertyName() : String {
    return "WCWaiverOfSubro"  
  }

  override function addDataForComparisonOrExport(contentNode : XMLNode) {
    contentNode.addChild(createTextNode("BasisAmount", _entity.BasisAmount as String))
    contentNode.addChild(createTextNode("Classification", _entity.ClassCode.Classification))
    contentNode.addChild(createTextNode("Description", _entity.Description))
  }
  
  override protected function createFormAssociation(form : Form) : FormAssociation {
    return new WCFormAssociation(form.Branch)  
  }
}
