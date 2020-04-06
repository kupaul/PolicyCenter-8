package gw.rating.flow

uses gw.api.database.Query
uses gw.api.database.DBFunction
uses gw.rating.flow.util.CopyVersionType
uses gw.rating.flow.util.QueryUtils
uses gw.api.util.DisplayableException
uses gw.api.database.InOperation
uses gw.rating.flow.domain.ParseUtil
uses gw.validation.PCValidationContext
uses gw.plugin.Plugins
uses gw.plugin.rateflow.IRateRoutinePlugin
uses gw.api.productmodel.PolicyLinePatternLookup

enhancement CalcRoutineDefinitionEnhancement : entity.CalcRoutineDefinition {

  static function availableTables(line: String) : List<RateTableDefinition> {
    return QueryUtils.getRateTableDefinitionsForLine(line)
  }

  function availableTables(): List<RateTableDefinition> {
    return CalcRoutineDefinitionEnhancement.availableTables(this.PolicyLinePatternCode)
  }

  property get PolicyLineDisplayName() : String {
    return PolicyLinePatternLookup.getByCode(this.PolicyLinePatternCode).DisplayName
  }

  property get OrderedSteps() : List<CalcStepDefinition>{
    return this.Steps.OrderedByStepSortOrder
  }

  /**
   * @returns the list of steps in order, excluding any steps which return false from the cond() block.
   */
  function FilteredOrderedSteps(cond(elt:CalcStepDefinition):boolean) : List<CalcStepDefinition>{
    return this.Steps.where(\ c -> cond(c) ).OrderedByStepSortOrder
  }

  /**
   * A Copy sets the Version = 1 and makes copies of the Code and Name
   * A Version bumps the Version and retains the same Code and Name
   * A Branch sets the Version = 1, retains the same Code, while the Name and Jurisdiction are allowed to change.
   *   For validation, the Jurisdiction MUST change or else the uniqueness constraint will be violated.
   */
  function initializeCopy(copyVersionType : CopyVersionType) : CalcRoutineDefinition {
    var newRoutineDefinition = this.copy() as CalcRoutineDefinition 
     
    if (copyVersionType == VERSION) {
      newRoutineDefinition.setFieldValue("Version", this.Version + 1)
    } else if (copyVersionType == COPY or copyVersionType == BRANCH) {
      newRoutineDefinition.setFieldValue("Version", 1)
    }
    
    if (copyVersionType == COPY) {
      newRoutineDefinition.Code = displaykey.Web.Rating.RateRoutines.CopyPrefix(this.Code)
      newRoutineDefinition.Name = displaykey.Web.Rating.RateRoutines.CopyPrefix(this.Name)
    }

    return newRoutineDefinition
  }
  
  /**
   * A virtual property for the Branching fields.  Together with "Code" and "Version", the branching fields uniquely identify a CalcRoutineDefinition
   * @returns An ordered list of Fields.
   */
  static final property get BranchingFields() : List<String> {
    return Plugins.get(IRateRoutinePlugin).BranchingFields.map(\ field -> field.Name).toList()
  }
  
  /**
   * An ordered list of values of the Branching fields for this CalcRoutineDefinition
   */
  property get BranchingFieldValues() : List<Object> {
    return BranchingFields.map(\ s -> this.getFieldValue(s))
  }

  /**
   * The columns in the unique index (not including 'Retired' because the query layer will add 'Retired' to queries automatically).
   * Used in RateRoutineValidation.gs
   */
  static final property get ColumnsInUniqueIndex() : List<String>{
    return {"Code", "Version"}.concat(BranchingFields).toList()
  }
  
  /**
   * The columns in the unique index excluding 'Version' (and not including 'Retired').
   * Used in methods isLatestVersion() and hasOtherVersions() where we want to build queries 
   * which compare on the unique columns other than the 'Version' column. 
   */
  static final property get ColumnsInIndexMinusVersion() : List<String>{
    var columnsMinusVersion = ColumnsInUniqueIndex.copy()
    columnsMinusVersion.remove("Version")
    return columnsMinusVersion
  }

  /**
   * Returns true if this calc routine's version is the highest one in the database.
   */
  function isLatestVersion() : boolean {
    var q = Query.make(CalcRoutineDefinition)
    for (column in ColumnsInIndexMinusVersion) {
      q.compare(column, Equals, this.getFieldValue(column))
    }
    var subselectQuery = Query.make(CalcRoutineDefinition) // using a query joined to itself is the Query Layer's way to do a MAX
    for (column in ColumnsInIndexMinusVersion) {
      subselectQuery.compare(column, Equals, this.getFieldValue(column))
    }
    q.subselect("Version", CompareIn, subselectQuery, DBFunction.Max(subselectQuery.getColumnRef("Version")))
    var maxVersion = q.select().single().Version
    
    return (this.Version == maxVersion)
  }

  /**
   * A rate routine can be edited if it's the first version, there aren't other versions, and it's not yet included in any ratebook.
   */
  function canEditIdentifyingFields() : boolean {
    return isFirstVersion() and not hasOtherVersions() and not isIncludedInAnyRateBook()
  }
  
  function isFirstVersion() : boolean {
    return this.Version == 1
  }
  
  function hasOtherVersions() : boolean {
    var q = Query.make(CalcRoutineDefinition)
    for (column in ColumnsInIndexMinusVersion) {
      q.compare(column, Equals, this.getFieldValue(column))
    }
    var result = q.select()
    
    //When user is copying a Calc Routine, result is still empty,
    //i.e. there are, as yet, no other versions of that routine
    if (result.Empty) {
      return false
    }
    if (result.Count > 1) {
      return true
    } 
    //if we are here, we know that "this.Version == result.single().Version" 
    //i.e. there are no other versions
    return false 
  }

  /**
   * @returns true if any of the associated RateBooks are not in draft state.
   */
  function isIncludedInPromotedRateBook() : boolean {
    return this.RateBooks.hasMatch(\ rateBook -> not rateBook.isDraft())
  }

  /**
   * @returns true if there are no associated RateBooks.
   */
  function isIncludedInAnyRateBook() : boolean {
    return not this.RateBooks.IsEmpty
  }

  // TODO: Is an array really the right thing here?   Don't we actually want a set (no duplicates)?
  property get RateBooks() : RateBook[] {
    return this.RateBookCalcRoutines*.RateBook
  }

  /**
   * Clears unused instructions from each step.
   */
  function clearUnusedInstructions() {
    for (step in this.Steps) {
      step.clearUnusedInstruction()
    }
  }

  /**
   * Before deleting, verify that the Rate Routine is not included in a non-draft Rate Book.
   */
  function canDelete() {
    if (isIncludedInPromotedRateBookDatabaseQuery()) {
      throw new DisplayableException(displaykey.Validation.Rating.RateRoutineDefinition.ReferencedByPromotedRateBook)
    }
  }

  /**
   * @returns true if it's not included in a promoted RateBook, and it can be saved.
   */
  function canUpdate() {
    if (isIncludedInPromotedRateBookDatabaseQuery()) {
      throw new DisplayableException(displaykey.Validation.Rating.RateRoutineDefinition.ReferencedByPromotedRateBook)
    }
    if (not canSave()) {
      throw new DisplayableException(displaykey.Validation.Rating.RateRoutineDefinition.DuplicateRateRoutineCode(CalcRoutineDefinition.ColumnsInUniqueIndex.join(", ")))
    }
  }

  /**
   * @returns true if the Rate Routine's code isn't already in the database.
   */
  function canSave() : boolean {
    var q = Query.make(CalcRoutineDefinition)
    for (column in CalcRoutineDefinition.ColumnsInUniqueIndex) {
      q.compare(column, Equals, this.getFieldValue(column))
    }
    return not q.select().hasMatch(\ calcRoutine -> calcRoutine.ID != this.ID)
  }

  /**
   * Use a Query to make sure we hit the database so that another browser's update will be known.
   */
  private function isIncludedInPromotedRateBookDatabaseQuery() : boolean {
    var rateBookTable = Query.make(RateBook)
    rateBookTable.compare("Status", NotEquals, RateBookStatus.TC_DRAFT)

    var joinTable = Query.make(RateBookCalcRoutine)
    joinTable.compare("CalcRoutineDefinition", Equals, this)
    joinTable.subselect("RateBook", InOperation.CompareIn, rateBookTable, "ID")

    return not joinTable.select().Empty
  }

  /**
   * Performs validation on the Rate Routine, including checking if the table exists and that the column is valid.
   */
  function performPreDisplayValidation() : String[] {
    var context = new PCValidationContext("default")
    var tableSteps = this.Steps.where(\ step -> step.Operands.hasMatch(\ op -> op.OperandType == TC_RATETABLE))
    for (step in tableSteps) {
      ParseUtil.performRateTableExistsValidation(step, context)
      ParseUtil.performRateTableColumnValidation(step, context)
    }
    var result = context.Result
    if (result.Empty) {
      return {}
    } else {
      return result.ErrorMessages
    }
  }
}
