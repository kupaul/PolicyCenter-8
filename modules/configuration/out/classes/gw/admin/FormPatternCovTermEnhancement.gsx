package gw.admin
uses gw.api.productmodel.CovTermPack
uses gw.api.productmodel.PackageCovTermPattern
uses gw.api.productmodel.OptionCovTermPattern
uses gw.entity.TypeKey
uses gw.api.productmodel.TypekeyCovTermPattern
uses gw.api.productmodel.CovTermPatternLookup
uses gw.api.productmodel.CovTermOpt

enhancement FormPatternCovTermEnhancement : entity.FormPatternCovTerm {
  
  /**
   * @return the description of the selected covterm pattern.
   */
  property get Description() : String {
    return CovTermPatternLookup.getByCode(this.CovTermPatternCode).Description
  }
  
  /**
   * @return the name of the selected covterm pattern.
   */
  property get Name() : String {
    return CovTermPatternLookup.getByCode(this.CovTermPatternCode).Name
  }

  /**
   * @return the type name of the selected covterm pattern.
   */
  property get ValueTypeName() : String {
    return CovTermPatternLookup.getByCode(this.CovTermPatternCode).ModelType.DisplayName
  }
  
  /**
   * @return an array of all covterm package values for PackageCovTerm referenced by this FormPatternCovTerm 
   * that are not already selected.
   */
   property get AvailablePackageCovTermValues() : CovTermPack[] {
     var addedValues = this.SelectedCovTermValues.map( \ v -> v.Code).toSet()
     var packageCovTermPat = ( CovTermPatternLookup.getByCode(this.CovTermPatternCode) as PackageCovTermPattern)
     return packageCovTermPat.Packages.where(\ p -> !addedValues.contains(p.PackageCode)).sortBy(\ p -> p.DisplayName).toTypedArray()
  }
  
  /**
   * @return an array of all covterm option values for OptionCovTerm referenced by this FormPatternCovTerm 
   * that are not already selected.
   */
   property get AvailableOptionCovTermValues() : CovTermOpt[] {
     var addedValues = this.SelectedCovTermValues.map( \ v -> v.Code).toSet()
     var optionCovTermPat = ( CovTermPatternLookup.getByCode(this.CovTermPatternCode) as OptionCovTermPattern)
     return optionCovTermPat.Options.where(\ o -> !addedValues.contains(o.OptionCode)).sortBy(\ o -> o.DisplayName).toTypedArray()
  }
   
  /**
   * @return an array of all covterm typekeys for TypekeyCovTerm referenced by this FormPatternCovTerm 
   * that are not already selected.
   */
   property get AvailableTypekeyCovTermValues() : List<TypeKey> {
     var addedValues = this.SelectedCovTermValues.map( \ v -> v.Code).toSet()
     var typekeyCovTermPat = ( CovTermPatternLookup.getByCode(this.CovTermPatternCode) as TypekeyCovTermPattern)
     return typekeyCovTermPat.OrderedAvailableValues.where(\ t -> !addedValues.contains(t.Code))
  }
  
  /**
   * Creates a {@link FormPatternCovTermValue} with the given {@link CovTermPack} and adds it to the
   * array of SelectedCovTermValues.
   * 
   * @param pack the CovTermPack to add.
   */
  function addPackageCovTermValue(pack : CovTermPack) {
     createAndAddFormPatternCovTerm(pack.PackageCode)
  }

  /**
   * Creates a {@link FormPatternCovTermValue} with the given {@link CovTerOpt} and adds it to the
   * array of SelectedCovTermValues.
   * 
   * @param opt the CovTermOpt to add.
   */  
  function addOptionCovTermValue(opt : CovTermOpt) {
     createAndAddFormPatternCovTerm(opt.OptionCode)
  }

  /**
   * Creates a {@link FormPatternCovTermValue} with the given covterm value typekey and adds it to the
   * array of SelectedCovTermValues.
   * 
   * @param tk the TypeKey to add.
   */  
  function addTypekeyCovTermValue(tk : TypeKey) {
    createAndAddFormPatternCovTerm(tk.Code)
  }
  
  /**
   * Creates a {@link FormPatternCovTermValue} with the given code and adds it to the
   * array of SelectedCovTermValues.
   * 
   * @param code the code of the covterm value to add.
   */  
  function createAndAddFormPatternCovTerm(code : String) {
     var formPatternCovTermValue = new FormPatternCovTermValue() 
     formPatternCovTermValue.Code = code
     this.addToSelectedCovTermValues(formPatternCovTermValue)
  }
  
  /**
   * Removes the given FormPatternCovTermValue from the array of SelectedCovTermValues.
   * 
   * @param value the FormPatternCovTermValue to remove.
   */
  function removeFormPatternCovTermValue(value : FormPatternCovTermValue) {
    this.removeFromSelectedCovTermValues(value)
  }

}
