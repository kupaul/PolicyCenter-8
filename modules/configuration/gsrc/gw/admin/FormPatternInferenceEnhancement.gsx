package gw.admin

uses gw.api.productmodel.ClausePattern
uses gw.api.productmodel.CovTermPattern
uses gw.api.productmodel.CovTermPatternLookup
uses gw.api.system.PCDependenciesGateway
uses gw.entity.IEntityPropertyInfo
uses gw.entity.IEntityType
uses gw.entity.ITypeList
uses gw.entity.TypeKey
uses gw.forms.GenericFormInference
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.java.IJavaType

uses java.lang.IllegalStateException
uses gw.api.productmodel.ProductModelTypeHelper

/**
 * Enhancements related to specific form inference classes.
 */
enhancement FormPatternInferenceEnhancement : entity.FormPattern {

   property get SelectedCovTerm() : CovTermPattern {
    if(this.FormPatternCovTerms == null or this.FormPatternCovTerms.Count == 0 )
      return null
    if(this.FormPatternCovTerms.Count > 1)
      throw new IllegalStateException("More than one FormPatternCovTerms are currently selected.")
    return CovTermPatternLookup.getByCode(this.FormPatternCovTerms[0].CovTermPatternCode)
  }

  property set SelectedCovTerm(covTermPattern : CovTermPattern) {
    if(this.FormPatternCovTerms != null and this.FormPatternCovTerms.Count == 1) {
      this.FormPatternCovTerms[0].CovTermPatternCode = covTermPattern.Code
      this.FormPatternCovTerms[0].SelectedCovTermValues.each(\v -> this.FormPatternCovTerms[0].removeFromSelectedCovTermValues(v))
    } else {
      if(this.FormPatternCovTerms != null and this.FormPatternCovTerms.Count > 1) //should never happen
        this.FormPatternCovTerms.each( \ct -> this.removeFormPatternCovTerm(ct))
      addCovTermPattern(covTermPattern)
    }
  }

  property get SelectedCovTermType() : String {
    return this.SelectedCovTerm == null ? "null" : ProductModelTypeHelper.getEntityClass(this.SelectedCovTerm).SimpleName
  }
  
  /**
   * When user changes this FormPattern's GenericInferenceClass, this is called to
   * clean up settings that may have been made for the previous GenericInferenceClass.
   */
  function clearCustomInferenceFields() {
    for (var inferenceClassType in GenericFormInference.Type.Subtypes.where(\ i -> isValidFormInferenceClass(i))) {
      var constuctor = inferenceClassType.TypeInfo.getConstructor({})
      var inst = constuctor.Constructor.newInstance({}) as GenericFormInference
      inst.clearCustomFields(this)
    }
  }

  private function isValidFormInferenceClass(type : IType) : boolean {
    return not type.Interface
            and not type.Abstract
            and gw.forms.FormData.Type.isAssignableFrom(type)
            and type.TypeInfo.getConstructor({}) != null
  }

  function addCovTermPattern(covTermPat : CovTermPattern): FormPatternCovTerm {
    if (this.FormPatternCovTerms.firstWhere(\ f -> f.CovTermPatternCode == covTermPat.Code) != null) {
      throw new IllegalStateException("Cov Term \"covTermPat.Code}\" is already added to this FormPattern")
    }
    var formPatternCovTerm = new FormPatternCovTerm()
    formPatternCovTerm.CovTermPatternCode = covTermPat.Code
    this.addToFormPatternCovTerms(formPatternCovTerm)
    return formPatternCovTerm
  }

  function removeFormPatternCovTerm(covTermPat : FormPatternCovTerm) {
    var formPatternCovTerm = this.FormPatternCovTerms.firstWhere(\ f -> f.CovTermPatternCode == covTermPat.CovTermPatternCode)
    if (formPatternCovTerm == null) {
      throw new IllegalStateException("Cov Term \"$covTermPat.Code}\" not found in this FormPattern")
    }
    this.removeFromFormPatternCovTerms(formPatternCovTerm)
  }

  function addFormPatternCoverableProperty(propInfo : IPropertyInfo) : FormPatternCoverableProperty {
    if (this.FormPatternCoverableProperties.firstWhere(\ f -> f.Name == propInfo.Name) != null) {
      throw new IllegalStateException("Coverable Property \"${propInfo.Name}\" is already added to this FormPattern")
    }
    var formPatternCoverableProp = new FormPatternCoverableProperty()
    formPatternCoverableProp.Name = propInfo.Name
    formPatternCoverableProp.DataType = propInfo.FeatureType.RelativeName
    this.addToFormPatternCoverableProperties(formPatternCoverableProp)
    return formPatternCoverableProp
  }

  function removeFormPatternCoverableProperty(coverableProp : FormPatternCoverableProperty) {
    var formPatternCoverableProp = this.FormPatternCoverableProperties.firstWhere(\ f -> f.Name == coverableProp.Name)
    if (formPatternCoverableProp == null) {
      throw new IllegalStateException("Coverable Property \"${coverableProp.Name}\" not found in this FormPattern")
    }
    this.removeFromFormPatternCoverableProperties(formPatternCoverableProp)
  }

  /**
   * @return an array of all cov term patterns that are  not already designated by this
   * FormPattern's FormPatternCovTerms array.
   */
   property get AvailableFormPatternCovTerms() : CovTermPattern[] {
     if(this.ClausePattern == null){
       return new CovTermPattern[0]
     }
     var addedCovTermPatterns =  this.FormPatternCovTerms.map(\ f -> f.CovTermPatternCode).toSet()
     return this.ClausePattern.CovTerms.where(\ c -> !addedCovTermPatterns.contains(c.Code)).sortBy(\ c -> c.Name).toTypedArray()
  }

  /**
   * @return an array of all properties of the covered object that are not already included in
   * in the FormPatternCoverableProperties array.
   */
  property get AvailableFormPatternCoverableProperties() : IPropertyInfo[] {
     if (this.ClausePattern == null) {
       return new IPropertyInfo[0]
     }
     var addedCoverableProps = this.FormPatternCoverableProperties.map(\ f -> f.Name).toSet()
     var coverableType = TypeSystem.getByFullName("entity." + this.ClausePattern.OwningEntityType)
     var props = coverableType.TypeInfo.Properties.where(\ i -> i typeis IEntityPropertyInfo and (i.FeatureType typeis ITypeList or i.FeatureType typeis IJavaType))
     props.removeWhere(\ i -> this.BlackListedFormPatternCoverableProperties.contains(i.Name))
     return props.where(\ p -> !addedCoverableProps.contains(p.Name)).sortBy(\ i -> i.Name).toTypedArray()
  }

  /**
   * @return a list of property names that are blacklisted from AvailableFormPatternCoverableProperties.
   */
  property get BlackListedFormPatternCoverableProperties() : String[] {
    return {"BeanVersion", "ChangeType", "CreateTime", "EffectiveDate", "ExpirationDate", "ID", "InitialConditionsCreated",
            "InitialCoveragesCreated", "InitialExclusionsCreated", "PatternCode", "PublicID", "ReferenceDateInternal", "Subtype",
            "UpdateTime"}
  }

  property set ClausePattern(pattern : ClausePattern) {
    this.ClausePatternCode = pattern.Code
  }

  property get ClausePattern() : ClausePattern {
    return PCDependenciesGateway.getProductModel().getPattern(this.ClausePatternCode, gw.api.productmodel.ClausePattern)
  }

  /**
   * Called when ClausePattern has changed to reset data that depended on the old value.
   */
  function clearDependentClausePatternSelections(){
    if(this.FormPatternCovTerms.HasElements){
      this.FormPatternCovTerms.each(\ f -> this.removeFormPatternCovTerm(f))
    }
    if (this.FormPatternCoverableProperties.HasElements) {
      this.FormPatternCoverableProperties.each(\ f -> this.removeFormPatternCoverableProperty(f))
    }
  }

  /**
   * @deprecated Replaced by gw.coverage.ClausePatternSearchCriteria.gs in PolicyCenter 8.0.
   */
  function filteredSearchResults(searchCriteria : gw.productmodel.ClausePatternSearchCriteria) : ClausePattern[] {
    return searchCriteria.performSearch()
  }

  property get CoverableTypeRange() : EntityTypeRef[] {
    if (this.PolicyLinePatternRef != null) {
      return this.PolicyLinePatternRef.Pattern.AllCoverableEntityTypes.map(\ i -> new EntityTypeRef(i)).toTypedArray()
    } else {
      return {}
    }
  }

  property get CoverableTypeRef() : EntityTypeRef {
    if (this.CoverableType != null) {
      return loadEntityTypeRef(this.CoverableType)
    }
    return null
  }

  property set CoverableTypeRef(ref : EntityTypeRef) {
    if (ref != null) {
      this.CoverableType = ref.Code
    } else {
      this.CoverableType = null
    }
  }

  function loadEntityTypeRef(typeName : String) : EntityTypeRef {
    var entityType = TypeSystem.getByFullNameIfValid("entity." + typeName) as IEntityType
    if (this.PolicyLinePatternRef == null or
          not this.PolicyLinePatternRef.Pattern.AllCoverableEntityTypes.contains(entityType)) {
      entityType = null;
    }
    return entityType != null ? new EntityTypeRef(entityType) : null
  }

  property get CoverableTypeListRange() : IPropertyInfo[] {
   if (this.CoverableTypeRef == null) {
     return new IPropertyInfo[0]
   }
   var props = this.CoverableTypeRef.EntityType.TypeInfo.Properties
     .where(\ i -> i typeis IEntityPropertyInfo
               and i.FeatureType typeis ITypeList
               and not this.BlackListedFormPatternCoverableProperties.contains(i.Name))
   return props.toTypedArray()
  }

  property get CoverableTypeListRef() : IPropertyInfo {
    if (CoverableTypeRef != null and this.CoverableTypeList != null) {
      return CoverableTypeRef.EntityType.TypeInfo.Properties.firstWhere(\ i -> i.Name == this.CoverableTypeList)
    } else {
      return null
    }
  }

  property set CoverableTypeListRef(prop : IPropertyInfo) {
    if (prop != null) {
      this.CoverableTypeList = prop.Name
    } else {
      this.CoverableTypeList = null
    }
  }

  property get CoverableTypeKeyRange() : TypeKey[] {
   if (this.CoverableTypeRef == null or this.CoverableTypeListRef == null) {
     return new TypeKey[0]
   }
   return (this.CoverableTypeListRef.FeatureType as ITypeList).getTypeKeys(false).toTypedArray()
  }

  property get CoverableTypeKeyRef() : TypeKey {
    if (this.CoverableTypeRef != null and this.CoverableTypeListRef != null and this.CoverableTypeKey != null) {
      return (this.CoverableTypeListRef.FeatureType as ITypeList).getTypeKey(this.CoverableTypeKey)
    } else {
      return null
    }
  }

  property set CoverableTypeKeyRef(key : TypeKey) {
    if (key != null) {
      this.CoverableTypeKey = key.Code
    } else {
      this.CoverableTypeKey = null
    }
  }

}
