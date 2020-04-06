package gw.rating.worksheet.treenode.builder
uses java.lang.String
uses java.util.List
uses gw.rating.worksheet.domain.WorksheetEntry
uses gw.rating.worksheet.domain.WorksheetOperator
uses gw.rating.worksheet.treenode.IWorksheetTreeNode

@Export
abstract class WorksheetTreeNodeBuilder<T extends WorksheetEntry> {
  
  /**
   * Builds a list of worksheet treenodes as a RowTree 
   * representation of the given WorksheetEntry.
   * @param entry worksheet entry used to build treenodes from
   * @return a list of treenodes representing the given WorksheetEntry
   */
  abstract function build(entry : T) : List<IWorksheetTreeNode>

  /**
   * Returns the string used to represent the given WorksheetOperator.
   * @param op the WorksheetOperator to display
   * @return the string representing the given WorksheetOperator
   */
  function getOperatorForDisplay(op : WorksheetOperator) : String {
    // if operator is null, assume it is a store operator
    if (op == null) {
      return "\u2190"
    }
    switch (op) {
      case Minus:
        return "\u2212"
      case Multiply:
        return "\u00d7"
      case Divide:
        return "\u00f7"      
      case GreaterOrEquals:
        return "\u2265"
      case LessOrEquals:
        return "\u2264"
      case NotEquals:
        return "\u2260"
      case AndOperator:
        return "AND"
      case OrOperator:
        return "OR"    
      default:
        return op.Symbol
    }
  }

  /**
   * Returns the string used to represent the given RoundingModeType display name.
   * @param mode the display name of the RoundingModeType
   * @return the string representing the given RoundingModeType display name.
   */
  function getRoundingModeOperator(mode: RoundingModeType) : String {
    switch (mode) {
      case RoundingModeType.TC_HALF_UP:
        return "R"
      case RoundingModeType.TC_UP:
        return "RU"
      case RoundingModeType.TC_DOWN:
        return "RD"
      case RoundingModeType.TC_HALF_EVEN:
        return "RE"
      default: throw "There is no RoundingModeType for " + mode
    }
  }}
