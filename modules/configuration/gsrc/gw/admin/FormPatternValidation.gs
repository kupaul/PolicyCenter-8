package gw.admin
uses gw.api.database.Query
uses gw.lang.reflect.TypeSystem
uses gw.util.Pair
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses java.util.Date
uses java.util.HashSet
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ITypeList
uses gw.lang.reflect.java.IJavaType
uses java.util.ArrayList
uses java.util.Collection

@Export
class FormPatternValidation extends PCValidationBase {

  var _formPattern : FormPattern as readonly Pattern

  construct(valContext : PCValidationContext, formPattern : FormPattern) {
    super(valContext)
    _formPattern = formPattern
  }
  
  public static function validateAll() {
    PCValidationContext.doPageLevelValidation(\ context -> {
      for (var form in FormPattern.finder.findFormPatterns()) {
        var validation = new FormPatternValidation(context, form)
        validation.validate()
      }
    })    
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    noSpacesInFormCode()
    formCodeUnique()
    productsNotEmpty()
    noDuplicateProducts()
    jobsNotEmpty()
    noDuplicateJobs()
    allJobsAreOfValidType()
    useInsteadFormExists()
    useInsteadFormInSameGroup()
    noUseInsteadCycle()
    formNumberDoesNotOverlapOtherGroupCode()
    groupCodeIsUnique()
    inferenceTimesInGroupAreEqual()
    removalEndorsementFlagsInGroupAreEqual()
    reissueOnChangeFlagsInGroupAreEqual()
    lookupDateRangesNotEmpty()
    noOverlappingLookups()
    endorsementNumberedIfReissueOnChange()
    removalEndorsementValid()
    removalEndorsementFormNumberValid()
    removalEndorsementProductsMatch()
    genericInferenceClassValid()
    genericInferenceFieldsValid()
    policyLineExists()
    allProductsContainSelectedPolicyLine()
    policyLinePatternContainsSelectedClausePattern()
    everyProductContainsSelectedClausePattern()
    policyLinePatternIsValidForGenericInferenceClass()
    allCoverablePropertiesAreValid()
  }

