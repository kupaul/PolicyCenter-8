package gw.policy

uses gw.api.domain.FKLoader

@Export
enhancement PolicyPeriodFormsEnhancement : PolicyPeriod
{
  /**
   * Returns all forms on any prior bound periods, but filters out any forms that
   * were not newly added to this period.
   */
  property get AllPriorBoundForms() : Form[] {
    return this.Forms.where( \ f -> f.BasedOn != null )
  }
  
  /**
   * Returns all forms that are newly added for this period.
   */
  property get NewlyAddedForms() : Form[] {
    return this.Forms.where( \ f -> f.BasedOn == null )
  }
  
  function removeAllNewlyAddedForms() {
    removeForms(null)
  }

  function removeNewlyAddedBindTimeForms() {
    removeForms("bind")
  }
  
  private function removeForms(inferenceTime : FormInferenceTime) {
    var forms = this.Forms
      .where(\ f -> inferenceTime == null || f.InferenceTime == inferenceTime)
      .map(\ f -> f.getSlice(this.PeriodStart))
    FKLoader.preLoadFKs(forms.toList(), Form)
    for (f in forms) {
      if (f.BasedOn == null) {
        if (f.FormTextData != null) {
          // Ugh . . . in the case of a multi-quote there can be multiple forms pointing to this same FormTextData, so 
          // we can't just remove it when removing the form
//          f.FormTextData.remove()
          f.FormTextData = null  
        }
        f.remove()
      } else {
        // We need to undo any chanages we made to mark the form as removed
        f.resetExistingFormIfNecessary()  
      }
    }
  }
}
