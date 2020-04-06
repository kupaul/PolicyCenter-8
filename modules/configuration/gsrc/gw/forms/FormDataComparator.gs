package gw.forms
uses gw.api.xml.XMLNode
uses java.util.ArrayList
uses java.lang.Comparable
uses java.util.Comparator
uses java.util.Collections
uses java.util.Set

/**
 * Class used for comparing two forms to see if their data is the same.  This is used both for comparing
 * a form already on the policy to the new version of that same form and for comparing two new versions
 * of a form that were computed at different slices in time to see if they have the same data and
 * can be merged.  This class relies on the XML storage of the form data to determine equality.  XML
 * nodes are compared in an order-insensitive way, such that two nodes will be considered equal if they
 * have the same element name, attributes, text, and if their children are identical irrespective of order.
 */
@Export
class FormDataComparator
{
  /**
   * Singleton instance variable for accessing this class.  In theory this class could be pluggable
   * at some point in the future, so everything runs through a singleton instance rather than just
   * through static methods.
   */
  static var _instance : FormDataComparator = new FormDataComparator()
  
  /**
   * Property for accessing the instance of this class
   */
  static property get Instance() : FormDataComparator { return _instance }
  
  private construct() { }
  
  /**
   * Returns true if the data on the old form is considered equal to the data on the new form.  If there's
   * no data on the old form at all, this method will return false.
   */
  function isFormDataEqual(oldForm : Form, newForm : FormData) : boolean {
    var oldContentNode = oldForm.ParsedFormContent
    if (oldContentNode == null) {
      var newContent = newForm.createContentNode()
      if (newContent.Attributes.Empty && newContent.Children.Empty && newContent.Text == null) {
        return true  
      } else {
        return false
      }
    } else {
      return compareNodes(oldContentNode, newForm.createContentNode())
    }
  }
  
  /**
   * Returns true if the data on these two forms is considered equal, and false otherwise.
   */
  function isFormDataEqual(newForm1 : FormData, newForm2 : FormData) : boolean {
    return compareNodes(newForm1.createContentNode(), newForm2.createContentNode())
  }
  
  /**
   * Does the actual comparison of the two nodes.  Exposed at the protected level for the sake
   * of testing.
   */
  protected static function compareNodes(node1 : XMLNode, node2 : XMLNode) : boolean {
    return sortCompareNodes(node1, node2) == 0
  }

  /* Comparison algorithm:
     -Element name
     -Text value
     -Number of attributes
     -Attribute names, in sorted order
     -Attribute values, in named order
     -Number of children
     -Children, in sorted order
   */
   
