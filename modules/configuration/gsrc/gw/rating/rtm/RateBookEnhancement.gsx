package gw.rating.rtm

uses gw.api.database.DBFunction
uses gw.api.database.Query
uses gw.api.productmodel.PolicyLinePatternLookup
uses gw.api.system.PCDependenciesGateway
uses gw.api.util.DisplayableException
uses gw.rating.CostData
uses gw.rating.flow.domain.CalcRoutine
uses gw.rating.rtm.query.QueryStrategyHandler
uses gw.rating.rtm.query.RateBookQueryFilter
uses gw.rating.rtm.query.RatingQueryFacade
uses gw.rating.rtm.util.RatingConfig
uses gw.rating.rtm.valueprovider.ReferenceFactorValueProvider
uses gw.rating.worksheet.domain.WorksheetEntryContainer

uses java.lang.IllegalStateException
uses java.util.*

enhancement RateBookEnhancement : entity.RateBook {

  property get SelectedRateTables() : RateTable[] {
    return this.RateTables
  }

  property get OwnedTables() : RateTable[] {
    return this.RateTables.where(\ rt ->  rt.Owned)
  }

  function removeRateBook() {
    this.RateTables.each(\ rt -> rt.removeWithFactors())
    this.remove()
  }

  function addRateTable(table : RateTableDefinition) : RateTable {
    return addRateTables({table}).first()
  }

  function addRateTables(definitions : RateTableDefinition[]) : List<RateTable> {
    //refresh the definitions before validating
    definitions.each(\ def -> def.refresh())
    checkValidDefinitions(definitions)
    var ret = new ArrayList<RateTable>(definitions.Count)
    definitions.each(\ def -> ret.add(RateTableFactory.createNew(this, def)))
    return ret
  }

  function checkValidDefinitions(definitions : RateTableDefinition[]) {
    if (containInvalidDefs(definitions)) {
      var invalidEntities = definitions.where(\ def -> not def.hasValidEntity())
      throw new DisplayableException(displaykey.Web.Rating.Errors.InvalidEntity(invalidEntities*.TableCode.join(", ")))
    }
    var invalidLines = definitions.where(\ def -> def.PolicyLine != this.PolicyLine)
    if(invalidLines.HasElements){
      throw new DisplayableException(displaykey.Web.Rating.Errors.InvalidPolicyLine(invalidLines*.TableCode.join(", ")))
    }
  }

  function containInvalidDefs(definitions : RateTableDefinition[]) : boolean {
    return definitions.hasMatch(\ def -> !def.hasValidEntity())
  }

  function removeRateTables(rateTables : RateTable[]) {
    rateTables.each(\ t -> t.removeWithFactors())
  }

  function availableRateTables(policyLine : String) : RateTableDefinition[] {
    var allTables = Query.make(RateTableDefinition)
          .compare("PolicyLine", Equals, policyLine)
          .select().toTypedArray()
    return allTables.subtract(this.SelectedRateTables*.Definition).toTypedArray()
  }

  /**
   * Changes the status of the ratebook.  It also updates the last status change date for the ratebook.
   * Validation of the books state before change status can be enabled or disabled using the validate
   * parameter.
   *
   * @param status newStatus status to change the rate book to
   * @param validate If true, validate the current book's state before changing to the target status
   *                 If false, validation is skipped
   */
  function changeStatusTo(newStatus : RateBookStatus, validate : boolean) {
    if (validate) {
      switch (newStatus) {
        case TC_ACTIVE:
        case TC_APPROVED:
        case TC_DRAFT:
          break
        case TC_STAGE:
          validateChangeToStage()
          break
        default:
          throw new IllegalStateException("Failed to change unknown status: " + newStatus.DisplayName)
      }
    }
    StatusAndUpdateChangeDate = newStatus
  }

  private property set StatusAndUpdateChangeDate(newStatus : RateBookStatus) {
      this.Status = newStatus
      this.LastStatusChangeDate = Date.CurrentDate
    }

  function stage() {
    validateChangeToStage()
    StatusAndUpdateChangeDate = RateBookStatus.TC_STAGE
  }

  // TODO: add validation for all state transitions
  function approve() {
    StatusAndUpdateChangeDate = RateBookStatus.TC_APPROVED
  }

  function returnToDraft() {
    StatusAndUpdateChangeDate = RateBookStatus.TC_DRAFT
  }

  function activate() {
    StatusAndUpdateChangeDate = RateBookStatus.TC_ACTIVE
  }

  function hasTablesAndFactors() : boolean {
    return (this.RateTables.Count > 0) and
            !this.RateTables.hasMatch(\ rt -> rt.Factors.Empty)
  }

  // TODO: Move this to a separate validation class?
  private function validateChangeToStage() {
    if (!isDraft()) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.RateBookBadStatusTransition(this.Status.DisplayName, RateBookStatus.TC_STAGE))
    }
    if (this.RateTables.Count > 0) {
      var emptyRateTables = rateTablesWithoutFactors()
      if (emptyRateTables.Count > 0) {
        throw new DisplayableException(
          displaykey.Web.Rating.Errors.RateTableMissingFactors(emptyRateTables.map(\ rt -> rt.Definition.TableCode).join(", "))
        )
      }
      new QueryStrategyHandler().setTableStrategyFor(this)
    } else if (this.RateBookCalcRoutines.Count == 0) {
      throw new DisplayableException(
        displaykey.Web.RatingErrors.FailEmptyRateBookPromotionToStaging)
    }

    var missingReferencedTableCodes = getMissingRateTableReferences()
    if (!missingReferencedTableCodes.Empty) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.RateBookMissingTableReferences(missingReferencedTableCodes))
    }


    if (this.RateBookCalcRoutines.Count > 0) {
      // validate rate routines
      var invalidRoutines : List<CalcRoutineDefinition> = {}
      for (def in this.RateBookCalcRoutines.map(\ r -> r.CalcRoutineDefinition)) {
        var ctx = new gw.validation.PCValidationContext("default")
        var validator = new gw.rating.flow.validation.RateRoutineValidation(ctx, def)
        // do all validations except calcRoutineCannotBeUpdatedIfReferencedByNonDraftBook()
        validator.validate(EXPORT)
        if (ctx.Result.hasErrors()) {
          invalidRoutines.add(def)
        }
      }
      if (invalidRoutines.HasElements) {
        throw new DisplayableException(
          displaykey.Web.Rating.Errors.InvalidRateRoutines(invalidRoutines.map(\ r -> r.Code).join(","))
        )
      }
    }
  }

  // Returns the list of Rate Table Codes referenced directly by this RateBook

  private property get RateTableCodes() : Set<String> {
      var codes : Set<String> = {}
      codes.addAll(this.RateTables.map(\ r -> r.Definition.TableCode) as Collection<String>)
      return codes
    }

  // Returns the list of Rate Table Codes referenced by other rate tables that are missing in this RateBook

  private property get MissingRateTableReferences() : List<String> {
      var references = getRateTableCodes()
      var missingTableReferences : List<String> = {}
      this.RateTables.each(\ t -> {
        t.Definition.AllColumns.each(\col -> {
          var valueProvider = gw.rating.rtm.valueprovider.Parser.parse(col.ValueProvider)
          if (valueProvider.ClassName == ReferenceFactorValueProvider.Type.Name) {
            var referencedRateTableCode = valueProvider.Arguments.first()
            if (!references.contains(referencedRateTableCode)) {
              missingTableReferences.add(referencedRateTableCode + " (referenced by " + t.Definition.TableCode + ")")
            }
          }
        })
      })
      return missingTableReferences
    }

  private function rateTablesWithoutFactors() : RateTable[] {
    return this.RateTables.where(\ table -> table.Empty)
  }

  // Create a new rate book, prepopulating it with the same rate tables as the
  // existing Active (in production) rate book.  The name/version/description of the new rate book
  // will need to be set by the user.
  function versionRateBook() : RateBook {
    var newRateBook = copyBook()
    createRefTables(newRateBook)
    copyRateRoutines(newRateBook)
    return newRateBook
  }

  private function createRefTables(newRateBook : RateBook) {
    this.RateTables.each(\ srcTable -> {
      var refTable = RateTableFactory.createFrom(srcTable)
      refTable.RateBook = newRateBook
    })
  }

  private function copyRateRoutines(newRateBook : RateBook) {
    newRateBook.addCalcRoutines( this.CalcRoutines )
  }

  private function copyBook() : RateBook {
    var copy = new RateBook()
    copy.BookCode = this.BookCode
    copy.BookName = this.BookName
    copy.BookDesc = this.BookDesc
    copy.BookOffering = this.BookOffering
    copy.BookJurisdiction = this.BookJurisdiction
    copy.UWCompany = this.UWCompany
    copy.LastStatusChangeDate = Date.CurrentDate
    copy.PolicyLine = this.PolicyLine

    // copy the fields for other locales too
    var languages = gw.api.util.LocaleUtil.getAllLanguages() as LanguageType[]
    for (language in languages) {
      copy["BookName_" + language.Code] = this["BookName_" + language.Code]
      copy["BookDesc_" + language.Code] = this["BookDesc_" + language.Code]
    }

    return copy
  }

  function policyLineCodeToDescription(code : String) : String {
    return PolicyLinePatternLookup.getByCode(code).DisplayName
  }

  function isActive() : boolean {
    return this.Status == RateBookStatus.TC_ACTIVE
  }

  function isApproved() : boolean {
    return this.Status == RateBookStatus.TC_APPROVED
  }

  function isDraft() : boolean {
    return this.Status == RateBookStatus.TC_DRAFT
  }

  function isStage() : boolean {
    return this.Status == RateBookStatus.TC_STAGE
  }

  function availableUWCompanies() : UWCompany[] {
    var result = PCDependenciesGateway.getUWCompanyFinder().findUWCompanies()
    return result.toTypedArray()
  }

  property get CalcRoutines() : CalcRoutineDefinition[] {
    return this.RateBookCalcRoutines*.CalcRoutineDefinition
  }

  property get updatedCalcRoutines() : CalcRoutineDefinition[] {
    var savedRoutines =  this.RateBookCalcRoutines*.CalcRoutineDefinition
    var q = Query.make(CalcRoutineDefinition)
    q.compare("PolicyLinePatternCode", Equals, this.PolicyLine)
    var existingRoutines = q.select()
    var deletedRoutine = savedRoutines.firstWhere(\ routine ->
      existingRoutines.countWhere(\ existRoutine -> existRoutine == routine)== 0
    )
    return deletedRoutine == null ? savedRoutines : savedRoutines.disjunction({deletedRoutine}).toTypedArray()
  }

  function availableCalcRoutines(includeOnlyMaxVersions : boolean) : CalcRoutineDefinition[] {
    var updatedCalcRoutinesCodes = updatedCalcRoutines*.Code

    /**
     * To get the max version we would normally execute SQL like this:
     *   SELECT MAX(Version), Code, Jurisdiction FROM pc_calcroutinedefinition GROUP BY Code, Jurisdiction
     * But the Query Layer does not support an aggregate function with group by.
     * The recommended work-around is to join the table to itself and perform the MAX function on the subselect.
     * Note: Jurisdiction might be null so we need an OR restriction with an AND restriction below it.
     *   (root.juristiction = subselect.jurisdiction)
     *   OR
     *   ( (root.jurisdiction IS NULL) AND (subselect.jurisdiction IS NULL) )
     *
     */
    var q = Query.make(CalcRoutineDefinition)
    q.compare("PolicyLinePatternCode", Equals, this.PolicyLine)
    if (includeOnlyMaxVersions) {
      var subselectQuery = Query.make(CalcRoutineDefinition)
      subselectQuery.compare("Code", Equals, q.getColumnRef("Code"))
      for (branchingField in CalcRoutineDefinition.BranchingFields) {
        subselectQuery.or(\ orRestriction -> {
          orRestriction.compare(branchingField, Equals, q.getColumnRef(branchingField))
          orRestriction.and(\ andRestriction -> {
            andRestriction.compare(q.getColumnRef(branchingField), Equals, null)
            andRestriction.compare(subselectQuery.getColumnRef(branchingField), Equals, null)
          })
        })
      }
      q.subselect("Version", CompareIn, subselectQuery, DBFunction.Max(subselectQuery.getColumnRef("Version")))
    }

    var rows = q.select()
    return rows.where(\ c -> not updatedCalcRoutinesCodes.contains(c.Code)).toTypedArray()
  }

  function addCalcRoutines( routines :  CalcRoutineDefinition[] ) {
    // Ensure calc routines with duplicate codes cannot be added
    if(updatedCalcRoutines*.Code.intersect(routines*.Code).Count > 0){
       throw new DisplayableException(displaykey.Web.Rating.Errors.DuplicateCalcRoutineCodes)
    }

    for( routine in routines ){
      var rbcr = new RateBookCalcRoutine()
      rbcr.RateBook = this
      rbcr.CalcRoutineDefinition = routine
      this.addToRateBookCalcRoutines(rbcr)
    }

    // Display warning. Allow users to add routines with missing tables.
    var missingTables = this.rateTablesMissingInCalcRoutines
    if (missingTables.HasElements) {
      throw new DisplayableException(displaykey.Web.Rating.Errors.RateTableMissingFromRateBook(missingTables))
    }
  }

  function removeCalcRoutines( routines : CalcRoutineDefinition[] ) {
    this.RateBookCalcRoutines
      .where(\ rbcr -> routines.contains(rbcr.CalcRoutineDefinition))
      .each(\ rbcr -> this.removeFromRateBookCalcRoutines(rbcr) )
  }

  function getCalcRoutine(code : String) : CalcRoutineDefinition {
    var routines = CalcRoutines.where(\ c -> c.Code == code)
    if (routines.Count == 1) {
      return routines.single()
    } else if (routines.Count == 0){
      throw new DisplayableException(displaykey.Web.Rating.Errors.MissingCalcRoutineCode("${this.BookCode} v. ${this.BookEdition}" , code))
    } else {
      throw new DisplayableException(displaykey.Web.Rating.Errors.DuplicateCalcRoutineCodes)
    }
  }

  function executeCalcRoutine(code : String, costData : CostData<Cost, PolicyLine>,
                              worksheetContainer : WorksheetEntryContainer,
                              paramSet : Map<CalcRoutineParamName,Object>)  {
    CalcRoutine.create(getCalcRoutine(code)).executeRoutine(this, costData, worksheetContainer, paramSet)
  }

  @Deprecated("Use executeCalcRoutine(code, costData, worksheetContainer, paramSet) instead")
  function executeCalcRoutine(code : String, costData : CostData<Cost, PolicyLine>,
                              paramSet : Map<CalcRoutineParamName,Object>) {
    executeCalcRoutine(code, costData, costData, paramSet)
  }

  static function selectRateBook(refDate : Date,
                                 baseRatingDate : Date,
                                 linePatternCode : String,
                                 jurisdiction : Jurisdiction,
                                 minimumRatingLevel : RateBookStatus,
                                 isRenewal : boolean,
                                 offeringCode : String,
                                 uwCompany : UWCompany = null) : RateBook {

    var filter = new RateBookQueryFilter(refDate, baseRatingDate, linePatternCode)
        {:MinimumRatingLevel = minimumRatingLevel,
            :RenewalJob = isRenewal,
            :Jurisdiction = jurisdiction,
            :Offering = offeringCode,
            :UWCompany = uwCompany}

    var matches = RatingQueryFacade.matchRateBook(filter, RatingQueryFacade.matchers(filter))
    return RatingQueryFacade.latestActiveBook(matches)
  }

  property get Empty() : boolean {
    return not (this.RateTables.HasElements or this.RateBookCalcRoutines.HasElements)
  }

  property get RateTablesMissingInCalcRoutines() : Set<String>  {
    var missingRateTableCodes : Set<String> = {}

    for (routine in this.CalcRoutines) {
      var tableSteps = routine.Steps.where(\ step -> step.Operands.hasMatch(\ op -> op.OperandType == TC_RATETABLE))
      for (step in tableSteps) {
        var rateTable = step.Operands.singleWhere(\ op -> op.OperandType == TC_RATETABLE and op.TableCode != null)
        if (!RateTableCodes.contains(rateTable.TableCode)) {
          missingRateTableCodes.add(rateTable.TableCode)
        }
      }
    }
    return missingRateTableCodes
  }

}
