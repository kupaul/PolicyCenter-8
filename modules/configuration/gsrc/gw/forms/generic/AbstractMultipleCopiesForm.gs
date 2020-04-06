package gw.forms.generic
uses gw.forms.CreatesMultipleForms
uses gw.forms.FormData
uses java.util.Set
uses gw.forms.FormInferenceContext
uses java.lang.UnsupportedOperationException
uses gw.lang.reflect.IConstructorInfo

/**
 * Generic class that can be subclassed to more easily deal with forms that need to have multiple forms attached to the policy.
 * This class works under the assumption that the forms need to be associated in a one-to-one manner with some entity
 * on the policy, and that there will be a corresponding FormAssociation object created to track which form points to
 * which entity.  To use class class, subclass it, generified on the type of entity, and then implement the getEntities
 * and addDataForComparisonOrExport methods and the FormAssociationPropertyName property.  If you've subclassed FormAssociation
 * for different lines of business or based on what object is being associated with, you should override the createFormAssociation 
 * method as well to create the appropriate subtype.  When creating the actual data in the addDataForComparisonOrExport,
 * the _entity protected member variable stores the value of the entity associated with this particular instance of the form data.
 */
@Export
abstract class AbstractMultipleCopiesForm<T extends EffDated> extends FormData implements CreatesMultipleForms {

  /**
   * This function retrieves the set of entities that forms should be created for.  A copy of this form will be created
   * for each entity in the returned list.
   */ 
  abstract function getEntities( context: FormInferenceContext, availableStates : Set<Jurisdiction>) : List<T>
  
  /**
   * This property needs to return the name of the property on the FormAssociation object (or the subtype
   * that the createFormAssociation method creates).  The association between the Form and the entity
   * will be reflectively set and used for future matching based on this property.
   */
  abstract property get FormAssociationPropertyName() : String
  
  /**
   * This method is used to create the new FormAssociation for each form, which will then have the
   * property named by FormAssociationPropertyName set to the value of the entity associated with
   * this form.  This method should generally be overridden to create the appropriate subtype of
   * FormAssociation rather than a generic FormAssociation object.
   */
  protected function createFormAssociation( form : Form) : FormAssociation {
    return new FormAssociation(form.Branch)  
  }

  /**
   * The actual entity that's associated with this form.
   */
  protected var _entity : T

  override function populateInferenceData( context: FormInferenceContext, availableStates : Set<Jurisdiction> ) {
    throw new UnsupportedOperationException()
  }

  override property get InferredByCurrentData() : boolean {
    return true
  }

  override function createForms( context: FormInferenceContext, availableStates : Set<Jurisdiction> ) : List<FormData> {
    var constructor = findConstructor()
    return getEntities(context, availableStates)
        .map(\w -> {
          var form = constructor.Constructor.newInstance( null ) as AbstractMultipleCopiesForm
          form.Pattern = Pattern
          form._entity = w
          return form
        }) 
  }  

  override function setMatchFields( form : Form ) : void {
    var fa = createFormAssociation(form)
    // Now clean up the eff/exp dates so it spans the whole period
    var unsliced = fa.Unsliced
    unsliced.EffectiveDate = form.Branch.PeriodStart
    unsliced.ExpirationDate = form.Branch.PeriodEnd
    fa = fa.getSlice( form.Branch.PeriodStart )
    
    form.addToFormAssociations( fa )
 
    fa.setLinkVersionList( fa.getLinkProperty( FormAssociationPropertyName ), _entity.EffDatedKey )
  }

  override function getMatchKeyForForm( form : Form ) : String {
    return form.FormAssociations[0].fixedIdValue(FormAssociationPropertyName) as java.lang.String
  }

  override function getMatchKey() : String {
    return _entity.FixedId.Value as String
  }
  
  // Reflectively finds the constructor for this class that takes a FormPattern and the appropriate entity
  // Note that this finds the constructor based on the type of the current instance, not for this base class
  private function findConstructor() : IConstructorInfo {
    return (typeof this).TypeInfo.Constructors.firstWhere( \ i -> i.Parameters.Count == 0)
  }

}
