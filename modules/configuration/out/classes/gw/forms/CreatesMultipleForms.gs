package gw.forms
uses java.util.Set

/**
 * This interface needs to be implemented for any form that needs to have multiple instances created rather than
 * just a single instance.  In general, implementation fo this pattern can be simplified by subclassing the
 * AbstractMultipleCopiesForm class instead of implementing this interface directly.  
 *
 * If a FormData subclass implements this interface, at form inference time an initial version of the class will
 * be created, but after that the createForms method will be called to create all the copies of the form rather
 * than calling the usual populateData method.  Implementors of this interface should generally throw an UnsupportedOperationException
 * for the populateData method to ensure it's not being called erroneously.
 */
@Export
interface CreatesMultipleForms {
  
  /**
   * Method called to create the appropriate set of the copies of this form.  This method is responsible both for creating
   * copies of the forms and for populating them with the appropriate data.  For example, if a form needed to be duplicated
   * once per vehicle, this method would find all the appropriate vehicles and then create an instance of the class for
   * each vehicle.
   */
  function createForms(context : FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : List<FormData>
  
  /**
   * Method that is called into when an actual Form object is being created for this FormData instance.  This needs
   * to set fields on the Form such that getMatchKeyForForm and getMatchKey will work appropriately later on.  In general,
   * this method should be implemented by attaching the appropriate FormAssociation subclass to the Form and setting
   * a field on it that points to the entity associated with this form.
   */
  function setMatchFields(form : Form)

  /**
   * This method is used to match up forms during a policy change to determine which forms to endorse, replace, remove,
   * or simply leave alone.  This method needs to return a unique key that 1) distinguishes this form from other forms
   * with the same pattern and 2) matches up with the value of the getMatchKey() method such that a FormData instance
   * that represents a potential new form will have the same "match key" as an existing form that points to the same object.
   * If the FormAssociation approach recommended for setMatchFields is used, this method should return the String value of
   * the FixedId property of the entity the FormAssociation points to.
   */
  function getMatchKeyForForm(form : Form) : String
  
  /**
   * This method is used to match up forms during a policy change to determine which forms to endorse, replace, remove,
   * or simply leave alone.  This method needs to return a unique key that 1) distinguishes this form from other forms
   * with the same pattern and 2) matches up with the value of the getMatchKeyForForm() method such that a FormData instance
   * that represents a potential new form will have the same "match key" as an existing form that points to the same object.
   * If the FormAssociation approach recommended for setMatchFields is used, this method should return the String value of
   * the FixedId property of the entity this FormData is related to.
   */
  function getMatchKey() : String
}
