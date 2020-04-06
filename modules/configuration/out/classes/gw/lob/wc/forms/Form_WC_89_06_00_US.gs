package gw.lob.wc.forms

uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.ArrayList
uses java.util.Set

@Export
class Form_WC_89_06_00_US extends WCFormData {
  var _changeRecords : List<PolicyChangeRecord> 

  override function populateInferenceData( context : FormInferenceContext, specialCaseStates : Set<Jurisdiction> ) : void {    
    _changeRecords = new ArrayList<PolicyChangeRecord>()
    
    // Diffs on the contact bean
    var currentNamedInsured = context.Period.PrimaryNamedInsured
    var previousNamedInsured = context.Period.BasedOn.PrimaryNamedInsured
    
    if (previousNamedInsured.DisplayName != currentNamedInsured.DisplayName) {
      _changeRecords.add(new InsuredNameChangeRecord(currentNamedInsured.DisplayName))  
    }
    
    // Policy Number
    
    // Effective Date
    
    // Expiration Date
    
    // Insured Address
    var currentPrimaryAddress = currentNamedInsured.AccountContactRole.AccountContact.Contact.PrimaryAddress
    var previousPrimaryAddress = previousNamedInsured.AccountContactRole.AccountContact.Contact.PrimaryAddress
    if (currentPrimaryAddress.AddressLine1 != previousPrimaryAddress.AddressLine1 ||
        currentPrimaryAddress.AddressLine2 != previousPrimaryAddress.AddressLine2 ||
        currentPrimaryAddress.AddressLine3 != previousPrimaryAddress.AddressLine3 ||
        currentPrimaryAddress.State != previousPrimaryAddress.State ||
        currentPrimaryAddress.City != previousPrimaryAddress.City ||
        currentPrimaryAddress.PostalCode != previousPrimaryAddress.PostalCode) {
      _changeRecords.add(new InsuredAddressChangeRecord(currentPrimaryAddress.DisplayName))    
    } 
    
    // Ex Mod Value
    
    // Producer Name
    
    // Location Address

  }

  override property get InferredByCurrentData() : boolean {
    return !_changeRecords.Empty
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    for (c in _changeRecords) {
      c.addDataForComparisonOrExport(contentNode)
    }
  }
  
  static interface PolicyChangeRecord {
    function addDataForComparisonOrExport( contentNode : XMLNode )
  }
  
  static class InsuredNameChangeRecord implements PolicyChangeRecord {
    var _newName : String
    
    construct(newName : String) {
      _newName = newName  
    }
    
    override function addDataForComparisonOrExport( contentNode : XMLNode ) {
      var node = new XMLNode("InsuredNameChange")
      node.Text = _newName
      contentNode.addChild(node)
    }
  }
  
  static class InsuredAddressChangeRecord implements PolicyChangeRecord {
    var _newAddress : String
    
    construct(newAddress : String) {
      _newAddress = newAddress  
    }
    
    override function addDataForComparisonOrExport( contentNode : XMLNode ) {
      var node = new XMLNode("InsuredAddressChange")
      node.Text = _newAddress
      contentNode.addChild(node)
    }
  }

}
