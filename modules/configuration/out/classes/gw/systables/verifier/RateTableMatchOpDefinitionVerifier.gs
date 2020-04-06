package gw.systables.verifier

uses gw.lang.reflect.TypeSystem
uses gw.xml.parser2.PLXMLNode

uses java.lang.Integer
uses java.util.HashSet
uses java.util.Map

@Export
class RateTableMatchOpDefinitionVerifier extends VerifierBase {

  private var _requiredFieldsVerifier : RequiredFieldsVerifierHelper
  public static var DELIMITER : String = ","
  
  construct() {
    super()
    _requiredFieldsVerifier  = new RequiredFieldsVerifierHelper(
      this,
      {"OpCode", "OpName", "ImplClass","AllowedParameterTypes"}.toTypedArray(),
      {"RateTableMatchOpDefinition"}
    )
  }
  
  override function verify(importNode : PLXMLNode) : Map<PLXMLNode, List<String>> {
    var results = super.verify(importNode)
    _requiredFieldsVerifier.verify(importNode, results)
    verifyNoDuplicateColumns(importNode, results)
    if (results.Empty) {
        // Hard to validate these unless the rows are structurally sound, and all required fields are present
        verifyNoDuplicates(importNode, results)
        importNode.Children.each(\ p -> verifyImplClass(p, results))
        importNode.Children.each(\ p -> verifyAllowedParameterTypes(p, results))
    }
    return results
  }
  
  private function verifyNoDuplicateColumns(importNode: PLXMLNode, results: Map<PLXMLNode, List<String>>){
     var rateTableMatchOpDefinitions = importNode.Children
     rateTableMatchOpDefinitions.each(\ aMatchOpDefinition -> {
        if (duplicateColumnName(aMatchOpDefinition, "OpCode")) {
          addErrorToResults(displaykey.Java.ValidationError.SystemTables.DuplicateColumn("OpCode"),importNode,results)
        }
        if (duplicateColumnName(aMatchOpDefinition, "ImplClass")) {
          addErrorToResults(displaykey.Java.ValidationError.SystemTables.DuplicateColumn("ImplClass"),importNode,results)
        }
     })
  }
  
  private function duplicateColumnName(aMatchOpDefinition: PLXMLNode, elementName: String) : boolean {
        var attributesNamedOpCode = aMatchOpDefinition.Children.where(\ column -> column.ElementName == elementName)
        return (attributesNamedOpCode.Count > 1)
  }
  
  private function verifyNoDuplicates(importNode : PLXMLNode, results : Map<PLXMLNode, List<String>>) {
     var alreadyConsideredOpCodes = new HashSet<String>()

     var rateTableMatchOpDefinitions = importNode.Children
     rateTableMatchOpDefinitions.each(\ aMatchOpDefinition -> {
        var opCode = aMatchOpDefinition.Children.singleWhere(\ column -> column.ElementName == "OpCode").Text
        if (alreadyConsideredOpCodes.contains(opCode)) {
          addErrorToResults(displaykey.Java.ValidationError.SystemTables.DuplicatePublicId(opCode),importNode,results)
        } else {
          alreadyConsideredOpCodes.add(opCode)
        }
      })
  }
    
  private function verifyImplClass(node : PLXMLNode, results : Map<PLXMLNode, List<String>>) {
    var implClassName = node.Children.firstWhere(\ p -> p.ElementName == "ImplClass").Text
    var classType = TypeSystem.getByFullNameIfValid(implClassName)
    if (classType == null) {
      addErrorToResults(displaykey.Java.ValidationError.SystemTables.InvalidClassName(implClassName), node, results)
      return
    }
    if (not gw.rating.rtm.matchop.MatchOperationFactory.Type.isAssignableFrom(classType)) {
      addErrorToResults(displaykey.Java.ValidationError.SystemTables.Inheritance(implClassName, "MatchOperationFactory"), node, results)
      return
    }
  }
  
  private function verifyAllowedParameterTypes(node : PLXMLNode,results : Map<PLXMLNode, List<String>>){
    var datatypestring = node.Children.firstWhere(\ p -> p.ElementName == "AllowedParameterTypes").Text
    var numOfParam = node.Children.firstWhere(\ p -> p.ElementName == "NumberOfParameters").Text as Integer
    var temptypelist = datatypestring.split(DELIMITER).toList()
    temptypelist.each(\ code -> {
      var dataType = RateTableDataType.get(code.trim())
      if(numOfParam>0 && dataType == null){
        addErrorToResults(displaykey.Web.Rating.Errors.InvalidMatchOpParamType(code), node, results)
        return
      }    
      if(numOfParam==0 && code != null){
        addErrorToResults(displaykey.Java.ValidationError.DataType.ClassName.NullAllowed, node, results)
        return
      }        
    })
  }
  
}