package gw.lob.pa.forms

uses gw.forms.FormInferenceContext
uses gw.forms.generic.AbstractSimpleAvailabilityForm
uses java.util.Set

/**
 * Forms inference class for use by forms for specifying the logic for making forms avaliable based
 * on exposures excluded in the PUP policy
 */
 @Export
class Form_PAExcludedDrivers extends AbstractSimpleAvailabilityForm {

  override function isAvailable(context : FormInferenceContext, availableStates : Set<Jurisdiction>) : boolean {
    var formGroup = this.Pattern.GroupCode
    var paLine = context.Period.PersonalAutoLine

    if (formGroup == "1589") {
      var drivers = paLine.PolicyDrivers
      return (drivers.countWhere(\ p -> p.Excluded) > 0)
    }
    return false
  }

}

