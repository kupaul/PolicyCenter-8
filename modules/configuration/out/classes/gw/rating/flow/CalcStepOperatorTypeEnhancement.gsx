package gw.rating.flow

uses java.lang.String
uses java.lang.IllegalStateException

enhancement CalcStepOperatorTypeEnhancement : typekey.CalcStepOperatorType {

  // workaround for the fact that typekey localization is dependent on the database text encoding.  :-(
  property get LabelForDisplay() : String {
    switch (this) {
      case CalcStepOperatorType.TC_SUBTRACTION:
        return "\u2212"
      case CalcStepOperatorType.TC_MULTIPLICATION:
        return "\u00d7"
      case CalcStepOperatorType.TC_DIVISION:
        return "\u00f7"
        
      case CalcStepOperatorType.TC_GREATERTHANOREQUAL:
        return "\u2265"
      case CalcStepOperatorType.TC_LESSTHANOREQUAL:
        return "\u2264"
      case CalcStepOperatorType.TC_NOTEQUAL:
        return "\u2260"
        
      case CalcStepOperatorType.TC_STORE:
        return "\u2190"
        
      default:
        return this.DisplayName
    }
  }
  
  property get ExpressionOperator() : String {
    switch(this) {
      case CalcStepOperatorType.TC_ADDITION:
        return "+"
      case CalcStepOperatorType.TC_SUBTRACTION:
        return "-"
      case CalcStepOperatorType.TC_MULTIPLICATION:
        return "*"
      case CalcStepOperatorType.TC_DIVISION:
        return "/"

      default:
        throw new IllegalStateException("Unknown CalcStepOperatorType used when attempting to get Expression operator: " + this.Code)
    }
  }
  
  property get LogicalOperator() : String {
    switch(this) {
      case CalcStepOperatorType.TC_NOT:
        return "not"
      case CalcStepOperatorType.TC_AND:
        return "and"
      case CalcStepOperatorType.TC_OR:
        return "or"

      default:
        throw new IllegalStateException("Unknown CalcStepOperatorType used when attempting to get Boolean operator: " + this.Code)
    }
  }

  property get ComparisonOperator() : String {
    switch(this) {
      case CalcStepOperatorType.TC_GREATERTHAN:
        return ">"
      case CalcStepOperatorType.TC_GREATERTHANOREQUAL:
        return ">="
      case CalcStepOperatorType.TC_LESSTHAN:
        return "<"
      case CalcStepOperatorType.TC_LESSTHANOREQUAL:
        return "<="
      case CalcStepOperatorType.TC_NOTEQUAL:
        return "!="
      case CalcStepOperatorType.TC_EQUAL:
        return "=="

      default:
        throw new IllegalStateException("Unknown CalcStepOperatorType used when attempting to get Expression operator: " + this.Code)
    }
  }
}
