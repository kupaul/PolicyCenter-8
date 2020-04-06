package gw.forms
uses gw.xml.XMLNode
uses java.lang.Character
uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.Iterable
uses java.util.Collections
uses java.util.Map
uses java.util.HashMap
uses java.util.Set

/**
 * This is the base class which all form classes must extend.  At a minimum, subclassers must implement populateInferenceData
 * method, the InferredByCurrentData property, and the addDataForComparisonOrExport method.  Other functions including the
 * FormDescription property and the populateAdditionalFormFields method, can also be overridden by subclassers.  Several
 * convenience subclasses of this class are in the gw.forms.generic package, which can be used to simplify the creation
 * of form data.
 */
@Export
abstract class FormData {
  
  /**
   * The pattern associated with this FormData object.  This should never be set by client code.
   */
  var _formPattern : FormPattern as Pattern
  
  /**
   * The effective date associated with this FormData.  This is populated automatically by the inference engine and 
   * should never be set outside of that code path
   */
  var _effectiveDate : DateTime as EffectiveDate
  
  /**
   * The expiration date associated with this FormData.  This is populated automatically by the inference engine and 
   * should never be set outside of that code path
   */
  var _expirationDate : DateTime as ExpirationDate
  
  /**
   * This is the cached XMLNode that serves as the contents of this form.
   */
  var _cachedContentNode : XMLNode
  
  var _exposedStatesByDate : Map<DateTime, Set<Jurisdiction>> = {} // Map of slice date to the set of states exposed on the period for that slice
  
  /**
   * @return The associated line, if there is one. 
   */
  public function getLine(context : FormInferenceContext) : PolicyLine {
    if (Pattern.PolicyLinePatternCode != null) {
      var lines = context.Period.Lines.where(\l -> l.PatternCode == Pattern.PolicyLinePatternCode)
      if (lines != null and lines.Count > 0) {
        return lines.single()
      }
    }
    return null
  }

  /**
   * Returns the list of exposed states for the current policy period as of its current slice date.  This should be used
   * in preference to directly asking for the set of exposed states off of the line as this result is cached.
   */
  protected function getExposedStates(context : FormInferenceContext) : Set<Jurisdiction> {
    var states = _exposedStatesByDate[context.Period.SliceDate]
    if (states == null) {
      states = calculateExposedStates(context)
      _exposedStatesByDate[context.Period.SliceDate] = states
    }
    return states
  }
  
  /**
   * By default, computes the exposed states off either the line or period, depending
   * on the type of form.
   */
  protected function calculateExposedStates(context : FormInferenceContext) : Set<Jurisdiction> {
    if (Pattern.PolicyLinePatternCode != null) {
      var line = getLine(context)
      return line != null ? line.CoveredStates.union({line.BaseState}) : Collections.emptySet<Jurisdiction>()
    }
    return context.Period.AllCoveredStates.union({context.Period.BaseState})
  }
  
  /**
   * This method is called by the inference engine to calculate the reference dates to be used for availability 
   * lookup.
   */
  function getLookupDates(context : FormInferenceContext) : Map<Jurisdiction, DateTime> {
    var map = new HashMap<Jurisdiction, DateTime>()
    for (state in getExposedStates(context)) {
      map.put(state, getLookupDate(context, state))
    }
    return map
  }

  /**
   * By default, looks up the reference date for the current job and state off either the line or period, depending
   * on the type of form.
   */
  protected function getLookupDate(context : FormInferenceContext, state : Jurisdiction) : DateTime {
    if (Pattern.PolicyLinePatternCode != null) {
      return getLine(context).getReferenceDateForCurrentJob(state)
    }
    return context.Period.getReferenceDateForCurrentJob(state)
  }

  /**
   * This method is called by the inference engine to populate this instance with the appropriate data from the
   * policy graph.  The context contains information such as the PolicyPeriod, the set of forms in the group,
   * and the period diffs.  The set of available states contains all states in which this form was found to be
   * available; if a state-specific form is available that replaces the US version of a form, those states
   * will not appear in the set.  This method is called immediately after the FormData is created.
   */
  abstract function populateInferenceData(context : FormInferenceContext, availableStates : Set<Jurisdiction>)
  
  /**
   * Indicates whether or not this form should be part of the policy.  Returning true from this method doesn't
   * guarantee the form will be added; that depends on the processing type specified in the FormPattern and
   * whether or not the data on this form matches the data on any previous version of the form.  Rather,
   * a return value of true indicates that the form should be on the policy, while a value of false indicates
   * that the form is not relevant to the policy.
   */
  abstract property get InferredByCurrentData() : boolean
  
  /**
   * This method should take the data extracted during the populateInferenceData method and add the appropriate
   * child nodes to the node that's passed in as the contentNode argument.  The results of this method will be
   * used to compare two forms to look for changes in the event that a form uses the "reissued" policy form and
   * will be persisted to the database.
   */
  abstract function addDataForComparisonOrExport(contentNode : XMLNode)
  
  /**
   * Creates the content node for this form, which is an XML node with the element name "FormContent" that contains
   * any child nodes created by the addDataForComparisonOrExport method.  The node will only be created once and
   * then cached, so there's no need for callers to cache the result themselves and no performance penalty for
   * calling this method repeatedly.
   */
  function createContentNode() : XMLNode {
    if (_cachedContentNode == null) {
      var newFormContent = new XMLNode("FormContent")
      addDataForComparisonOrExport(newFormContent)
      _cachedContentNode = newFormContent
    }
    return _cachedContentNode
  }
  
