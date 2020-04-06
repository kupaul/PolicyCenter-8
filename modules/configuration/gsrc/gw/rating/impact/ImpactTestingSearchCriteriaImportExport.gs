package gw.rating.impact

uses gw.api.database.Query
uses gw.api.productmodel.Product
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.ReflectUtil
uses gw.xml.XMLNode
uses java.lang.IllegalArgumentException
uses java.lang.StringBuilder
uses java.util.Date
uses java.util.HashMap
uses java.util.Map
uses gw.api.productmodel.ProductLookup
uses java.text.SimpleDateFormat

@Export
class ImpactTestingSearchCriteriaImportExport {

  var _itsc : ImpactTestingSearchCriteria
  
  construct(itsc : ImpactTestingSearchCriteria) {
    _itsc = itsc
  }
  
  // ======================================================================================== //
  //  EXPORT related
  // ======================================================================================== //
  
  // XML TOKEN NAMES
  static var SEARCH_CRITERIA_NAME = "ImpactTestingSearchCriteria"
  static var CHILD_ELEMENT_NAME = "ArrayElement"
  static var NEWLINE = "\n"
  static var INDENT = "    "
    
  function toXML(formatted : boolean = false) : String {
    var xmlOutput = new StringBuilder()
    var typeInfo = ImpactTestingSearchCriteria.Type.TypeInfo
    
    xmlOutput.append("<").append(SEARCH_CRITERIA_NAME).append(">")
    if (formatted) xmlOutput.append(NEWLINE)
    typeInfo.DeclaredProperties.where(\ p -> p.Name != "ChangedSinceLastQuery")
      .where(\p -> p.Public)
      .each(\p ->{
        var val = p.Accessor.getValue(_itsc)
        if (val != null) {
          if (p.FeatureType.Array) {
            var arrayLength = p.FeatureType.getArrayLength(val)
            if (arrayLength > 0) {
              if (formatted) xmlOutput.append(INDENT)
              appendStartOfElement(xmlOutput, p)
              if (formatted) xmlOutput.append(NEWLINE)
              for (i in 0..|arrayLength) {
                if (formatted) xmlOutput.append(INDENT).append(INDENT)
                xmlOutput.append("<").append(CHILD_ELEMENT_NAME).append(">")
                var arrayElement = p.FeatureType.getArrayComponent(val,i)
                var outputValue : String                
                if (arrayElement typeis gw.entity.TypeKey) {
                  outputValue = arrayElement.Code
                } else if (arrayElement typeis Product) {
                  outputValue = arrayElement.Code
                } else {
                  outputValue = arrayElement.toString()
                }
                xmlOutput.append(outputValue)
                xmlOutput.append("</").append(CHILD_ELEMENT_NAME).append(">")
                if (formatted) xmlOutput.append(NEWLINE)
              }
              if (formatted) xmlOutput.append(INDENT)
              appendEndOfElement(xmlOutput,p)
              if (formatted) xmlOutput.append(NEWLINE)
            }
          } else {
            if (formatted) xmlOutput.append(INDENT)
            appendStartOfElement(xmlOutput, p)
            xmlOutput.append(val)
            appendEndOfElement(xmlOutput,p)
            if (formatted) xmlOutput.append(NEWLINE)
          }
        }
      })
    xmlOutput.append("</").append(SEARCH_CRITERIA_NAME).append(">")
    return xmlOutput.toString()
  }
  
  static private function appendStartOfElement(sb : StringBuilder, p : IPropertyInfo) : StringBuilder {
    // \t<PROPERTY_NAME type="<Type>">
    sb.append("<").append(p.Name).append(" type=\"").append(p.FeatureType).append("\">")
    return sb
  }
  
  static private function appendEndOfElement(sb : StringBuilder, p : IPropertyInfo) : StringBuilder {
    // \t</PROPERTY_NAME>
    sb.append("</").append(p.Name).append(">")
    return sb
  }
  
