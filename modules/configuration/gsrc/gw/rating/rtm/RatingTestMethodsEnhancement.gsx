package gw.rating.rtm

uses gw.api.builder.OrganizationBuilder
uses gw.api.builder.PCRoleBuilder
uses gw.api.builder.UserBuilder
uses gw.api.database.Query
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.rating.flow.builders.CalcRoutineDefinitionBuilder
uses gw.rating.flow.builders.CalcRoutineParameterSetBuilder
uses gw.rating.flow.builders.CalcStepDefinitionBuilder
uses gw.rating.flow.builders.CalcStepDefinitionOperandBuilder
uses gw.rating.rtm.builders.RateTableArgumentSourceBuilder
uses gw.rating.rtm.builders.RateTableColumnBuilder
uses gw.rating.rtm.builders.RateTableMatchOpBuilder
uses gw.pl.persistence.core.Bundle
uses java.lang.System
uses java.util.Collections
uses gw.api.builder.PCRoleBuilder
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.api.builder.UserBuilder
uses gw.api.builder.OrganizationBuilder
uses java.util.Random
uses java.util.Map
uses java.util.ArrayList
uses java.math.BigDecimal
uses gw.api.database.Query
uses gw.rating.flow.builders.CalcStepDefinitionRateFactorBuilder
uses gw.rating.rtm.builders.RateTableBuilder
uses gw.rating.rtm.builders.scenario.sample.SampleDataTablesBuilder
uses gw.rating.rtm.builders.RateTableArgumentSourceSetBuilder
uses gw.rating.rtm.builders.RateTableDefinitionBuilder
uses gw.rating.rtm.builders.scenario.PARateTablesBuilder
uses gw.rating.rtm.domain.table.RateTableCell
uses gw.rating.rtm.builders.RateBookBuilder
uses gw.rating.rtm.builders.RateFactorRowBuilder
uses gw.rating.flow.scenario.PARateflowScenario
uses gw.rating.rtm.builders.scenario.RatingScenario
uses gw.rating.rtm.builders.RateTableMatchOpDefinitionBuilder

