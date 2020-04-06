package gw.validation

uses gw.pl.persistence.core.Bundle
uses gw.entity.IEntityType
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.FieldConversionException
uses gw.api.database.PCBeanFinder

enhancement BundleEnhancement : Bundle {

  /**
   * @deprecated In PC 8.0.1. This was introduced in the first version of PolicyCenter as a means
   * of circumventing validation while importing external Policy Data. The original intention for 
   * the function was to allow PolicyCenter to initiate jobs on such Policies despite invalid data. 
   * Such functionality is no necessary for the OOTB product. As it is a dangerous obfuscation of
   * com.guidewire functionality, it has been deprecated. This has little impact on the performance
   * of OOTB validation, if this deprecation impacts custom validation logic, contact services.
   */
  @Deprecated("PC8.0.1.")
  function turnOffValidation(): Bundle {
    com.guidewire.pc.system.bundle.BundleUtil.turnOffBundleValidation(this)
    return this
  }

  /**
   * Loads and returns an entity of type <code>type</code> whose PublicID is <code>publicID</code>.
   * Throws a {@link RequiredFieldException} if <code>publicID</code> is null, with a reference to
   * <code>fieldName</code> in the exception message. Throws a {@link FieldConversionException} if
   * no matching entity is found.
   */
  function loadByPublicIdOrThrow(type : IEntityType, publicID : String, fieldName : String) : KeyableBean {
    if (publicID == null) {
      throw new RequiredFieldException(displaykey.Bundle.RequiredFieldIsNull(fieldName))
    }
    var entity = this.add(PCBeanFinder.loadBeanByPublicID(publicID, type))
    if (entity == null) {
      throw new FieldConversionException(displaykey.Bundle.EntityNotFound(type, publicID))
    }
    return entity
  }
}
