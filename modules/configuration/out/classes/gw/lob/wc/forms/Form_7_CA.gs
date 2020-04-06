package gw.lob.wc.forms

uses java.util.Set
uses gw.forms.FormInferenceContext
uses gw.forms.generic.AbstractSimpleAvailabilityForm

@Export
class Form_7_CA extends AbstractSimpleAvailabilityForm {
  override function isAvailable(context : FormInferenceContext, specialCaseStates: Set<Jurisdiction>) : boolean {
    var line = context.Period.WorkersCompLine
    return line.WCWorkCompExMedExcl != null and line.WCCoveredEmployeeBases.hasMatch(\w -> w.Location.State == "CA")
  }

  override function getLookupDate(context: FormInferenceContext, state : Jurisdiction) : DateTime {
    return context.Period.WorkersCompLine.WCWorkCompExMedExcl.ReferenceDate
  }
}