  function noSpacesInFormCode() {
    Context.addToVisited(this, "noSpacesInFormCode")
    if (_formPattern.Code.matches(".*\\s+.*")) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.CodeHasSpaces(_formPattern.DisplayName, _formPattern.Code))
    }
  }

  function formCodeUnique() {
    Context.addToVisited(this, "formCodeUnique")
      var q = Query.make(FormPattern)
      q.compare("Code", Equals, _formPattern.Code)
      for (var f in q.select()) {
        if (f.ID != _formPattern.ID) {
          Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.CodeInUse(_formPattern.DisplayName, _formPattern.Code))
          return
        }
      }
  }

  function productsNotEmpty() {
    Context.addToVisited(this, "productsNotEmpty")
    if (_formPattern.FormPatternProducts.IsEmpty) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.EmptyProducts(_formPattern.DisplayName))
    }
  }

  function noDuplicateProducts() {
    Context.addToVisited(this, "noDuplicateProducts")
    var seenProducts = new HashSet<String>()
    for (var formPatternProduct in _formPattern.FormPatternProducts) {
      if (seenProducts.contains(formPatternProduct.ProductCode)) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.ProductDefinedMoreThanOnce(_formPattern.DisplayName,formPatternProduct.ProductCode))
      }
      seenProducts.add(formPatternProduct.ProductCode)
    }
  }

  function jobsNotEmpty() {
    Context.addToVisited(this, "jobsNotEmpty")
    if (_formPattern.FormPatternJobs.IsEmpty) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.EmptyJobs(_formPattern.DisplayName))
    }
  }

  function noDuplicateJobs() {
    Context.addToVisited(this, "noDuplicateJobs")
    var seenJobs = new HashSet<typekey.Job>()
    for (var formPatternJob in _formPattern.FormPatternJobs) {
      if (seenJobs.contains(formPatternJob.JobType)) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.JobDefinedMoreThanOnce(_formPattern.DisplayName,formPatternJob.JobType.Code))
      }
      seenJobs.add(formPatternJob.JobType)
    }
  }

  function allJobsAreOfValidType() {
    Context.addToVisited(this, "allJobsAreOfValidType")
    var allowedJobTypes = typekey.Job.Type.getTypeKeysByFilterName("FormPatternJobs")
    for (formPatternJob in _formPattern.FormPatternJobs) {
      if (!allowedJobTypes.contains(formPatternJob.JobType)) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.InvalidJobType(_formPattern.DisplayName, formPatternJob.JobType))
      }
    }
  }

  function useInsteadFormExists() {
    Context.addToVisited(this, "useInsteadFormExists")
    if (_formPattern.UseInsteadOfCode != null) {
      var useInsteadForm = findUseInsteadOfForm(_formPattern)
      if (useInsteadForm == null) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.UseInsteadFormDoesNotExist(_formPattern.DisplayName,_formPattern.UseInsteadOfCode))
      }
    }
  }

  function useInsteadFormInSameGroup() {
    Context.addToVisited(this, "useInsteadFormInSameGroup")
    if (_formPattern.UseInsteadOfCode != null) {
      var useInsteadForm = findUseInsteadOfForm(_formPattern)
      if (useInsteadForm != null) {
        if (_formPattern.InternalGroupCode == null) {
          Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.UseInsteadFormRequiresGroup(_formPattern.DisplayName))
        } else if (useInsteadForm.InternalGroupCode == null) {
          Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.UseInsteadFormInNoGroup(_formPattern.DisplayName,useInsteadForm.DisplayName))
        } else if (_formPattern.InternalGroupCode != useInsteadForm.InternalGroupCode) {
          Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.UseInsteadFormInDifferentGroup(_formPattern.DisplayName,useInsteadForm.DisplayName, useInsteadForm.GroupCode))
        }
      }
    }
  }

  function noUseInsteadCycle() {
    Context.addToVisited(this, "noUseInsteadCycle")
    var visited = new HashSet<String>()
    var f = _formPattern
    visited.add(f.Code)
    while (f.UseInsteadOfCode != null) {
      if (visited.contains(f.UseInsteadOfCode)) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.UseInsteadFormCycle(_formPattern.DisplayName, f.DisplayName, _formPattern.GroupCode))
        return
      }
      visited.add(f.UseInsteadOfCode)
      f = findUseInsteadOfForm(f)
    }
  }

  function formNumberDoesNotOverlapOtherGroupCode() {
    Context.addToVisited(this, "formNumberDoesNotOverlapOtherGroupCode")
    if (_formPattern.FormNumber != _formPattern.InternalGroupCode) {
      var q = Query.make(FormPattern)
        q.compare("InternalGroupCode", Equals, _formPattern.FormNumber)
          .join(FormPatternProduct, "FormPattern")
          .compareIn("ProductCode", _formPattern.FormPatternProducts*.ProductCode)
      if (not q.select().Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.FormNumberOverlapsOtherGroupCode(_formPattern.DisplayName,_formPattern.FormNumber))
      }
    }
  }

  function groupCodeIsUnique() {
    Context.addToVisited(this, "groupCodeIsUnique")
    if (_formPattern.InternalGroupCode != null) {
      var q = Query.make(FormPattern)
      q.compare("FormNumber", Equals, _formPattern.InternalGroupCode)
      q.or(\ or1 -> {
        or1.compare("InternalGroupCode", NotEquals, _formPattern.InternalGroupCode)
        or1.compare("InternalGroupCode", Equals, null)
      })
      if (not q.select().Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.NonUniqueGroupCode(_formPattern.DisplayName,_formPattern.GroupCode))
      }
    }
  }

  function inferenceTimesInGroupAreEqual() {
    Context.addToVisited(this, "inferenceTimesInGroupAreEqual")
    if (_formPattern.GroupCode != null) {
      var q = _formPattern.makeGroupQuery(true)
      q.compare("InferenceTime", NotEquals, _formPattern.InferenceTime)

      if (not q.select().Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.GroupInferenceTimesUnequal(_formPattern.DisplayName,_formPattern.GroupCode))
      }
    }
  }

  function removalEndorsementFlagsInGroupAreEqual() {
    Context.addToVisited(this, "removalEndorsementFlagsInGroupAreEqual")
    if (_formPattern.GroupCode != null) {
      var q = _formPattern.makeGroupQuery(true)
        q.compare("InternalRemovalEndorsement", NotEquals, _formPattern.InternalRemovalEndorsement)
        .join(FormPatternProduct, "FormPattern")
        .compareIn("ProductCode", _formPattern.FormPatternProducts*.ProductCode)

      if (not q.select().Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.RemovalEndorsementFlagsUnequal(_formPattern.DisplayName,_formPattern.GroupCode))
      }
    }
  }

  function reissueOnChangeFlagsInGroupAreEqual() {
    Context.addToVisited(this, "reissueOnChangeFlagsInGroupAreEqual")
    if (_formPattern.GroupCode != null) {
      var q = _formPattern.makeGroupQuery(true)
        q.compare("InternalReissueOnChange", NotEquals, _formPattern.InternalReissueOnChange)
        .join(FormPatternProduct, "FormPattern")
        .compareIn("ProductCode", _formPattern.FormPatternProducts*.ProductCode)

      if (not q.select().Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.ReissueOnChangeFlagsUnequal(_formPattern.DisplayName,_formPattern.GroupCode))
      }
    }
  }

  function lookupDateRangesNotEmpty() {
    Context.addToVisited(this, "lookupDateRangesNotEmpty")
    for (var lookup in _formPattern.Lookups index i) {
      if (lookup.StartEffectiveDate != null and lookup.EndEffectiveDate != null) {
        if (not lookup.EndEffectiveDate.after(lookup.StartEffectiveDate)) {
          Result.addError(_formPattern, "default",
            displaykey.Validation.FormPattern.InvalidLookupDateRange(_formPattern.DisplayName, lookup.StartEffectiveDate.ShortFormat, lookup.EndEffectiveDate.ShortFormat, i + 1))
        }
      }
    }
  }

  function noOverlappingLookups() {
    Context.addToVisited(this, "noOverlappingLookups")
    var partitionedLookups = _formPattern.Lookups.partition(\ f -> new Pair<Jurisdiction, UWCompanyCode>( f.Jurisdiction, f.UWCompanyCode))
    for (var grouping in partitionedLookups.Values) {
      grouping.sort(\ f1, f2 -> {
        if (f1.StartEffectiveDate == f2.StartEffectiveDate) {
          return dateBefore(f1.EndEffectiveDate, f2.EndEffectiveDate)
        } else {
          return dateBefore(f1.StartEffectiveDate, f2.StartEffectiveDate)
        }
      })

      var prevLookup : FormPatternLookup = null
      for (var thisLookup in grouping) {
        if (prevLookup != null) {
          if (prevLookup.EndEffectiveDate == null or thisLookup.StartEffectiveDate == null or
                thisLookup.StartEffectiveDate.before(prevLookup.EndEffectiveDate)) {
            Result.addError(_formPattern, "default",
              displaykey.Validation.FormPattern.OverlappingLookupDates(_formPattern.DisplayName, thisLookup.Jurisdiction, thisLookup.UWCompanyCode,
                prevLookup.StartEffectiveDate.ShortFormat, prevLookup.EndEffectiveDate.ShortFormat,
                thisLookup.StartEffectiveDate.ShortFormat, thisLookup.EndEffectiveDate.ShortFormat))
          }
        }
        prevLookup = thisLookup
      }
    }
  }

  private function dateBefore(d1 : Date, d2 : Date) : boolean {
    if (d1 == d2) {
      return false
    } else if (d2 == null) {
      return false
    } else if (d1 == null) {
      return true
    } else {
      return d1.before(d2)
    }
}

  function endorsementNumberedIfReissueOnChange() {
    Context.addToVisited(this, "endorsementNumberedIfReissueOnChange")
    if (_formPattern.ReissueOnChange) {
      if (_formPattern.RemovalEndorsementFormNumber != null and not _formPattern.EndorsementNumbered) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.RequiresEndorsementNumbering(_formPattern.DisplayName, _formPattern.RemovalEndorsementFormNumber))
      }
    }
  }

  function removalEndorsementValid() {
    Context.addToVisited(this, "removalEndorsementValid")
    if (_formPattern.InternalRemovalEndorsement and not _formPattern.hasJob(typekey.Job.TC_POLICYCHANGE))
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.RemovalEndorsementMustHavePolicyChange(_formPattern.DisplayName))
    if (not _formPattern.RemovalEndorsement) {
      var referringForms = findReferringRemovalEndorsementForms(_formPattern)
      
      if (referringForms.HasElements) {
        var referringFormLabels = referringForms.map(\ f -> f.DisplayName)
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.RemovalEndorsementInUse(_formPattern.DisplayName, referringFormLabels.join(", ")))
      }
    }
  }

  function removalEndorsementFormNumberValid() {
    Context.addToVisited(this, "removalEndorsementFormNumberValid")
    if (_formPattern.RemovalEndorsementFormNumber != null) {
      var removalEndorsementForms = findRemovalEndorsementForms(_formPattern)  
      
      if (removalEndorsementForms.Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.RemovalEndorsementDoesNotExist(_formPattern.DisplayName, _formPattern.RemovalEndorsementFormNumber))
      } else if (removalEndorsementForms.where(\ f -> f.PolicyLinePatternCode == _formPattern.PolicyLinePatternCode).Empty) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.NonMatchingPolicyLine(_formPattern.DisplayName))
      } else {
        for (var removalEndorsementForm in removalEndorsementForms) {
          if (not removalEndorsementForm.RemovalEndorsement) {
            Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.NonRemovalEndorsement(_formPattern.DisplayName, _formPattern.RemovalEndorsementFormNumber, removalEndorsementForm.DisplayName))
          }
        }
      }
    }
  }

  function removalEndorsementProductsMatch() {
    Context.addToVisited(this, "removalEndorsementProductsMatch")
    if (_formPattern.RemovalEndorsementFormNumber != null) {
      var removalEndorsementForms = findRemovalEndorsementForms(_formPattern)
          
      final var productCodes = _formPattern.FormPatternProducts.map(\ f -> f.ProductCode)
      final var productCodesSet = productCodes.toSet()
      final var productCodesCsv = productCodes.join(", ")
      for (var removalEndorsementForm in removalEndorsementForms) {
        var otherProductCodesSet = removalEndorsementForm.FormPatternProducts.map(\ f -> f.ProductCode).toSet()
        if (not productCodesSet.equals(otherProductCodesSet)) {
          var otherProductCodesCsv = removalEndorsementForm.FormPatternProducts.map(\ f -> f.ProductCode).join(", ")
          Result.addWarning(_formPattern, "default", displaykey.Validation.FormPattern.NonMatchingProducts(_formPattern.DisplayName, productCodesCsv, otherProductCodesCsv))
        }
      }
    }
  }

  function genericInferenceClassValid() {
    Context.addToVisited(this, "genericInferenceClassValid")
    if (_formPattern.HasCustomInference) {
      return
    }

    var inferenceClassName = _formPattern.GenericInferenceClass
    if (inferenceClassName == null) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.NullClassName(_formPattern.DisplayName))
      return
    }

    var inferenceClassType = TypeSystem.getByFullNameIfValid(inferenceClassName)
    if (inferenceClassType == null) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.InvalidClassName(_formPattern.DisplayName, inferenceClassName))
      return
    }

    if (not gw.forms.GenericFormInference.Type.isAssignableFrom(inferenceClassType)) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.Interface(_formPattern.DisplayName, inferenceClassName))
    }
    if (not gw.forms.FormData.Type.isAssignableFrom(inferenceClassType)) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.Inheritance(_formPattern.DisplayName, inferenceClassName))
    }
    if (inferenceClassType.Abstract) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.CannotBeAbstract(_formPattern.DisplayName, inferenceClassName))
    }
    if (inferenceClassType.TypeInfo.getConstructor({}) == null) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.RequiresNoArgConstructor(_formPattern.DisplayName, inferenceClassName))
    }
  }

  function genericInferenceFieldsValid() {
    Context.addToVisited(this, "genericInferenceFieldsValid")
    if (_formPattern.HasCustomInference) {
      return
    }
    if (_formPattern.GenericInferenceClassRef != null) {
      _formPattern.GenericInferenceClassRef.validateCustomFields(_formPattern, this)
    }
  }

  function policyLineExists() {
    Context.addToVisited(this, "policyLineExists")
    if (_formPattern.PolicyLinePatternCode == null) {
      return
    }

    if (_formPattern.PolicyLinePatternRef.Pattern == null) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.LineDoesNotExist(_formPattern.DisplayName, _formPattern.PolicyLinePatternCode))
    }
  }

  function allProductsContainSelectedPolicyLine() {
    Context.addToVisited(this, "allProductsContainSelectedPolicyLine")
    if (_formPattern.PolicyLinePatternRef.Pattern == null) {
      return
    }

    var invalidProducts = _formPattern.Products.where(\ p -> not p.ProductPolicyLinePatterns.hasMatch(\ pp -> pp.PolicyLinePatternID == _formPattern.PolicyLinePatternCode))
    if (invalidProducts.HasElements) {
      var productCodesCsv = invalidProducts.map(\ p -> p.Code).join(", ")
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.LineNotInProducts(_formPattern.DisplayName, _formPattern.PolicyLinePatternRef.DisplayName, productCodesCsv))
    }
  }

  function policyLinePatternContainsSelectedClausePattern(){
     Context.addToVisited(this, "policyLinePatternDoesNotContainSelectedClausePattern")
    if (_formPattern.PolicyLinePatternCode == null) {
      return
    }
    if(_formPattern.ClausePatternCode == null){
      return
    }
    if(_formPattern.ClausePattern.CoverageCategory.PolicyLinePattern.Code != _formPattern.PolicyLinePatternCode){
     Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.ClauseNotInPolicyLine(_formPattern.DisplayName, _formPattern.ClausePattern,_formPattern.PolicyLinePatternRef.DisplayName))
    }
  }
  
  function everyProductContainsSelectedClausePattern(){
     Context.addToVisited(this, "everyProductContainsSelectedClausePattern")
    if (_formPattern.Products == null or _formPattern.Products.length == 0) {
      return
    }
    if(_formPattern.ClausePatternCode == null){
      return
    }
    var clausePolicyLineCode = _formPattern.ClausePattern.CoverageCategory.PolicyLinePattern.Code
    var violatingProduct =_formPattern.Products.firstWhere( \p -> not p.ProductPolicyLinePatterns.map(\productLine -> productLine.PolicyLinePattern.Code).contains(clausePolicyLineCode))
    if(violatingProduct != null)
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.ClauseNotValidForAnyLineOnProduct(_formPattern.DisplayName, _formPattern.ClausePattern,violatingProduct.DisplayName))
  }
  
  function policyLinePatternIsValidForGenericInferenceClass(){
    Context.addToVisited(this, "policyLinePatternIsValidForGenericInferenceClass")
    if (_formPattern.HasCustomInference or _formPattern.PolicyLinePatternCode == null) {
      return
    }
    var inferenceClassName = _formPattern.GenericInferenceClass
    if (inferenceClassName != null) {
      var inferenceClass = new FormInferenceClassRef(TypeSystem.getByFullNameIfValid(inferenceClassName))
      if(not inferenceClass.ValidPolicyLines.map( \lp -> lp.Code).contains(_formPattern.PolicyLinePatternCode)) {
        Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.Inference.PolicyLinePatternIsNotValidForInferenceClass(_formPattern.DisplayName, _formPattern.PolicyLinePatternCode,inferenceClassName))
      }
    }
  }

  function allCoverablePropertiesAreValid() {
    Context.addToVisited(this, "allCoverablePropertiesAreValid")
    
    if (_formPattern.ClausePattern == null) {
      return  
    }
    
    if (_formPattern.FormPatternCoverableProperties.Count == 0) {
      return  
    }
    
    var coverableType = TypeSystem.getByFullName("entity." + _formPattern.ClausePattern.OwningEntityType)
    var validCoverableProps = coverableType.TypeInfo.Properties.where(\ i -> i typeis IEntityPropertyInfo and 
            (i.FeatureType typeis ITypeList or i.FeatureType typeis IJavaType)).map(\ i -> i.Name)
    var invalidProperties = _formPattern.FormPatternCoverableProperties.where(\ f -> not validCoverableProps.contains(f.Name)).map(\ f -> f.Name)
    if (invalidProperties.HasElements) {
      Result.addError(_formPattern, "default", displaykey.Validation.FormPattern.InvalidCoverableProperties(_formPattern.DisplayName, _formPattern.ClausePattern.OwningEntityType, invalidProperties.join(", ")))
    }
  }

  private function findUseInsteadOfForm(formPattern : FormPattern) : FormPattern {
    if (formPattern.UseInsteadOfCode != null) {
      var useInsteadForm = formPattern.UseInsteadOfFormRef.FormPattern
      if (useInsteadForm == null) {
        var formPatternsToBeInserted = formPattern.Bundle.InsertedBeans.where(\ k -> k typeis FormPattern) as List<FormPattern>
        useInsteadForm = formPatternsToBeInserted.firstWhere(\ f -> f.Code == formPattern.UseInsteadOfCode)
      }
      return useInsteadForm
    }
    return null
  }
  
  private function findReferringRemovalEndorsementForms(formPattern : FormPattern) : Collection<FormPattern> {
    var q = Query.make(entity.FormPattern)
    q.compare("RemovalEndorsementFormNumber", Equals, formPattern.FormNumber)
    var formPatterns = q.select().toSet()
    
    var formPatternsFromBundle = new HashSet<FormPattern>()
    formPatternsFromBundle.addAll(formPattern.Bundle.UpdatedBeans.where(\ k -> k typeis FormPattern) as List<FormPattern>)
    
    // removing form patterns from query that have been updated
    formPatterns.removeWhere(\ f -> formPatternsFromBundle.contains(f))
    
    formPatternsFromBundle.addAll(formPattern.Bundle.InsertedBeans.where(\ k -> k typeis FormPattern) as List<FormPattern>)
     
    formPatterns.addAll(formPatternsFromBundle.where(\ f -> f.RemovalEndorsementFormNumber == formPattern.FormNumber)) 
            
    return formPatterns
  }
  
  private function findRemovalEndorsementForms(formPattern : FormPattern) : Collection<FormPattern> {
    var q = Query.make(entity.FormPattern)
    q.compare("FormNumber", Equals, formPattern.RemovalEndorsementFormNumber)
    var formPatterns = q.select().toSet()    
    
    var formPatternsFromBundle = new ArrayList<FormPattern>()
    formPatternsFromBundle.addAll(formPattern.Bundle.UpdatedBeans.where(\ k -> k typeis FormPattern) as List<FormPattern>)
    
    // removing form patterns from query that have been updated
    formPatterns.removeWhere(\ f -> formPatternsFromBundle.contains(f))
        
    formPatternsFromBundle.addAll(formPattern.Bundle.InsertedBeans.where(\ k -> k typeis FormPattern) as List<FormPattern>)

    formPatterns.addAll(formPatternsFromBundle.where(\ f -> f.FormNumber == formPattern.RemovalEndorsementFormNumber))
            
    return formPatterns
  }

  static function validateFormPattern(formPattern: FormPattern) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validation = new FormPatternValidation(context, formPattern)
      validation.validate()
    })
  }

}
