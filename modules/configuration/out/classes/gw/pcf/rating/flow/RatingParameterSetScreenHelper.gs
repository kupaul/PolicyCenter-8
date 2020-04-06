package gw.pcf.rating.flow

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.productmodel.CoveragePattern
uses gw.lang.reflect.TypeSystem
uses java.util.Set
uses gw.util.Pair
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ClausePatternLookup

@Export
class RatingParameterSetScreenHelper {

  /**
   * Verify CoveragePattern contains valid coverage code or nothing
   * @param coveragePatternCode 
   * @return Returns null if coveragePatternCode is null or it's a valid coverage code
   * else returns a invalid coverage pattern code error message
   */ 
  static function verifyCoverageCode(coveragePatternCode : String) : String {
    if (coveragePatternCode != null) {
      var coveragePattern = ClausePatternLookup.getCoveragePatternByCode(coveragePatternCode)
      if (coveragePattern == null) {
        return displaykey.Validation.Rating.InvalidCoveragePatternCode(coveragePatternCode)
      }
    }
    return null
  }

  /**
   * Verify ParamType contains a valid type or nothing
   * @param paramImplClassName fully qualified class name to verify
   * @return Returns null if paramImplClassName is null or contains a valid fully qualified class name
   * else returns an invalid class name error message
   */
  static function verifyParamType(paramImplClassName : String) : String {
    if (paramImplClassName!= null) {
      var classType = TypeSystem.getByFullNameIfValid(paramImplClassName)
      if (classType == null) {
        return displaykey.Java.ValidationError.SystemTables.InvalidClassName(paramImplClassName)
      }
    }
    return null
  }

  /**
   * Return calc routine parameter sets for a line
   * @param selectedLineType Contains the line type to be filtered on when retrieving CalcRoutineParamSets.
   * @return returns the calc routine parameter sets associated with the line specified in selectedLineType
   */
  static function getParameterSets(selectedLineType : String) : IQueryBeanResult<CalcRoutineParameterSet> {
    var query = Query<CalcRoutineParameterSet>.make(CalcRoutineParameterSet)
    if (selectedLineType.NotBlank) {
      query.compare("PolicyLinePatternCode", Equals, selectedLineType)
    }
    return query.select()
  }

  /**
   * Add additional default CalcRoutineParamName->Type default values.  These
   * values are used in the Calc Routine Parameter screens to fill in default
   * values when add parameters to a parameter set.
   */
  static var mapFromCodeToType = {
    CalcRoutineParamName.TC_POLICYLINE           -> "entity.PolicyLine",
    CalcRoutineParamName.TC_RATEDATE             -> "java.util.Date",
    CalcRoutineParamName.TC_COVERAGE             -> "entity.Coverage",
    CalcRoutineParamName.TC_COSTDATA             -> "gw.rating.CostData",
    CalcRoutineParamName.TC_DRIVERASSIGNMENTINFO -> "gw.lob.pa.rating.DriverAssignmentInfo",
    CalcRoutineParamName.TC_TAXABLEBASIS         -> "java.math.BigDecimal",
    CalcRoutineParamName.TC_STATE                -> "typekey.Jurisdiction"
  }

  /**
   * Given a calc routine param name, return the associated type.
   * @param code CalcRoutineParamName code to retrieve default type
   * @return Default type if it exists, else null
   */ 
  static function codeToDefaultType(code : CalcRoutineParamName) : String {
    return mapFromCodeToType[code]
  }

  /**
   * isCoverageEntity
   * @param entityType Entity's type as string
   * @return True if passed in entityType is the Coverage entity
   */    
  static function isCoverageEntity(entityType : String) : boolean {
    return "entity.Coverage".equals(entityType)
  }
  
  /**
   * Returns an error message with any <code>CalcRoutineParameter</code>'s within the given <code>CalcRoutineParameterSet</code> have the same Code,
   * or null if there are no duplicates.
   * This method is used by the validateExpression attribute of CalcRoutineParameterSetsLV, so it's important to return null if there are no duplicates.
   */
  static function duplicateCalcRoutineParameterCodes(parameterSet : CalcRoutineParameterSet) : String {
    var duplicateCodes = parameterSet.Parameters*.Code.partition(\ c -> c.Code).filterByValues(\ l -> l.Count > 1).Keys
    if (duplicateCodes.Empty) {
      return null // Return null instead of Empty so that CalcRoutineParameterSetsLV#validationExpression will behave correctly
    }
    return displaykey.Validation.Rating.ParameterSet.DuplicateParameterCode(duplicateCodes.join(","))
  }

  private static function getParametersReferencedInRateTableDefinitions()
    : Set<Pair<CalcRoutineParameterSet, CalcRoutineParamName>> {
    return Query.make(RateTableArgumentSource)
      .select()
      .map(\ r -> 
        new gw.util.Pair<entity.CalcRoutineParameterSet, typekey.CalcRoutineParamName>
          (r.ArgumentSourceSet.CalcRoutineParameterSet, r.Root))
      .toSet()
  }

  private static function getParametersReferencedInRateRoutines() 
    : Set<Pair<CalcRoutineParameterSet, CalcRoutineParamName>> {
    return Query.make(CalcStepDefinitionOperand).compare("InScopeParam", NotEquals, null)
      .join("CalcStep").join("CalcRoutineDefinition")
      .select()
      .map(\ r -> 
        new gw.util.Pair<entity.CalcRoutineParameterSet, typekey.CalcRoutineParamName> 
        (r.CalcStep.CalcRoutineDefinition.ParameterSet, r.InScopeParam))
      .toSet()
  }

  private static function getParametersReferencedInFunctions()
    : Set<Pair<CalcRoutineParameterSet, CalcRoutineParamName>> {
    return Query.make(CalcStepDefinitionArgument)
      .compare("OperandType", Equals, CalcStepOperandType.TC_INSCOPE)
      .join("Operand").compare("FunctionName", NotEquals, null)
      .join("CalcStep").join("CalcRoutineDefinition")
      .select()
      .map(\ r -> 
        new gw.util.Pair<entity.CalcRoutineParameterSet, typekey.CalcRoutineParamName> 
        (r.Operand.CalcStep.CalcRoutineDefinition.ParameterSet, r.InScopeParam))
      .toSet()
  }
  
  static function getParametersReferencedInRateTableDefinitionsRateRoutinesRateFunctions() : Set<Pair<CalcRoutineParameterSet, CalcRoutineParamName>> {
    return getParametersReferencedInRateTableDefinitions()
      .union(getParametersReferencedInRateRoutines())
      .union(getParametersReferencedInFunctions())
  }
}
