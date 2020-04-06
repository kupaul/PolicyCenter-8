package gw.lob.im.forms

uses gw.forms.generic.AbstractSimpleAvailabilityForm
uses java.util.Set
uses gw.forms.FormInferenceContext

@Export
class Form_IM_Sign_IM00SF extends AbstractSimpleAvailabilityForm {
  override function isAvailable(context : FormInferenceContext, availableStates: Set<Jurisdiction>) : boolean {
    if (context.Period.IMLine.IMSignPart != null) {
      return true
    }
    return false
  }
}