  // ======================================================================================== //
  //  IMPORT related
  // ======================================================================================== //
    
  // Lazily loaded map of ProducerCode.Code -> ProducerCode
  static var _producerCodeMap = new gw.util.concurrent.LockingLazyVar<Map<String,ProducerCode>>(){
    override function init() : Map<String,ProducerCode> {
      var prodCodes = Query.make(ProducerCode).select()
      if (prodCodes == null) {
        return {}
      }      
      var codeProducerCodeObjMap = new HashMap<String, ProducerCode>()
      prodCodes.each(\pc -> {
        codeProducerCodeObjMap.put(pc.Code, pc)
      })
      return codeProducerCodeObjMap
    }
  }
  
  // === Helper functions for populating the ImpactTestingSearchCriteria from XML === //
  // Helper functions divided by type.  This will need to be augmented if additional
  // public properties on the ImpactTestingSearchCriteria POGO are added of types
  // not handled below.
  
  var booleanPropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      var boolVal = new Boolean(n.Text)
      ReflectUtil.setProperty(sc, n.ElementName, boolVal)
    }
    
  var stringPropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      ReflectUtil.setProperty(sc, n.ElementName, n.Text)
    }
    
  var datePropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      var newDate = new SimpleDateFormat("EEE MMM dd HH:mm:ss z yyyy").parse(n.Text)
      ReflectUtil.setProperty(sc, n.ElementName, newDate)
    }
  
  var productArrayPropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      var importProdList : List<Product> = {}
      n.Children.each(\ c -> {
        var prod = ProductLookup.getByCode(c.Text)
        if (prod != null ) importProdList.add(prod)
      })
      ReflectUtil.setProperty(sc, n.ElementName, importProdList.toTypedArray())
    }
  
  var producerArrayPropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      var importProducerList : List<ProducerCode> = {}
      var codeProdCodeMap = _producerCodeMap.get()
      n.Children.each(\ c -> {
        var prodCode = codeProdCodeMap.get(c.Text)
        if (prodCode != null) {
          importProducerList.add(prodCode)
        }
      })
      ReflectUtil.setProperty(sc, n.ElementName, importProducerList.toTypedArray())
    }

  var jurisdictionArrayPropFunc : block(n : XMLNode, sc : ImpactTestingSearchCriteria) =
    \ n, sc -> {
      var jurisdictionList : List<Jurisdiction> = {}
      n.Children.each(\ c -> {
        var jurisdiction : Jurisdiction = c.Text
        if (jurisdiction != null) {
          jurisdictionList.add(jurisdiction)
        }
      })
      ReflectUtil.setProperty(sc, n.ElementName, jurisdictionList.toTypedArray())
    }

  // Maps type string to the helper function
  var typeConversionMap : Map<String, block(n : XMLNode, sc : ImpactTestingSearchCriteria)> =
    { boolean.Type.Name        -> booleanPropFunc,
      String.Type.Name         -> stringPropFunc,
      Date.Type.Name           -> datePropFunc,
      Product[].Type.Name      -> productArrayPropFunc,
      Jurisdiction[].Type.Name -> jurisdictionArrayPropFunc,
      ProducerCode[].Type.Name -> producerArrayPropFunc }
  
  // Main IMPORT from XML method  
  function populateFromXML(xmlData : String) {
    var xmlDoc = XMLNode.parse(xmlData)
    if (xmlDoc.ElementName != SEARCH_CRITERIA_NAME) {
      throw new IllegalArgumentException("Expecting root XML Element name to be '${SEARCH_CRITERIA_NAME}', but it is '${xmlDoc.ElementName}'.")
    }

    xmlDoc.Children.each(\elem -> {
      var typeAttrib = elem.getAttributeValue("type")
      var converter = typeConversionMap.get(typeAttrib)
      if (converter != null) {
        converter(elem, _itsc)
      }
    })
  }


}