enhancement RatingTestMethodsEnhancement : gw.rating.rtm.RatingTestMethods {

  function rateflowCleanup() {
    this.fullCleanup()
    this.cleanupCalcRoutines()
  }

  /*
   * Removed all rate books, rate table definitions and match operation definitions.
   */
   // USED BY rtm, and also AbstractCalcRoutineSmokeTest
  function fullCleanup() {
    partialCleanup({"RateBook", "RateTableDefinition", "CalcRoutineDefinition"})
  }

  function partialCleanup(entityFilter : String[]) {
    var ratebooks = Collections.emptyList<RateBook>()
    var tables = Collections.emptyList<RateTableDefinition>()
    var matchOpDefs = Collections.emptyList<RateTableMatchOpDefinition>()
    var factors = Collections.emptyList<DefaultRateFactorRow>()
    var covFactors = Collections.emptyList<CoverageRateFactor>()
    var calcRoutines = Collections.emptyList<CalcRoutineDefinition>()

    for (entity in entityFilter) {
      switch (entity) {
        case "RateBook" :
          ratebooks = Query.make(RateBook).startsWith("PublicID", "pc:", false).select().toList()
          break
        case "RateTableDefinition" :
          tables = Query.make(RateTableDefinition).startsWith("PublicID", "pc:", false).select().toList()
          matchOpDefs = Query.make(RateTableMatchOpDefinition).startsWith("PublicID", "pc:", false).select().toList()
          factors = Query.make(DefaultRateFactorRow).startsWith("PublicID", "pc:", false).select().toList()
          covFactors =  Query.make(CoverageRateFactor).startsWith("PublicID", "pc:", false).select().toList()
          break
        case "CalcRoutineDefinition" :
          calcRoutines = Query.make(CalcRoutineDefinition).startsWith("PublicID", "pc:", false).select().toList()
          break
      }
    }
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      ratebooks.each(\ rb -> bundle.add(rb).remove())
      tables.each(\ t -> bundle.add(t).remove())
      matchOpDefs.each(\ t -> bundle.add(t).remove())
      factors.each(\ f -> bundle.add(f).remove())
      covFactors.each(\ f -> bundle.add(f).remove())
      calcRoutines.each(\ f -> bundle.add(f).remove())
    }, "su")

  }

  // Used in rtm.RateTableDefinitionDetailsSmokeTest (b/c we test ArgumentSources there)
  // USED BY AbstractCalcRoutineSmokeTest
  function cleanupCalcRoutines() {
    cleanupByPrefixes("*", CalcRoutineParameterSetBuilder.PUBLICID_BUILDER_TAG)
  }

  function cleanupOnlyNewCalcRoutines() {
    cleanupByPrefixes(CalcRoutineDefinitionBuilder.PUBLICID_BUILDER_TAG, CalcRoutineParameterSetBuilder.PUBLICID_BUILDER_TAG)
  }

      /**
   * Removes the <code>CalcRoutineDefinition</code>'s and <code>CalcRoutineParameterSet</code>'s
   * whose PublicID starts with the corresponding passed prefix.
   * If a prefix is null, the cleanup will be skipped for the corresponding entity.
   * If a prefix is "*", all corresponding entities will be cleaned up.
   * 
   * Note:  if you clean up the ParameterSet's without also cleaning up the CalcRoutines you will risk
   * leaving orphaned foreign keys.
       */
  function cleanupByPrefixes(calcRoutinePrefix : String, parameterSetPrefix : String) {
    var entitiesToRemove = new ArrayList<KeyableBean>()

    entitiesToRemove.addAll(findTaggedEntity<CalcRoutineDefinition>(calcRoutinePrefix))
    entitiesToRemove.addAll(findTaggedEntity<CalcRoutineParameterSet>(parameterSetPrefix))

    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      entitiesToRemove.each(\ e -> bundle.add(e).remove())
      })
  }

  private function findTaggedEntity<T extends KeyableBean>(tag : String) : List<T>{
    if (tag == null) {
      return {}
    }
    var q = Query.make(T)
    if (tag != "*") {
      q.startsWith("PublicID", tag, false /*ignoreCase*/)
      }
    return q.select().toList()
  }

  // no usages in flow
  static function makeParam() : RateTableColumnBuilder {
     return getParam("Param".concat(new Random(System.currentTimeMillis()).nextInt() as String))
  }

  // no usages in flow
  static function getParam(columnName : String) : RateTableColumnBuilder {
    return getParam(columnName, columnName)
  }

  static function getParam(sortOrder : int, columnName : String) : RateTableColumnBuilder {
    return getParam(sortOrder, columnName, columnName)
  }

  // USED in rtm, especially PARateTablesBuilder -- do we depend on that?
  static final function getParam(columnName : String, physicalColumnName : String) : RateTableColumnBuilder {
     return getParam(columnName, physicalColumnName, RateTableDataType.TC_STRING)
  }

  // USED EXTENSIVELY in CalcRoutineDefinitionEnhancementTest, CalcStepDefinitionArgumentEnhancementTest,
  // CalcStepDefinitionEnhancementTest, CalcStepDefinitionOperandEnhancementTest, PARateflowScenario,
  // IN RTM, used in PARateTablesBuilder, SampleDataTablesBuilder, RangeMatchOpTest, RateTableMatchOpTest
  static function getParam(sortOrder : int, columnName : String, physicalColumnName : String) : RateTableColumnBuilder {
     return getParam(sortOrder, columnName, physicalColumnName, RateTableDataType.TC_STRING)
  }

  static function getParam(columnName : String, physicalColumnName : String, paramType : RateTableDataType) : RateTableColumnBuilder {
     return getParam(0, columnName, physicalColumnName, paramType)
  }

  // USED in rtm tests AND BY PARateTablesBuilder, SampleDataTablesBuilder,
  static function getParam(sortOrder : int, columnName : String, physicalColumnName : String, paramType : RateTableDataType) : RateTableColumnBuilder {
     return new RateTableColumnBuilder()
            .withColumnName(columnName)
            .withColumnLabel(columnName)
            .withType(paramType)
            .withSortOrder(sortOrder)
            .mappedTo(physicalColumnName)
  }

  // USED in rtm tests AND BY PARateflowScenario, PARateTablesBuilder, SampleDataTablesBuilder,
  static function getFactor(factorName : String) : RateTableColumnBuilder {
    return getFactor(factorName, "dec5", RateTableDataType.TC_DECIMAL)
  }

  // USED BY CalcRoutineDefinitionEnhancementTest, CalcStepDefinitionArgumentEnhancementTest, CalcStepDefinitionEnhancementTest,
  // CalcStepDefinitionOperandEnhancementTest
  // ALSO BY rtm tests, PARateTablesBuilder, SampleDataTablesBuilder
  static function getFactor(factorName : String, physicalColumn : String, type : RateTableDataType) : RateTableColumnBuilder {
    return getFactor(0, factorName, physicalColumn, type)
  }
  // USED in rtm tests AND BY PARateTablesBuilder
  static function getFactor(factorName : String, physicalColumn : String, sortOrder : int, type : RateTableDataType) : RateTableColumnBuilder {
    return getFactor(sortOrder, factorName, physicalColumn, type)
  }

  static function getFactor(sortOrder : int, factorName : String, physicalColumn : String, type : RateTableDataType) : RateTableColumnBuilder {
    return getFactor(sortOrder, factorName, physicalColumn, type, factorName)
  }

  static function getFactor(sortOrder : int, factorName : String, physicalColumn : String, type : RateTableDataType, label: String) : RateTableColumnBuilder {
    return new RateTableColumnBuilder()
            .withSortOrder(sortOrder)
            .withColumnName(factorName)
            .withColumnLabel(label)
            .withType(type)
            .withDisplayType(RateTableColumnDisplay.TC_SMALL)
            .mappedTo(physicalColumn)
  }

  // USED EXCLUSIVELY BY PARateTablesBuilder, SampleDataTablesBuilder
  static function getFactor(factorName : String, physicalColumnName : String) : RateTableColumnBuilder {
    return getFactor(factorName, physicalColumnName, RateTableDataType.TC_DECIMAL)
  }

  // USED BY CalcRoutineDefinitionEnhancementTest, CalcStepDefinitionArgumentEnhancementTest, CalcStepDefinitionEnhancementTest,
  // CalcStepDefinitionOperandEnhancementTest
  // ALSO BY rtm tests, PARateTablesBuilder, SampleDataTablesBuilder
  static final function getMatchOp(column : RateTableColumnBuilder) : RateTableMatchOpBuilder {
    return getMatchOp({column}).withOpName(column.ColumnName.toUpperCase())
  }

  // USED EXCLUSIVELY BY PARateflowScenario, PARateTablesBuilder, SampleDataTablesBuilder
  static final function getMatchOp(column : RateTableColumnBuilder, argumentSource : String, argSrcBldr : RateTableArgumentSourceBuilder) : RateTableMatchOpBuilder {
    // For a 1-column match, the param name is usually the same as the column name.
    var paramName = column.ColumnName.toUpperCase()
    return getMatchOp({column}, paramName, argumentSource, argSrcBldr)
  }

  static final function getMatchOp(column : RateTableColumnBuilder, argSrcBldrs : List<RateTableArgumentSourceBuilder>) : RateTableMatchOpBuilder {
    // For a 1-column match, the param name is usually the same as the column name.
    var paramName = column.ColumnName.toUpperCase()
    return getMatchOp({column}, paramName, argSrcBldrs)
  }

  /**
   * withOpName is not called here
   */
  // USED BY rtm, including PARateTablesBuilder, SampleDataTablesBuilder
  static final function getMatchOp(columns : RateTableColumnBuilder[]) : RateTableMatchOpBuilder {
    var matchOpBuilder = new RateTableMatchOpBuilder()
    columns.each(\ c -> matchOpBuilder.addParam(c))

    return matchOpBuilder
  }

  // USED EXCLUSIVELY BY PARateTablesBuilder, SampleDataTablesBuilder and internally
  static final function getMatchOp(columns : RateTableColumnBuilder[], paramName : String, argumentSource : String, argSrcBldr : RateTableArgumentSourceBuilder) : RateTableMatchOpBuilder {
    var matchOpBuilder = new RateTableMatchOpBuilder()
    columns.each(\ c -> matchOpBuilder.addParam(c))
    matchOpBuilder.withRateTableArgumentSource(argSrcBldr.withArgumentSource(argumentSource))
        .withOpName(paramName)
    return matchOpBuilder
  }
  
  // USED EXCLUSIVELY BY PARateTablesBuilder, SampleDataTablesBuilder and internally
  static final function getMatchOp(columns : RateTableColumnBuilder[], paramName : String, argSrcBldrs : List<RateTableArgumentSourceBuilder>) : RateTableMatchOpBuilder {
    var matchOpBuilder = new RateTableMatchOpBuilder()
    columns.each(\ c -> matchOpBuilder.addParam(c))
    matchOpBuilder.withOpName(paramName)
    argSrcBldrs.each(\asb ->{
      matchOpBuilder.withRateTableArgumentSource(asb)
    })
    return matchOpBuilder
  }

  // USED BY CalcRoutineDefinitionEnhancementTest, CalcStepDefinitionARgumentEnhancementTest,
  // CalcStepDefinitionEnhancementTest, PARateflowScenario, AbstractEverythingRatingSmokeTest,
  // CalculationRoutineEditSmokeTest
  static final function makeStoreRateTableLookupStep (bundle : Bundle, order : int, variableName : String,
                                            tableCode : String,
                                            factorName : String,
                                            paramConstantMap : Map<String,String>,
                                            argSources : List<CalcStepDefinitionArgument>) : CalcStepDefinition {
    return makeStoreRateTableLookupStepBuilder(
      order, variableName, tableCode, factorName, paramConstantMap, argSources, "DEFAULT").create(bundle)
  }

  static final function makeStoreRateTableLookupStep (bundle : Bundle, order : int, variableName : String,
                                            tableCode : String,
                                            factorName : String,
                                            paramConstantMap : Map<String,String>,
                                            argSources : List<CalcStepDefinitionArgument>,
                                            argumentSourceSetCode: String) : CalcStepDefinition {
    return makeStoreRateTableLookupStepBuilder(
      order, variableName, tableCode, factorName, paramConstantMap, argSources, argumentSourceSetCode).create(bundle)
  }

  static final function makeStoreRateTableLookupStepBuilder (order : int, variableName : String,
                                            tableCode : String,
                                            factorName : String, 
                                            paramConstantMap : Map<String,String>,
                                            argSources : List<CalcStepDefinitionArgument>
                                            ) : CalcStepDefinitionBuilder {
    return makeStoreRateTableLookupStepBuilder(
      order, variableName, tableCode, factorName, paramConstantMap, argSources, "DEFAULT")                                              
  }
  
  static final function makeStoreRateTableLookupStepBuilder (order : int, variableName : String,
                                            tableCode : String,
                                            factorName : String, 
                                            paramConstantMap : Map<String,String>,
                                            argSources : List<CalcStepDefinitionArgument>,
                                            argumentSourceSetCode: String) : CalcStepDefinitionBuilder {
    return makeStoreRateTableLookupStepBuilder(order, variableName, tableCode, factorName, paramConstantMap, argSources, argumentSourceSetCode, false)
  }
  
  static final function makeStoreRateTableLookupStepBuilder (order : int, variableName : String,
                                            tableCode : String,
                                            factorName : String, 
                                            paramConstantMap : Map<String,String>,
                                            argSources : List<CalcStepDefinitionArgument>,
                                            argumentSourceSetCode: String, 
                                            overrideArgSources : boolean ) : CalcStepDefinitionBuilder {
   var operandBuilder = new CalcStepDefinitionOperandBuilder()
    argSources.each(\ argSource -> {
      var constantValue = paramConstantMap!=null ? paramConstantMap.get(argSource.Parameter) : null
      if (constantValue != null) {
        argSource.ConstantValue = constantValue
        argSource.OperandType = CalcStepOperandType.TC_CONSTANT
      }
      argSource.OverrideSource = overrideArgSources
      operandBuilder.withArgumentSource(argSource)
    })
    var operand = operandBuilder
       .withTableCode(tableCode)
       .withArgumentSourceSetCode(argumentSourceSetCode)
       .withOperatorType(CalcStepOperatorType.TC_STORE)
       .withOperandType(CalcStepOperandType.TC_RATETABLE)
       .withReturnFactor(new CalcStepDefinitionRateFactorBuilder()
          .withColumnName(factorName))
    return new CalcStepDefinitionBuilder()
      .withStepType(CalcStepType.TC_ASSIGNMENT)
      .withStoreLocation(variableName)
      .withSortOrder(order)
      .withOperand(operand)
  }

  // USED BY CalcRoutineDefinitionEnhancementTest, AbstractEverythingRatingSmokeTest, CalculationRoutineEditSmokeTest
  static final function makeTableLookupStep(bundle : Bundle, order : int, opType : CalcStepOperatorType,
                                           tableCode : String,
                                           targetFactor : String,
                                           paramConstantMap : Map<String,String>,
                                           argSources : List<CalcStepDefinitionArgument>) : CalcStepDefinition {
    return makeTableLookupStepBuilder(order, opType, tableCode, targetFactor, paramConstantMap, argSources).create(bundle)
  }

  static final function makeTableLookupStepBuilder(order : int, opType : CalcStepOperatorType,
                                           tableCode : String,
                                           targetFactor : String,
                                           paramConstantMap : Map<String,String>,
                                           argSources : List<CalcStepDefinitionArgument>) : CalcStepDefinitionBuilder {
    var operandBuilder = new CalcStepDefinitionOperandBuilder()
    argSources.each(\ argSource -> {
      var constantValue = paramConstantMap!=null ? paramConstantMap.get(argSource.Parameter) : null
      if (constantValue != null) {
        argSource.ConstantValue = constantValue
        argSource.OperandType = CalcStepOperandType.TC_CONSTANT
      }
      operandBuilder.withArgumentSource(argSource)
    })
    var operand = operandBuilder
       .withTableCode(tableCode)
       .withArgumentSourceSetCode("DEFAULT")
       .withOperatorType(opType)
       .withOperandType(CalcStepOperandType.TC_RATETABLE)
       .withReturnFactor(new CalcStepDefinitionRateFactorBuilder()
          .withColumnName(targetFactor))
    return new CalcStepDefinitionBuilder()
      .withStepType(CalcStepDefinition.getStepTypeFromOperatorType(opType))
      .withSortOrder(order)
      .withOperand(operand)
  }

  static function createUser(ratingUserRole : String) : User {
    var user : User
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      // Start off with producer role
       var producerRoleBuilder = new PCRoleBuilder()
             .cloneRole("Producer", UniqueKeyGenerator.get().nextID(), bundle)

       var userBuilder = new UserBuilder()
       userBuilder.withRole(producerRoleBuilder)
       // If role specified, add it as well
       if(ratingUserRole != null and ratingUserRole != "Producer"){
         var role2 = new PCRoleBuilder().cloneRole(ratingUserRole, UniqueKeyGenerator.get().nextID(), bundle)
        userBuilder = userBuilder.withRole(role2)
      }
      user = userBuilder.withOrganization(new OrganizationBuilder().create(bundle)).create(bundle)
     })
     return user
  }
  
  static function defaultScaledBDStr(strValue : String) : String {
    return new BigDecimal(strValue).setScale(RateTableCell.FACTOR_SCALE).toString()
  }
  
  // USED BY: CalcRoutineRateTablelookupTest and CalcRoutineRateTableLookupSmokeTest
  static public function createPAMultiSetTable(tableCode : String, multiSetParamSet : CalcRoutineParameterSet) : RateTableBuilder {
    var multiSetTableDefBldr = createPAMultiSetTableDef(tableCode, multiSetParamSet)
    return new RateTableBuilder().withRateTableDefinition(multiSetTableDefBldr)
  }

  // USED BY: CalcRoutineRateTablelookupTest and CalcRoutineRateTableLookupSmokeTest
  static public function createPAMultiSetTableDef(tableCode : String, multiSetParamSet : CalcRoutineParameterSet) : RateTableDefinitionBuilder {
    // Rate Table Definition
    var multiSetArgSrcBuilderA = new RateTableArgumentSourceBuilder()
                                         .withRoot(TC_DRIVERASSIGNMENTINFO)
                                         .withArgumentSource("YoungestDriverAge")
                                         
    var multiSetArgSrcBuilderB = new RateTableArgumentSourceBuilder()
                                         .withRoot(TC_DRIVERASSIGNMENTINFO)
                                         .withArgumentSource("LastDriverPercentUse")
                                             
    var ageParamBldr = getParam(1, "AGE", "int1", RateTableDataType.TC_INTEGER).withColumnLabel("AGE")
    
    var multiSetMatchOpBldr = getMatchOp(ageParamBldr,{multiSetArgSrcBuilderA, multiSetArgSrcBuilderB})
            .withDefinition(SampleDataTablesBuilder.EXACT_MATCH_OP_DEF)

    var argSrcSetA = new RateTableArgumentSourceSetBuilder()
                                      .withCode("ArgSrcSetA")
                                      .withName("ArgSrcSetA")
                                      .withCalcRoutineParamSet(multiSetParamSet)
                                      .addArgumentSource(multiSetArgSrcBuilderA)

    var argSrcSetB = new RateTableArgumentSourceSetBuilder()
                                      .withCode("ArgSrcSetB")
                                      .withName("ArgSrcSetB")
                                      .withCalcRoutineParamSet(multiSetParamSet)
                                      .addArgumentSource(multiSetArgSrcBuilderB)

    return new RateTableDefinitionBuilder()
      .withCode(tableCode)
      .named(tableCode)
      .withPolicyLine("PersonalAutoLine")
      .addFactor(PARateTablesBuilder.getFactor("Factor"))
      .addArgumentSourceSet(argSrcSetA)
      .addArgumentSourceSet(argSrcSetB)
      .addMatchOperation(multiSetMatchOpBldr)
  }

  static function rateflowScenario() : List<RateBook> {
    var rateflowScenario = basicRateflowScenario()
    var justAddedBookBuilder = rateflowScenario.BookBuilders.last()
    buildPADiscount(justAddedBookBuilder)
    buildPACoverages(justAddedBookBuilder)
    buildPAPIPNJ(justAddedBookBuilder)
    buildVehicleType(justAddedBookBuilder)
    buildDecimalParameter(justAddedBookBuilder)
    return rateflowScenario.createAndCommitBooks()
  }

  static function basicRateflowScenario() : RatingScenario {
    // Base Rate Table
    var baseTable = SampleDataTablesBuilder.aBaseRateTable()
    var ratingScenario = new RatingScenario()
    var rateBookBuilder = ratingScenario.addActiveBook("Rateflow")

    var data1 = new RateFactorRowBuilder()
    data1.withStr(1,"PACollisionCov").withStr(2,"CA").withDecFactor(1, 2.0)
    var data2 = new RateFactorRowBuilder()
    data2.withStr(1,"PAComprehensiveCov").withStr(2,"CA").withDecFactor(1, 4.0)
    var data3 = new RateFactorRowBuilder()
    data3.withStr(1,"PALiabilityCov").withStr(2,"CA").withDecFactor(1, 6.0)
    var data4 = new RateFactorRowBuilder()
    data4.withStr(1,"PAMedPayCov").withStr(2,"CA").withDecFactor(1, 8.0)
    var data5 = new RateFactorRowBuilder()
    data5.withStr(1,"PAUMPDCov").withStr(2,"CA").withDecFactor(1, 10.0)
    var data6 = new RateFactorRowBuilder()
    data6.withStr(1,"PAUMBI").withStr(2,"CA").withDecFactor(1, 12.0)
    var data7 = new RateFactorRowBuilder()
    data7.withStr(1,"PAUMBICov").withStr(2,"CA").withDecFactor(1, 14.0)
    var data8 = new RateFactorRowBuilder()
    data8.withStr(1,"PALimitedMexicoCov").withStr(2,"CA").withDecFactor(1, 15.0)

    rateBookBuilder.includeTableWithData(baseTable, {data1,data2,data3,data4,data5,data6,data7,data8})


    // Boolean Param Table
    var boolParamTable = SampleDataTablesBuilder.aBooleanParameterTable()
    var boolData1 = new RateFactorRowBuilder()
    boolData1.withBit(1, true).withDecFactor(1, 100.00)
    var boolData2 = new RateFactorRowBuilder()
    boolData2.withBit(2, false).withDecFactor(1, 200.00)
    rateBookBuilder.includeTableWithData(boolParamTable, {boolData1, boolData2})
    return ratingScenario
  }

  static function buildPACoverages(builder: RateBookBuilder){
    // PA Coverages Table
    var coveragesTable = SampleDataTablesBuilder.aCoveragesTable()
    var data = new RateFactorRowBuilder()
    data.withStr(1,"PAPIP_NJ").withStr(2,"").withStr(3,"").withStr(4,"").withDecFactor(1, 10.0)
    builder.includeTableWithData(coveragesTable, {data})
  }

  static function buildPABaseCoverages(builder: RateBookBuilder) : String {
    var baseTable = SampleDataTablesBuilder.aBaseRateTable()
    var data1 = new RateFactorRowBuilder()
    data1.withStr(1,"PACollisionCov").withStr(2,"CA").withDecFactor(1, 2.0)
    builder.includeTableWithData(baseTable, {data1})

    return baseTable.TableCode
  }

  static function buildUniquePABaseCoverages(builder: RateBookBuilder) : String {
    var baseTable = SampleDataTablesBuilder.uniqueBaseRateTable()
    var data1 = new RateFactorRowBuilder()
    data1.withStr(1,"PACollisionCov").withStr(2,"CA").withDecFactor(1, 2.0)
    builder.includeTableWithData(baseTable, {data1})

    return baseTable.TableCode
  }

  static function buildPACovDiscount(bookBuilder: RateBookBuilder){
    var covDiscountTable = SampleDataTablesBuilder.aCovDiscountTable()
    var data1 = new RateFactorRowBuilder()
        .withStr(1, "PACollisionCov").withStrFactor(1, "AntiLockBrakes")
    var data2 = new RateFactorRowBuilder()
        .withStr(1, "PALiabilityCov").withStrFactor(1, "GoodDriver")
    bookBuilder.includeTableWithData(covDiscountTable, {data1, data2})
  }

  static function buildPADiscount(builder: RateBookBuilder){
    // PA Discount Table
    var discountTable = SampleDataTablesBuilder.aDiscountTable()
    var data8 = new RateFactorRowBuilder()
    data8.withStr(1, "AntiLockBrakes").withStr(2, null).withDecFactor(1, 100.0)
    var data9 = new RateFactorRowBuilder()
    data9.withStr(1, "GoodDriver").withStr(2, null).withDecFactor(1, 200.0)
    builder.includeTableWithData(discountTable, {data8, data9})
  }

  static function buildDecimalParameter(builder: RateBookBuilder) {
    var decimalParamTable = SampleDataTablesBuilder.aDecimalParameterTable()
    var decimalData1 = new RateFactorRowBuilder()
    decimalData1.withDec(1, 1.0).withDecFactor(1, 100.00)
    var decimalData2 = new RateFactorRowBuilder()
    decimalData2.withDec(1, 2.0).withDecFactor(1, 200.00)
    builder.includeTableWithData(decimalParamTable, {decimalData1, decimalData2})

  }

  static function buildPAPIPNJ(builder: RateBookBuilder){
    // PA PIP New Jersey Table
    var pipnjTable = SampleDataTablesBuilder.aPIPNJTable()
    var data1 = new RateFactorRowBuilder()
    var data2 = new RateFactorRowBuilder()
    data1.withStr(1,"10").withStr(2,"250").withBit(1,null).withDecFactor(1, 300.0)
    data2.withStr(1,"25").withStr(2,"500").withBit(1,null).withDecFactor(1, 600.0)
    builder.includeTableWithData(pipnjTable, {data1, data2})
  }

  static function buildVehicleType(builder: RateBookBuilder){
    var table = PARateflowScenario.aVehicleTypeTable()
    var data1 = new RateFactorRowBuilder()
    var data2 = new RateFactorRowBuilder()
    data1.withStr(1,"CA").withStr(2, null).withDecFactor(1, 20)
    data2.withStr(1,"CA").withStr(2, "auto").withDecFactor(1, 10)
    builder.includeTableWithData(table, {data1, data2})
  }

  static function buildUniqueMultiFactor(builder: RateBookBuilder) : String {
    var table = PARateTablesBuilder.uniqueMultiFactorTable()
    var data1 = new RateFactorRowBuilder()
    data1.withStr(1, "paramValue1").withDecFactor(1, 10.0).withDecFactor(2, 20.0).withBit(1, true)
    var data2 = new RateFactorRowBuilder()
    data2.withStr(1, "paramValue2").withDecFactor(1, 15.0).withDecFactor(2, 25.0).withBit(1, true)
    builder.includeTableWithData(table, {data1, data2})
    return table.TableCode
  }

  static function testRangeTableBuilder(testRangeTableName : String): RateTableDefinitionBuilder {
    return
        new RateTableDefinitionBuilder()
            .addArgumentSourceSet(new RateTableArgumentSourceSetBuilder()
            .withCode("DEFAULT")
            .withName("Default")
            .withCalcRoutineParamSet(SampleDataTablesBuilder.PACoverageParamSet))
            .withCode(testRangeTableName)
            .named(testRangeTableName)
            .withPolicyLine(PARateTablesBuilder.PA_LINE)
            .addMatchOperation(getMatchOp({
            getParam(0, "Low", "int1", RateTableDataType.TC_INTEGER),
            getParam(1, "High", "int2", RateTableDataType.TC_INTEGER)
        }).withOpName("RangeOp").withDefinition(RateTableMatchOpDefinitionBuilder.RangeMatchMaxExclOp))
            .addMatchOperation(getMatchOp({
            getParam(2, "ExactMatchOp", "str1", RateTableDataType.TC_STRING)
        }).withOpName("ExactMatchOp").withDefinition(RateTableMatchOpDefinitionBuilder.ExactMatchOp))
            .addFactor(getFactor("Factor"))
  }

  static function baseTestRangeTableNormalizedRowsBuilder(numRows : int): RateFactorRowBuilder[] {
    // A bit hokey here:  we could probably find something that will explode when normalizing
    // in a predictable fashion.
    var rowBuilders : List<RateFactorRowBuilder> = {}
    for (i in 1..numRows) {
      rowBuilders.add(new RateFactorRowBuilder().withInt(1, i).withInt(2, (i+1)).withStr(3, "").withDecFactor(1,i))
    }
    return rowBuilders.toTypedArray()
  }

  static function createTestTableWithSingleParamMatchOp(matchOpName: String, colName: String, physColName: String,
                                                        rateTableDataType: RateTableDataType,
                                                        rateTableMatchOpDefBuilder: RateTableMatchOpDefinitionBuilder) : RateTableDefinition {

    var matchOpBuilder = getMatchOp(getParam(0, colName, physColName, rateTableDataType))
        .withMatchOpName(matchOpName)
        .withDefinition(rateTableMatchOpDefBuilder)

    var uniqueKey = UniqueKeyGenerator.get().nextInteger()
    var tableCode = "TestTableCode_" + uniqueKey
    return new RateTableDefinitionBuilder()
        .withCode(tableCode)
        .named(tableCode)
        .addFactor(getFactor("Factor", "int7", RateTableDataType.TC_INTEGER))
        .addMatchOperation(matchOpBuilder)
        .create()
  }

  static function createTestTableWithDoubleParamMatchOp(matchOpName: String,
                                                        colName1: String, physColName1: String,
                                                        colName2: String, physColName2: String,
                                                        rateTableDataType: RateTableDataType,
                                                        rateTableMatchOpDefBuilder: RateTableMatchOpDefinitionBuilder) : RateTableDefinition {

    var matchOpBuilder =
        getMatchOp({
            getParam(0, colName1, physColName1, rateTableDataType),
            getParam(1, colName2, physColName2, rateTableDataType)
          })
          .withMatchOpName(matchOpName)
          .withDefinition(rateTableMatchOpDefBuilder)

    var uniqueKey = UniqueKeyGenerator.get().nextInteger()
    var tableCode = "TestTableCode_" + uniqueKey
    return new RateTableDefinitionBuilder()
        .withCode(tableCode)
        .named(tableCode)
        .addFactor(getFactor("Factor", "int7", RateTableDataType.TC_INTEGER))
        .addMatchOperation(matchOpBuilder)
        .create()
  }


}
