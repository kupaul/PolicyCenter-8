package gw.admin

uses gw.admin.PatternRef
uses gw.api.admin.FormPatternUtil
uses gw.api.database.Query
uses gw.api.forms.FormsLogger
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.productmodel.PolicyLinePatternLookup
uses gw.api.productmodel.Product
uses gw.api.system.PCDependenciesGateway
uses gw.api.util.LocaleUtil
uses gw.forms.CreatesMultipleForms
uses gw.forms.FormData
uses gw.lang.reflect.TypeSystem

uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.lang.Throwable
uses java.util.ArrayList
uses java.util.Collection
uses java.util.List

enhancement FormPatternEnhancement : entity.FormPattern {

  static function createOrDuplicateFormPattern(sourceFormPattern : FormPattern) : FormPattern {
    return sourceFormPattern == null ? createFormPattern() : duplicateFormPattern(sourceFormPattern)
  }

  private static function createFormPattern() : FormPattern {
    var newFormPattern = new FormPattern()
    newFormPattern.EndorsementNumbered = false
    newFormPattern.InferenceTime = FormInferenceTime.TC_QUOTE
    newFormPattern.Priority = -1
    newFormPattern.InternalRemovalEndorsement = false
    newFormPattern.InternalReissueOnChange = false
    newFormPattern.addToLookups(createDefaultLookup())
    return newFormPattern
  }

  private static function createDefaultLookup() : FormPatternLookup {
    var lookup = new FormPatternLookup() {
      :Availability = AvailabilityType.TC_AVAILABLE,
      :StartEffectiveDate = java.util.Date.Today
    }
    return lookup
  }

  private static function duplicateFormPattern(sourceFormPattern : FormPattern) : FormPattern {
    var dupFormPattern = sourceFormPattern.shallowCopy() as FormPattern

    dupFormPattern.Code = displaykey.Web.Admin.FormPatternDetail.BasicsDV.CodeCopy(sourceFormPattern.Code)
    dupFormPattern.FormNumber = displaykey.Web.Admin.FormPatternDetail.BasicsDV.NumberCopy(sourceFormPattern.FormNumber)

    // shallowCopy() doesn't handle localized fields
    for (var lang in LocaleUtil.getAllLanguages()) {
      if (sourceFormPattern["Description_${lang.Code}"] != null) {
        dupFormPattern["Description_${lang.Code}"] = sourceFormPattern["Description_${lang.Code}"]
      }
    }

    for (var sourceFormPatternProduct in sourceFormPattern.FormPatternProducts) {
      dupFormPattern.addToFormPatternProducts(sourceFormPatternProduct.shallowCopy() as FormPatternProduct)
    }
    for (var sourceFormPatternJob in sourceFormPattern.FormPatternJobs) {
      dupFormPattern.addToFormPatternJobs(sourceFormPatternJob.shallowCopy() as FormPatternJob)
    }
    for (var sourceFormPatternLookup in sourceFormPattern.Lookups) {
      dupFormPattern.addToLookups(sourceFormPatternLookup.shallowCopy() as FormPatternLookup)
    }
    for (var sourceFormPatternCovTerm in sourceFormPattern.FormPatternCovTerms) {
      var dupCovTerm = sourceFormPatternCovTerm.shallowCopy() as FormPatternCovTerm
      dupFormPattern.addToFormPatternCovTerms(dupCovTerm)
      for(var sourceFormPatternCovTermValue in sourceFormPatternCovTerm.SelectedCovTermValues)
        dupCovTerm.addToSelectedCovTermValues(sourceFormPatternCovTermValue.shallowCopy() as FormPatternCovTermValue)
    }
    for(var sourceFormPatternCoverableProp in sourceFormPattern.FormPatternCoverableProperties) {
      dupFormPattern.addToFormPatternCoverableProperties(sourceFormPatternCoverableProp.shallowCopy() as FormPatternCoverableProperty)
    }

    return dupFormPattern
  }

  function addProduct(product : Product) : Product {
    if (this.FormPatternProducts.firstWhere(\ f -> f.ProductCode == product.Code) != null) {
      throw new IllegalStateException("Product \"${product.Code}\" is already added to this FormPattern")
    }
    var formPatternProduct = new FormPatternProduct()
    formPatternProduct.ProductCode = product.Code
    this.addToFormPatternProducts(formPatternProduct)
    return product
  }

  function removeProduct(product : Product) {
    var formPatternProduct = this.FormPatternProducts.firstWhere(\ f -> f.ProductCode == product.Code)
    if (formPatternProduct == null) {
      throw new IllegalStateException("Product \"${product.Code}\" not found in this FormPattern")
    }
    this.removeFromFormPatternProducts(formPatternProduct)
  }

  function addJobs(jobsToAdd : typekey.Job[]) : typekey.Job[] {
    // Remove jobs that were already added from jobsToAdd
    jobsToAdd = jobsToAdd.subtract(this.FormPatternJobs.map(\ f -> f.JobType)).toTypedArray()
    for (job in jobsToAdd) {
      var formPatternJob = new FormPatternJob()
      formPatternJob.JobType = job
      this.addToFormPatternJobs(formPatternJob)
    }
    return jobsToAdd
  }

  function addJob(job : typekey.Job) : typekey.Job {
    if (this.FormPatternJobs.firstWhere(\ f -> f.JobType == job) != null) {
      throw new IllegalStateException("\"${job}\" is already added to this FormPattern")
    }
    var formPatternJob = new FormPatternJob()
    formPatternJob.JobType = job
    this.addToFormPatternJobs(formPatternJob)
    return job
  }

  function removeJob(job : typekey.Job) {
    var formPatternJob = this.FormPatternJobs.firstWhere(\ f -> f.JobType == job)
    if (formPatternJob == null) {
      throw new IllegalStateException("\"${job}\" not found in this FormPattern")
    }
    this.removeFromFormPatternJobs(formPatternJob)
  }

  /**
   * @return an array of {@link gw.api.productmodel.Product} POJOs designated by this
   * FormPattern's FormPatternProducts array, in the same order as the array entries.
   */
  property get Products() : Product[] {
    return this.FormPatternProducts.map(\ f -> PCDependenciesGateway.getProductModel().getPattern(f.ProductCode, Product))
  }

  /**
   * @return an unsorted array of all {@link gw.api.productmodel.Product} POJOs that are
   * not already designated by this FormPattern's FormPatternProducts array. Ignores
   * "Availability" as determined by the Product availability lookups.
   */
  property get AvailableProducts() : Product[] {
    var addedProductCodes =  this.FormPatternProducts.map(\ f -> f.ProductCode).toSet()
    return PCDependenciesGateway.getProductModel().getAllInstances(Product).where(\ p -> not addedProductCodes.contains(p.Code)).toTypedArray()
  }

  /**
   * @return an array of Job typekeys designated by this FormPattern's FormPatternJobs
   * array, in the same order as the array entries.
   */
  property get Jobs() : typekey.Job[] {
    return this.FormPatternJobs.map(\ f -> f.JobType)
  }

  /**
   * @return an unsorted array of all Job typekeys that are  not already designated by this
   * FormPattern's FormPatternJobs array.
   */
  property get AvailableJobs() : typekey.Job[] {
    var addedJobs =  this.FormPatternJobs.map(\ f -> f.JobType).toSet()
    var filteredJobs = typekey.Job.Type.getTypeKeysByFilterName("FormPatternJobs") as List<typekey.Job>
    return (filteredJobs == null) ? new typekey.Job[]{} : filteredJobs.where(\ j -> not addedJobs.contains(j)).toTypedArray()
  }

  function hasJob(jobType : typekey.Job) : boolean {
    return this.FormPatternJobs.firstWhere(\ f -> f.JobType == jobType) != null
  }

  function createAndAddLookup() : FormPatternLookup {
    var lookup = new FormPatternLookup()
    this.addToLookups(lookup)
    return lookup
  }
  
  property get MaximumNumberOfRowsToBeDuplicated(): Integer {
    return 10
  }
  
  property get NumberOfTimesThatRowsCanBeDuplicated() : Integer[]{
    var result= new ArrayList<Integer>()
    for (i in 1..MaximumNumberOfRowsToBeDuplicated)
      result.add(i)
    return result.toTypedArray()
  }

  function duplicateLookups(lookups : FormPatternLookup[]) : FormPatternLookup[] {
    return duplicateMultipleLookups(1, lookups)
  }
  
  

  function duplicateMultipleLookups(numberOfTimes: int, lookups : FormPatternLookup[]) : FormPatternLookup[] {
    var duplicates = new ArrayList<FormPatternLookup>()
    for (var lookup in lookups) {
      for (i in 0 .. numberOfTimes - 1) {
        var dup = new FormPatternLookup() {
          :Availability = lookup.Availability,
          :StartEffectiveDate = lookup.StartEffectiveDate,
          :EndEffectiveDate = lookup.EndEffectiveDate,
          :Jurisdiction = lookup.Jurisdiction,
          :UWCompanyCode = lookup.UWCompanyCode
        }
        this.addToLookups(dup)
        duplicates.add(dup)
      }
    }
    return duplicates.toTypedArray()
 }

  property get RemovalEndorsement() : boolean {
    return this.InternalRemovalEndorsement and this.hasJob(typekey.Job.TC_POLICYCHANGE)
  }

  property set RemovalEndorsement(value : boolean) {
    this.InternalRemovalEndorsement = value
  }

  property get ReissueOnChange() : boolean {
    return this.InternalReissueOnChange and this.hasJob(typekey.Job.TC_POLICYCHANGE)
  }

  property set ReissueOnChange(value : boolean) {
    this.InternalReissueOnChange = value
  }

  /**
   * @return the form numbers of all form patterns that have InternalRemovalEndorsement set
   * to true, plus this one's current RemovalEndorsementFormNumber, regardless of whether it
   * is valid.
   */
  property get RemovalEndorsementFormNumbersRange() : String[] {
    var q = Query.make(FormPattern)
    q.compare("InternalRemovalEndorsement", Equals, true)
    var removalEndorsementFormNumbers = q.select().toList().map(\ f -> f.FormNumber).toSet()

    if (this.RemovalEndorsementFormNumber != null) {
      if (not removalEndorsementFormNumbers.contains(this.RemovalEndorsementFormNumber)) {
        removalEndorsementFormNumbers.add(this.RemovalEndorsementFormNumber)
      }
    }
    return removalEndorsementFormNumbers.toTypedArray()
  }

  property get GroupCode() : String {
    return this.InternalGroupCode != null ? this.InternalGroupCode : this.FormNumber
  }

  /**
   * @return references to all other form patterns with the same GroupCode, or empty
   * array if GroupCode is null; if the current value of UseInsteadOfCode refers to
   * a form pattern that no longer exists, the results will have a reference for that
   * code, but its FormPattern will be null.
   */
  property get UseInsteadRange() : FormPatternRef[] {
    var useInsteadOfFormPatterns : List<FormPattern> = null
    if (this.GroupCode != null) {
      useInsteadOfFormPatterns = makeGroupQuery(true).select().toList()
    } else {
      useInsteadOfFormPatterns = {}
    }

    var refsList = useInsteadOfFormPatterns.map(\ f -> new FormPatternRef(f))
    if (this.UseInsteadOfCode != null) {
      if (useInsteadOfFormPatterns.firstWhere(\ f -> f.Code == this.UseInsteadOfCode) == null) {
        refsList.add(UseInsteadOfFormRef)
      }
    }
    return refsList.toTypedArray()
  }

  property get UseInsteadOfFormRef() : FormPatternRef {
    if (this.UseInsteadOfCode != null) {
      return loadFormRef(this.UseInsteadOfCode)
    }
    return null
  }

  property set UseInsteadOfFormRef(formPatternRef : FormPatternRef) {
    if (formPatternRef != null) {
      this.UseInsteadOfCode = formPatternRef.Code
    } else {
      this.UseInsteadOfCode = null
    }
  }

  function loadFormRef(formCode : String) : FormPatternRef {
    var form = getByCode(formCode)
    return form != null ? new FormPatternRef(form) : new FormPatternRef(formCode)
  }

  function makeGroupQuery(excludeThis : boolean) : Query<FormPattern> {
    if (this.GroupCode == null) {
      throw new IllegalStateException("GroupCode required")
    }
    var q = Query.make(FormPattern)
    if (excludeThis) {
      q.compare("Code", NotEquals, this.Code)
    }
    q.or(\ or1 -> {
      or1.compare("InternalGroupCode", Equals, this.GroupCode)
      or1.and(\ and1 -> {
        and1.compare("FormNumber", Equals, this.GroupCode)
        and1.compare("InternalGroupCode", Equals, null)
      })
    })
    return q
  }

  /**
   * @return references to all classes that implement {@link gw.forms.GenericFormInference}
   * and are applicable to given policyLine.
   * If the current value of GenericInferenceClass refers to a class that does not exist or
   * is invalid, the results will still contain a reference for it.
   */
  function getGenericInferenceClassRange(policyLine : PolicyLinePattern) : FormInferenceClassRef[] {
    var intf = gw.forms.GenericFormInference.Type
    var inferenceClasses = intf.Subtypes.where(\ i -> not i.Interface)
    var refsList = inferenceClasses.map(\ i -> new FormInferenceClassRef(i))
    if (policyLine != null) { // apply filter if specified
      refsList = refsList.where(\ ref -> ref.ValidPolicyLines.contains(policyLine))
    } else {
      refsList = refsList.where(\ ref -> ref.ValidPolicyLines.containsAll(PolicyLinePatternLookup.getAll()))
    }
    if (this.GenericInferenceClass != null) { // include current value
      if (refsList.firstWhere(\ c -> c.Path == this.GenericInferenceClass) == null) {
        refsList.add(new FormInferenceClassRef(this.GenericInferenceClass))
      }
    }
    return refsList.toTypedArray()
  }

  property get GenericInferenceClassRef() : FormInferenceClassRef {
    if (this.GenericInferenceClass != null) {
      var inferenceClassType = TypeSystem.getByFullNameIfValid(this.GenericInferenceClass)
      return gw.forms.GenericFormInference.Type.isAssignableFrom(inferenceClassType) ? new FormInferenceClassRef(inferenceClassType) : new FormInferenceClassRef(this.GenericInferenceClass)
    } else {
      return null // will display as "<none selected>"
    }
  }

  property set GenericInferenceClassRef(inferenceClassRef : FormInferenceClassRef) {
    if (inferenceClassRef != null) {
      this.GenericInferenceClass = inferenceClassRef.Path
    } else {
      this.GenericInferenceClass = null
    }
  }

  property get HasCustomInference() : boolean {
    return this.CustomInferenceClass != null
  }

  property get CustomInferenceClass() : String {
    if (this.Code == null) {
      return null
    }
    return FormPatternUtil.getCustomFormInferenceClass(this.Code)
  }

  property get InferenceClassMode() : String {
    var mode = ""
    if (this.GenericInferenceClass != null) {
      mode = this.GenericInferenceClass.substring(this.GenericInferenceClass.lastIndexOf(".") + 1)
    }
    return mode.HasContent ? mode : "default"
  }

  /**
   * @return a list of all {@link gw.api.productmodel.PolicyLinePattern} POJOs that
   * are shared by this FormPattern's selected products;
   * if the current value of PolicyLinePatternCode refers to a pattern that does not exist or
   * is invalid, the results will still contain a reference for it.
   */
  property get PolicyLinePatternRange() : List<PatternRef<PolicyLinePattern>> {
    var lines = (this.Products.HasElements) ? PolicyLinePatternLookup.getAll() : new ArrayList<PolicyLinePattern>()
    this.Products.each(\ p -> {lines = lines.intersect(p.LinePatterns.toSet()).toList()})

    var refsList = lines.map(\ p -> new PatternRef<PolicyLinePattern>(p))
    if (this.PolicyLinePatternCode != null) {
      if (refsList.firstWhere(\ c -> c.Code == this.PolicyLinePatternCode) == null) {
        refsList.add(loadPolicyLinePatternRef(this.PolicyLinePatternCode))
      }
    }
    return refsList
  }

  property get PolicyLinePatternRef() : PatternRef<PolicyLinePattern> {
    if (this.PolicyLinePatternCode != null) {
      return loadPolicyLinePatternRef(this.PolicyLinePatternCode)
    }
    return null
  }

  property set PolicyLinePatternRef(ref : PatternRef<PolicyLinePattern>) {
    if (ref != null) {
      this.PolicyLinePatternCode = ref.Code
    } else {
      this.PolicyLinePatternCode = null
    }
  }

  function loadPolicyLinePatternRef(code : String) : PatternRef<PolicyLinePattern> {
    var pattern = gw.api.productmodel.PolicyLinePatternLookup.getByCode(code)
    return pattern != null ? new PatternRef<PolicyLinePattern>(pattern) : new PatternRef<PolicyLinePattern>(code)
  }

  /**
   * Helper function to reset dependent values that are not editable because of
   * UI changes.
   */
  function clearHiddenFieldsBeforeCommit() {
    if (this.hasJob(typekey.Job.TC_POLICYCHANGE)) {
      if (this.InternalRemovalEndorsement) {
        this.InternalReissueOnChange = false
      }
      if (not this.InternalReissueOnChange) {
        this.RemovalEndorsementFormNumber = null
      }
    } else {
      this.InternalRemovalEndorsement = false
      this.InternalReissueOnChange = false
      this.RemovalEndorsementFormNumber = null
    }
  }

  // ---------------------------------------------------------- API methods from old product model FormPattern (scriptable POJO methods)

  /**
   * Retrieves a FormPattern with the specified code.
   */
  static function getByCode(code : String) : FormPattern {
    return FormPatternUtil.getByCode(code)
  }

  /**
   * Returns all the FormPatterns in the system.
   */
  static property get AllPatterns() : Collection<? extends FormPattern> {
    var q = Query.make(FormPattern)
    return q.select().toCollection()
  }

/*
  public boolean isAvailable(State state, Date lookupDate, UWCompany uwCompany) {
    return _lookupCache.get().isAvailable(state, lookupDate, uwCompany == null ? null : uwCompany.getCode());
  }

  public Set<State> getPossibleStates() {
    return _lookupCache.get().getAllPossiblyAvailableStates();
  }
*/

  /**
   * Returns the data object class as an object.
   */
  public property get InferenceClassAsObject() : Object {
    return this.InferenceClass
  }

  /**
   * This property determines the text that will end up in the FormDescription field on the Form.  By default this will just
   * be the description on the FormPattern, but it can be overridden by subclasses to give more details about, for example,
   * why the form is being added or what it relates to
   */
  property get FormDescription() : String {
    return this.Description
  }

  // ---------------------------------------------------------- API methods from old product model FormPattern (enhancement methods)

  /**
   * Returns the inference class associated with this pattern.
   */
  property get InferenceClass() : Type<FormData> {
    var className = this.CustomInferenceClass
    if (className == null) {
      className = this.GenericInferenceClass
    }

    return TypeSystem.getByFullName(className)
  }

  function createFormInferenceClass() : FormData {
    var constructor = this.InferenceClass.TypeInfo.Constructors.firstWhere(\ i -> i.Parameters.Count == 0)
    if (constructor == null) {
      FormsLogger.logError("No no-arg constructor found for class ${this.InferenceClass.Name}. The associated form pattern will be ignored.")
      return null
    }
    try {
      var formData = constructor.Constructor.newInstance(null) as FormData
      formData.Pattern = this
      return formData
    } catch (e : Throwable) {
      FormsLogger.logError("Exception while attempting to construct class ${this.InferenceClass.Name}. The form pattern will be skipped.", e)
      return null
    }
  }

  /**
   * Returns true if the associated class implements the CreatesMultipleForms interface, false otherwise.
   */
  property get CreatesMultipleForms() : boolean {
    return gw.forms.CreatesMultipleForms.Type.isAssignableFrom(this.InferenceClass)
  }

  /**
   * Given a pre-existing form that uses this pattern, gets the match key for the form by assuming it implements the
   * CreatesMultipleForms interface.
   */
  function getMatchKeyForForm(f : Form) : String {
    // This isn't particularly efficient . . .
    var formData = this.InferenceClass.TypeInfo.Constructors.firstWhere(\ i -> i.Parameters.Count == 0).Constructor.newInstance(null) as CreatesMultipleForms
    (formData as FormData).Pattern = this
    return formData.getMatchKeyForForm(f)
  }

  /**
   * Returns the priority to use when ordering forms by pattern.  Lower priority integers are sorted first, and forms
   * with null or default (-1) priority are treated as having Integer.MAX_VALUE as their priority.
   */
  property get SortPriority() : Integer {
    var priority = this.Priority
    if (priority == null or priority == -1) {
      return Integer.MAX_VALUE
    } else {
      return priority
    }
  }

}
