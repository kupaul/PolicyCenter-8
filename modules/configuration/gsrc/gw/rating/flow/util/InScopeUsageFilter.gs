package gw.rating.flow.util

uses gw.lang.reflect.IPropertyInfo
uses gw.plugin.rateflow.IRateRoutinePlugin
uses gw.plugin.Plugins

/**
 * Use this class to filter the available argument source list of an Operand or Function Argument in the
 * Rate Routine Workbench.  To control whether something is traversed, you must modify the includeProperty()
 * function.   To filter elements out, you may either modify includeProperty(), or change <code>IgnoredPaths</code>
 * and <code>IgnoredTypes</code> to eliminate them from the results.
 */
@Export
class InScopeUsageFilter {

  private construct() {} // this class is not meant to be constructed

  /**
   * Filtering function to control whether to include a property.  Unlike filterIrrelevantItems(),
   * this operates during the traversal of the policy graph, and controls whether a reference from one class
   * to another will be traversed.
   *
   * For example, PolicyLocation has a foreign key to an AccountLocation.  By default,
   * PolicyLocation.AccountLocation is not traversed.   To change this behavior, you might
   * add the condition
   * <code>
   *   if (prop.OwnersType.isAssignableFrom(entity.PolicyLocation) and prop.Name == "AccountLocation") {
   *     return true
   *   }
   * </code>
   *
   * Note that this function can return one of THREE values: true (if you want this property to
   * be included); false (if you want this property to be excluded); or null (for properties which
   * should retain their default behavior).  It is recommended that this function end with a catch-all "return null"
   * so that any property which is not explicitly handled gets default behavior.
   *
   * @param prop The property descriptor for the reference
   * @return true to include owner.prop; false to exclude it; null to use default behavior
   */
  static function includeProperty(policyLinePatternCode : String, prop : IPropertyInfo) : Boolean {
    return Plugins.get(IRateRoutinePlugin).includeProperty(policyLinePatternCode, prop)
  }

  /**
   * Removes irrelevant items based on <code>IgnoredPaths</code> and <code>IgnoredTypes</code> and
   * arrays or maps of types.   This is a postfilter, which runs after traversal of the data structures.
   */
  static function filterIrrelevantItems(input : List<InScopeUsage>, policyLinePatternCode : String) : List<InScopeUsage> {
    return Plugins.get(IRateRoutinePlugin).filterIrrelevantItems(input, policyLinePatternCode) as List<InScopeUsage>
  }

}