  /**
   * Function that sets the ignoreAll attribute on a node, which means that the node will be completely
   * filtered out when comparing the children of two nodes.  
   * 
   * Returns the original node back to make it easier to wrap and/or chain method calls.
   */
  static function ignoreAll(xmlNode : XMLNode) : XMLNode {
    xmlNode.Attributes["ignoreAll"] = "true"  
    return xmlNode      
  }
  
  /**
   * Function that sets the ignoreAllAttributes attribute on a node, which means that
   * the node's attributes will be ignored for the purpose of comparisons.
   * 
   * Returns the original node back to make it easier to wrap and/or chain method calls.
   */
  static function ignoreAllAttributes(xmlNode : XMLNode) : XMLNode {
    xmlNode.Attributes["ignoreAllAttributes"] = "true"  
    return xmlNode  
  }
  
  /**
   * Function that sets the ignoreAttributes attribute on a node, which means that
   * the specified attributes will be ignored for the purpose of comparisons.
   * 
   * Returns the original node back to make it easier to wrap and/or chain method calls.
   */
  static function ignoreAttributes(xmlNode : XMLNode, attributes : String[]) : XMLNode {
    xmlNode.Attributes["ignoreAttributes"] = attributes.join(",")  
    return xmlNode  
  }
  
  /**
   * Function that sets the ignoreText attribute on a node, which means that
   * the node's text value will be ignored for purposes of comparisons.
   * 
   * Returns the original node back to make it easier to wrap and/or chain method calls.
   */
  static function ignoreText(xmlNode : XMLNode) : XMLNode {
    xmlNode.Attributes["ignoreText"] = "true"  
    return xmlNode  
  }
  
  /**
   * Function that sets the ignoreChildren attribute on a node, which means that
   * the node's children will be ignored for purposes of comparisons.
   * 
   * Returns the original node back to make it easier to wrap and/or chain method calls.
   */
  static function ignoreChildren(xmlNode : XMLNode) : XMLNode {
    xmlNode.Attributes["ignoreChildren"] = "true"  
    return xmlNode
  }

  /**
   * This property determines the text that will end up in the FormDescription field on the Form.  By default this will just 
   * be the description on the FormPattern, but it can be overridden by subclasses to give more details about, for example, 
   * why the form is being added or what it relates to
   */
  property get FormDescription() : String {
    return _formPattern.FormDescription  
  }
  
  /**
   * Subclasser hook for any additional population you might want to do on the Form object that's been constructed
   */
  function populateAdditionalFormFields(form : Form) { }
  
  /**
   * Sets the form pattern.  This should only be called by the inference engine when it first creates the form, though
   * it may need to be called explicitly by any code that implements the CreatesMultipleForms interface.
   */
  property set Pattern(p : FormPattern) {
    if (_formPattern != null) {
      throw new IllegalStateException("Can't set the FormPattern on a FormData object when the FormPattern is already non-null")  
    } else {
      _formPattern = p  
    }
  }
  
  // ---------------------------------- Helper functions
  
  /**
   * Creates an XML node with the specified name and text content
   */
  protected function createTextNode(name : String, text : String) : XMLNode {
    verifyValidXMLElementName(name)
    var node = new XMLNode(name)
    node.Text = text
    return node  
  }

  /**
   * Creates a parent XML node with the name given by containerName and a list of children with the element name
   * given by childName, with one element per object in the contents iterable and the contents set as the text
   * of the child node.
   */
  protected function createScheduleNode(containerName : String, childName : String, contents : Iterable<String>) : XMLNode {
    verifyValidXMLElementName(containerName)
    verifyValidXMLElementName(childName)
    var containerNode = new XMLNode(containerName)
    for (str in contents) {
      var childNode = new XMLNode(childName)
      containerNode.addChild(childNode)
      childNode.Text = str
    }
    return containerNode
  }

  static function verifyValidXMLElementName(elementName : String) {
    if (!Character.isLetter(elementName.charAt(0))) {
      throw new IllegalArgumentException(elementName + " is not a valid name for an XML element:  element names must start with a letter")   
    }
    
    if (elementName.length >= 3 && 
        Character.toLowerCase(elementName.charAt(0)) == ("x" as char) &&
        Character.toLowerCase(elementName.charAt(1)) == ("m" as char) &&
        Character.toLowerCase(elementName.charAt(2)) == ("l" as char)) {
      throw new IllegalArgumentException(elementName + " is not a valid name for an XML element:  element names cannot start with the letters xml") 
    }
    
    if (elementName.indexOf(" ") != -1) {
      throw new IllegalArgumentException(elementName + " is not a valid name for an XML element:  element names cannot contain spaces")   
    }
  }

  /**
   * Given an array, a filter (the pred argument) and a mapping operation (the op argument) produces
   * a set as the output.  The set will contain the result of op applied to every element in the array
   * that pred() returns true for (if pred is null, all elements will be processed).  For example, this
   * method could be used to take an array of WC exposures and produce a set of states that have exposure
   * for a given class code by using the pred argument to accept only exposures with the given class code
   * and op to extract the state from the exposure.
   */
  protected static function mapArrayToSet<I, O>(array : I[], pred : block(entry : I) : boolean, op : block(entry : I) : O) : Set<O> {
    if (pred == null) {
      return array.map(\i : I -> op(i)).toSet()
    }
    return array.where(\i -> pred(i)).map(\i : I -> op(i)).toSet()
  }
}
