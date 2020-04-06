package gw.lob.wc.forms
uses java.util.Set
uses gw.forms.FormInferenceContext
uses gw.forms.FormData

@Export
abstract class WCFormData extends FormData {
  
  protected static function mapEmployeeBases<O>(context : FormInferenceContext, 
                                                 pred(employee : WCCoveredEmployeeBase) : boolean, 
                                                 op(employee : WCCoveredEmployeeBase) : O ) : Set<O> {                                                 
    return mapArrayToSet(context.Period.WorkersCompLine.WCCoveredEmployeeBases, pred, op)  
  }
  
  protected static function mapEmployees<O>(context : FormInferenceContext, 
                                             pred(employee : WCCoveredEmployee) : boolean, 
                                             op(employee : WCCoveredEmployee) : O ) : Set<O> {                                                  
    return mapArrayToSet(context.Period.WorkersCompLine.WCCoveredEmployees, pred, op)  
  }
}