   /**
    * This is the method that does the heavy-lifting of comparing two nodes.  The comparison
    * is based on the idea of sorting the nodes so that we can compare node trees in an order-insensitive
    * way.  The comparison algorithm first compares the element name, then the text value, then
    * the number of attributes, then the attribute names (in sorted order), then the attribute values
    * (in sorted order by name), then the number of children, and finally the children (in sorted order
    * based on this sorting function).
    *
    * The end result should be that this method provides a stable, canonical sort for an XMLNode that can
    * be used for comparing two nodes to see if they're really the "same," and hopefully does so in a
    * vaguely performant fashion by allowing the comparison of child nodes to proceed in sorted order rather
    * than having to compare all children to all other possible children.
    */
   protected static function sortCompareNodes(node1 : XMLNode, node2 : XMLNode) : int {
     var rVal = compareValues(node1.ElementName, node2.ElementName)    
     if (rVal != 0) {
       return rVal
     }
     
     if (!isIgnoreText( node1) || !isIgnoreText(node2)) {
       rVal = compareValues(node1.Text, node2.Text)
       if (rVal != 0) {
         return rVal
       }
     }
     
     if (!isIgnoreAllAttributes( node1) || !isIgnoreAllAttributes(node2)) {
       var node1KeysList = new ArrayList<String>(node1.Attributes.Keys)
       node1KeysList.removeAll(getIgnoredAttributes( node1 ))
       
       var node2KeysList = new ArrayList<String>(node2.Attributes.Keys)
       node2KeysList.removeAll(getIgnoredAttributes( node2 ))
       
       // First try to order by number of attributes
       rVal = compareValues(node1KeysList.size(), node2KeysList.size())
       if (rVal != 0) {
         return rVal
       }
       
       // Next try to order by the names of the attributes     
       node1KeysList.sort()
       node2KeysList.sort()
       for (i in 0..|node1KeysList.size()) {
         rVal = compareValues(node1KeysList[i], node2KeysList[i])
         if (rVal != 0) {
           return rVal  
         }
       }
       
       // If that fails, then we order by the values of the attributes
       for (key in node1KeysList) {
         rVal = compareValues(node1.Attributes[key], node2.Attributes[key]) 
         if (rVal != 0) {
           return rVal  
         }
       }
     }
     
     if (!isIgnoreChildren(node1) || !isIgnoreChildren(node2)) {        
       var sortedNode1Children = node1.Children.where(\n -> !isIgnoreAll(n)).toList()
       var sortedNode2Children = node2.Children.where(\n -> !isIgnoreAll(n)).toList()
     
       rVal = compareValues(sortedNode1Children.Count, sortedNode2Children.Count)
       if (rVal != 0) {
         return rVal  
       }
     
       // We don't want to mutate the child arrays on the nodes themselves, so we have to copy out before sorting    
       Collections.sort(sortedNode1Children, XMLNodeComparator.COMPARATOR_INSTANCE)    
       Collections.sort(sortedNode2Children, XMLNodeComparator.COMPARATOR_INSTANCE)
       for (i in 0..|sortedNode1Children.size()) {
         rVal = sortCompareNodes(sortedNode1Children[i], sortedNode2Children[i])
         if (rVal != 0) {
           return rVal  
         }
       }
     }
     
     return 0
   }
   
   /**
    * Helper function for comparing two comparable values in a null-sensitive way.
    * Null is considered prior to any other value, so this function will return -1 if
    * c1 is null and c2 is not and 1 if c2 is null and c1 is not.
    */
   private static function compareValues<T extends Comparable>(c1 : T, c2 : T) : int {   
     if (c1 == null and c2 == null) {
       return 0  
     } else if (c1 == null) {
       return -1
     } else if (c2 == null) {
       return 1 
     } else {
       return c1.compareTo(c2)  
     }
   }
   
   private static function isIgnoreText(node : XMLNode) : boolean {
     return node.Attributes["ignoreText"] == "true"    
   }
   
   private static function isIgnoreAll(node : XMLNode) : boolean {
     return node.Attributes["ignoreAll"] == "true"  
   }
   
   private static function isIgnoreChildren(node : XMLNode) : boolean {
     return node.Attributes["ignoreChildren"] == "true"  
   }
   
   private static function isIgnoreAllAttributes(node : XMLNode) : boolean {
     return node.Attributes["ignoreAllAttributes"] == "true" 
   }
   
   private static var _defaultIgnoredAttributes : Set<String> = {"ignoreText", "ignoreAll", "ignoreChildren", "ignoreAllAttributes", "ignoreAttributes"}
   
   private static function getIgnoredAttributes(node : XMLNode) : Set<String> {
     if (node.Attributes["ignoreAttributes"] == null) {
       return _defaultIgnoredAttributes  
     } else {
       var ignoredAttributes = node.Attributes["ignoreAttributes"].split( "," ).toSet()  
       ignoredAttributes.addAll(_defaultIgnoredAttributes)
       return ignoredAttributes
     }
   }
   
   /**
    * Comparator that uses the sortCompareNodes method above to sort a tree of XMLNodes.
    */
   public static class XMLNodeComparator implements Comparator<XMLNode> {
     public static var COMPARATOR_INSTANCE : XMLNodeComparator = new XMLNodeComparator()  
       
     override function compare( p0: XMLNode, p1: XMLNode ) : int {
       return FormDataComparator.sortCompareNodes(p0, p1)
     }

   }

}
