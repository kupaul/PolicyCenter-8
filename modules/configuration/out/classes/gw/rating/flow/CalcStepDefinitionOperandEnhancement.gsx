package gw.rating.flow

uses gw.entity.TypeKey
uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses gw.pcf.rating.flow.RateRoutineRateTablePopupHelper
uses gw.rating.flow.domain.RateFunctionOperand
uses gw.rating.flow.util.QueryUtils
uses gw.rating.flow.util.RateFlowReflection
uses gw.rating.flow.util.TypeMaps
uses gw.util.Pair
uses java.lang.IllegalStateException
uses java.lang.RuntimeException
uses java.lang.StringBuilder
uses java.util.ArrayList
uses java.util.Date
uses java.util.List
uses java.util.Set

enhancement CalcStepDefinitionOperandEnhancement : entity.CalcStepDefinitionOperand {

  /**
   * Clears the operand and sets the operand type a untyped constant (versus a typed constant
   * e.g. typekey or date constant)
   */
  function clearOperandValues() {
    this.OperandType = TC_CONSTANT
    this.TableCode = null
    this.FunctionName = null
    this.clearValueDelegateValues()
  }

  function resetParameterNameAndTypeForRateFunction(){
    var args = this.ArgumentSources
    args.each(\argSrc-> this.removeFromArgumentSources(argSrc))
    var functionName = this.FunctionName
    if (functionName != null) {
      var matchingMethod = RateFlowReflection.getMethodInfoForMethod(this.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode, functionName)
      this.ConstantValue = null
      this.TypeDeclaration = matchingMethod.ReturnType.Name
      matchingMethod.Parameters.each(\ param -> {
        this.addToArgumentSources(new CalcStepDefinitionArgument() {
          // One would think function arguments don't need to bother about OverrideSource, but this flag is
          // currently overloaded to determine whether a given argument has been set during the rate function popup
          :OverrideSource = false,
          :Parameter = param.Name,
          :ParameterType = param.FeatureType.Name
        })
      })
    }
  }

  property get ConditionalSubOperands() : List<Pair<CalcStepDefinitionOperand, CalcStepDefinitionOperand>> {
    return this.CalcStep.Operands.where(\ c -> c.OperandOrder.Odd).orderBy(\ c -> c.OperandOrder)
          .map(\ c -> new Pair<CalcStepDefinitionOperand, CalcStepDefinitionOperand>
        (c, this.CalcStep.Operands.singleWhere(\ d -> d.OperandOrder == c.OperandOrder + 1)))
  }

  function addNewSubOperand() : Pair<entity.CalcStepDefinitionOperand, entity.CalcStepDefinitionOperand> {
    var leftOperand = new CalcStepDefinitionOperand(this.Bundle)
    leftOperand.OperandOrder = this.CalcStep.Operands.Count
    // set a untyped constant as default
    leftOperand.OperandType = TC_CONSTANT
    leftOperand.OperatorType = (leftOperand.OperandOrder == 1) ? null : TC_AND
    this.CalcStep.addToOperands(leftOperand)

    var rightOperand = new CalcStepDefinitionOperand(this.Bundle)
    rightOperand.OperandOrder = leftOperand.OperandOrder + 1
    // set a reasonable default
    rightOperand.OperatorType = null
    this.CalcStep.addToOperands(rightOperand)

    return new Pair<CalcStepDefinitionOperand, CalcStepDefinitionOperand>(leftOperand, rightOperand)
  }

  function removeSubOperand(subOperandPair: Pair<CalcStepDefinitionOperand, CalcStepDefinitionOperand>) {
    this.CalcStep.removeFromOperands(subOperandPair.First)
    this.CalcStep.removeFromOperands(subOperandPair.Second)
    //Have to re-number the operands as may have removed a pair from the middle
    this.CalcStep.OrderedOperands.eachWithIndex(\ c, i -> {c.OperandOrder = i})
  }

  property get RateTableDefinition() : RateTableDefinition {
    var cachedResult = QueryUtils.getRateTableDefinitionForCodeAndLine(this.TableCode, this.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode)
    if (cachedResult == null) {
      // one way this can happen is on initial import; try to handle that case
      cachedResult = this.Bundle.InsertedBeans.whereTypeIs(entity.RateTableDefinition)
        .firstWhere(\ t -> t.TableCode == this.TableCode and t.PolicyLine == this.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode)
    }

    return cachedResult
  }

  property get ArgumentSourceSets() : RateTableArgumentSourceSet[] {
    return RateTableDefinition.ArgumentSourceSets
  }

  function resetArgumentSources() {
    var args = this.ArgumentSources
    args.each(\argSrc-> this.removeFromArgumentSources(argSrc))
    this.RateTableDefinition.SortedMatchOps.each(\ matchOp -> {
      this.addToArgumentSources(new CalcStepDefinitionArgument() {
                                  :Parameter = matchOp.Name
                                })
    })
  }

  function resetFactors() {
    var factors = this.ReturnFactorColumns
    factors.each(\ fac ->{
      this.removeFromReturnFactorColumns(fac)
    })
  }


  property get ConditionalExpression() : String {
    var str = new StringBuilder()
    this.ConditionalSubOperands.each(\ so -> {
      var left = so.First
      var right = so.Second
      if (left.OperatorType != null) {
        str.append("\n")
        str.append(left.OperatorType.LabelForDisplay)
        str.append(" ")
      }
      str.append(left.LeftParenthesisGroup ?: "")
      if (left.LogicalNot) {
        str.append("not ")
      }
      str.append(left.OperandName)
      str.append(left.RightParenthesisGroup ?: "")
      if (right.OperatorType != null) {
        str.append(" ")
        str.append(right.OperatorType.LabelForDisplay)
        str.append(" ")
        str.append(right.LeftParenthesisGroup ?: "")
        if (right.LogicalNot) {
          str.append("not ")
        }
        str.append(right.OperandName)
        str.append(right.RightParenthesisGroup ?: "")
      }
    })
    return str.toString()
  }

  // Property for CalcStepDefinitionOperand used for display purposes.  Based on operand type, formats
  // a UI friendly string backed by a displaykey
  property get OperandName() : String {
    if (this.CalcStep.IsBlankStep) {
      return ""
    }
    if (this.CalcStep.StepType == TC_ELSE or this.CalcStep.StepType == TC_ENDIF) {
      return null
    }

    switch (this.OperandType) {
      case TC_CONSTANT:
      case TC_INSCOPE:
      case TC_LOCALVAR:
        return this.StepValueDisplayName

      case TC_RATEFUNC:
        var methodInfo = RateFlowReflection.getMethodInfoForMethod(this.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode, this.FunctionName)
        if (methodInfo == null) {
          return displaykey.Web.Rating.Flow.CalcRoutine.MissingRateFunctionLabel(this.FunctionName.split("\\(").first())
        }
        var args = RateFunctionOperand.orderArguments(this.ArgumentSources, methodInfo)
        return displaykey.Web.Rating.Flow.CalcRoutine.RateFunctionLabel(this.FunctionName.split("\\(").first(),                // function name
                                                                        args.map(\arg -> arg.StepValueDisplayName).join(", ")) // comma separated argument names
      case TC_CONDITIONAL:
        return displaykey.Web.Rating.Flow.CalcRoutine.ConditionalExpressionLabel(this.ConditionalExpression)

      case TC_RATETABLE:
        if (this.TableCode == null) {
          return displaykey.Web.Rating.Flow.UnspecifiedTable
        }

        if (this.RateTableDefinition == null) {
          return displaykey.Validation.Rating.RateRoutineDefinition.MissingTable(this.TableCode)
        }

        var factorNameLabel = new StringBuilder()
        if (this.RateTableDefinition.Factors.Count > 1) {
          if (this.RateFactorColName != null) {
            if (this.RateFactorColName == RateRoutineRateTablePopupHelper.AllFactorsCode) {
              factorNameLabel.append(displaykey.Web.Rating.Flow.RateTableFactorLabel(
                    displaykey.Web.Rating.Flow.CalcRoutine.RateTableReturnAllFactorsLabel))
            } else {
              var factorLabel =
                this.RateTableDefinition.Factors.singleWhere(\f -> f.ColumnName == RateFactorColName).ColumnLabel
              factorNameLabel.append(displaykey.Web.Rating.Flow.RateTableFactorLabel(factorLabel))
            }
          }
        }

        var argSrcSetLabel = new StringBuilder()
        if (this.RateTableDefinition.ArgumentSourceSets.Count > 1) {
          argSrcSetLabel.append(displaykey.Web.Rating.Flow.RateTableArgSrcSetLabel(
                                this.RateTableDefinition.getArgumentSourceSet(this.ArgumentSourceSetCode).Name))
        }

        var tableArgsLabel = ""
        var argsLabel = OverriddenTableArgsLabel

        // If you have both an arg set and overridden arguments, add
        // a space between the two
        if (argSrcSetLabel.length() > 0 and argsLabel.length > 0) {
          argSrcSetLabel.append(" ")
        }

        // If either part exists, add the table args which includes the parenthesis
        if (argSrcSetLabel.length() > 0 or argsLabel.length > 0) {
          tableArgsLabel = displaykey.Web.Rating.Flow.RateTableArgumentsLabel(argSrcSetLabel.toString(),argsLabel)
        }

        return displaykey.Web.Rating.Flow.RateTableLabel(this.RateTableDefinition.TableName,
                                                         tableArgsLabel,
                                                         factorNameLabel.toString())
      case TC_ROUNDING:
        return displaykey.Web.Rating.Flow.RoundingScaleLabel(this.RoundingScaleType.DisplayName)
    }
    return ""
  }

  // Virtual property for CalcStepDefinitionOperand used for display purposes.  Base on operand type, formats
  // a UI friendly string backed by a displaykey.  OperandName is primarily a read only property.  The elements
  // used when deriving the OperandName for a given operand is controlled via the pull right menus in the UI.
  property set OperandName(value : String) {
   if (this.OperatorType == TC_STORE) {
     this.CalcStep.PrimaryOperand.VariableName = value
     this.CalcStep.PrimaryOperand.OperandType = CalcStepOperandType.TC_LOCALVAR
   } else {
     throw new RuntimeException("Cannot set OperandName directly unless you are doing STORE")
   }
  }

  property get HasOperand() : boolean {
    return this.OperandType != null
  }

  property get InScopeEntityNames() : CalcRoutineParamName[] {
    return this.CalcStep.CalcRoutineDefinition.ParameterSet.Parameters*.Code
  }

  property get PrimaryOperand() : boolean {
    return this.OperandOrder == 0
  }

  property get SortedArgumentSources() : List<CalcStepDefinitionArgument> {
    return this.ArgumentSources.sortBy(\argSrc -> argSrc.RateTableMatchOp != null ? argSrc.RateTableMatchOp.sortedParams().first().SortOrder : -1).toList()
  }

  static function isComparable(type1: IType, type2: IType): boolean {
    if (type2 == null) return true // unknown type is comparable to anything
    if (TypeKey.Type.isAssignableFrom(type1) and type2 == String or type1 == String and TypeKey.Type.isAssignableFrom(type2)) {
      return true // allow String comparison to TypeKey, because when you know the TypeKey subclass it is legal
                  // but when we call this we don't know the subclass yet.
    }
    return TypeMaps.isAssignable(type1, type2) or TypeMaps.isAssignable(type2, type1)
  }


  /**
   * generate "available" value for Conditional Popup:Menu Item Set where RHS is untyped constant
   * @return true if corresponding menu item should be available, false if it should be grayed out
   */
  function isComparableToConstantInsideConditional() : boolean {
    // special case when we have Date constant on left: don't allow comparison to untyped constant
    if (this.OperandType == TC_CONSTANT) {
      if (this.IsDate) {
        return false // cannot compare date constant to constant
      } else  {
        // constant can always be compared with another constant, typekey constant, boolean constant
        // this explicitly allows comparison between String and Typekey Constant.
        return true
      }
    }

    return isComparableInsideConditional(null, \ unusedArg, leftIType -> {
      if (leftIType == null) return true
      var iTypesComparableWithConstant = TypeMaps.supportedPrimitiveTypes().subtract({Date})
      return iTypesComparableWithConstant.contains(leftIType)
    })
  }

  /**
   * generate "available" value for Conditional Popup:Menu Item Set where RHS is typekey constant or Date constant
   * @return true if corresponding menu item should be available, false if it should be grayed out
   */
  function isComparableInsideConditional(targetType : IType) : boolean {
     return isComparableInsideConditional(targetType, \ t, l -> isComparable(t, l))
  }


  // helper method for public isComparableInsideConditional methods above
  private function isComparableInsideConditional(targetType : IType,
                       checkCondition : block(targetType : IType, leftOperandType : IType) : boolean) : boolean {
    var leftOperandIType : IType = null
    switch (this.OperandType) {
      case TC_CONDITIONAL:
        throw new IllegalStateException("CalcStepDefinitionOperandEnhancement.isComparableInsideConditional() called for a left operand type of Conditional. " +
              "This should not happen, as we disallow sub-operands of a conditional operand that are themselves conditional operands.")
      case TC_RATEFUNC:
      case TC_LOCALVAR:
      case TC_INSCOPE:
      case TC_CONSTANT:
      case TC_RATETABLE:
        leftOperandIType = this.OperandIType
        break
      default:
        throw new IllegalStateException("CalcStepDefinitionOperandEnhancement.isComparable() called with un-supported left " +
              " operand type of " + this.OperandType)
    }
    return checkCondition(targetType, leftOperandIType)
  }

  /**
   * @return true if this operand is a suboperand of a Conditional, false otherwise.
   */
  property get isSubOperand() : boolean {
    return (this.CalcStep.PrimaryOperand.OperandType == TC_CONDITIONAL and this.OperandOrder > 0)
  }

  /**
   * @return operator type for a conditional suboperand.  If not suboperand, returns null
   */

  property get conditionOperatorType() : CalcStepOperatorType {
    if (not isSubOperand) {
      return null
    }
    if (isRightSubOperand) {
      return this.OperatorType
    } else {
      return MatchingRightSubOperand.OperatorType
    }
  }

  /**
   * @return true if this operand is a right-hand suboperand of a Conditional, false otherwise.
   */
  property get isRightSubOperand(): boolean {
    return this.isSubOperand and this.OperandOrder.Even
  }

  /**
   * @return true if this operand is a left-hand suboperand of a Conditional, false otherwise.
   */
  property get isLeftSubOperand(): boolean {
    return this.isSubOperand and this.OperandOrder.Odd
  }

  /**
   * if this operand is a right-hand operand of a Conditional, return its left counterpart else return null
   * @return the left suboperand that corresponds to this operand if there is one; null otherwise.
   */
  property get MatchingLeftSubOperand() : CalcStepDefinitionOperand {
    return isRightSubOperand ? this.CalcStep.OrderedOperands[this.OperandOrder-1] : null
  }

  property get MatchingRightSubOperand() : CalcStepDefinitionOperand {
    return isRightSubOperand ? null : this.CalcStep.OrderedOperands[this.OperandOrder + 1]
  }

  property get RateFactorColName() : String {
    if (this.ReturnFactorColumns.IsEmpty) {
      return null
    } else if (this.ReturnFactorColumns.Count > 1) {
      return RateRoutineRateTablePopupHelper.AllFactorsCode
    } else {
      return this.ReturnFactorColumns.single().ColumnName
    }
  }

  property set RateFactorColName(factorColName : String) {
    // Assume changing tables clears existing ReturnFactorColumns
    var rateTableDef = this.RateTableDefinition
    resetFactors()
    if (factorColName == RateRoutineRateTablePopupHelper.AllFactorsCode) {
      rateTableDef.Factors.each(\ fcn-> {
        var factor = new CalcStepDefinitionRateFactor() { :ColumnName = fcn.ColumnName }
        this.addToReturnFactorColumns(factor)
      })
    } else {
      this.addToReturnFactorColumns(new CalcStepDefinitionRateFactor()
            { :ColumnName = factorColName})
    }
  }

  property get IsMultiFactorRateTableLookup() : boolean {
    return this.OperandType == TC_RATETABLE and this.ReturnFactorColumns.Count > 0
  }

  property get OperandIType() : IType {
    switch (this.OperandType) {
      case TC_RATEFUNC:
        return RateFlowReflection.getMethodInfoForMethod(this.CalcStep.CalcRoutineDefinition.PolicyLinePatternCode, this.FunctionName).ReturnType
      case TC_LOCALVAR:
        if (this.VariableFieldName.HasContent) {
          if (this.VariableFieldName == RateRoutineRateTablePopupHelper.AllFactorsCode) {
            return MultiFactorVariable
          } else {
            // Note:  assumes that the fields of a MultiFactorVar will not change after its first assignment.
            // TODO:  (PC-21343) Make sure we've got validation that enforces this.
            var multiFactorStoreStep =
              this.StepDefinition.CalcRoutineDefinition.FilteredOrderedSteps(\step ->step.StoreLocation == this.VariableName)
                    .first()
            var rateTable = multiFactorStoreStep.PrimaryOperand.RateTableDefinition
            return rateTable.getFactorIType(this.VariableFieldName)
          }
        } else {
          return null
        }
      case TC_CONSTANT:
        if (this.IsDate) {
          return java.util.Date
        } else if (this.IsTypeKey) {
          return  TypeSystem.getByRelativeName(this.TypeDeclaration)
        }
        break
      case TC_INSCOPE:
        return TypeSystem.getByRelativeName(this.TypeDeclaration)
      case TC_RATETABLE:
        if (this.TableCode == null) {
          throw new IllegalStateException("CalcStepDefinitionOperandEnhancement.IOperandType() " +
                "called for an operand type of Table Lookup with null table code. This should not happen.")
        }
        if (this.ReturnFactorColumns.Count > 1) {
          return MultiFactorVariable
        } else if (this.ReturnFactorColumns.Count == 1) {
          return this.RateTableDefinition.getFactorIType(this.ReturnFactorColumns.single().ColumnName)
        } else {
          var rateTableDef = this.RateTableDefinition
          return rateTableDef.getFactorIType(rateTableDef.Factors.single().ColumnName)
        }
      default:
        return null
    }
    return null
  }

  private property get OverriddenTableArgsLabel() : String {
    if (this.OperandType != TC_RATETABLE) {
      throw new IllegalStateException("Attempting to get overridden table args string for a non-rate table operand.")
    }
    if (this.TableCode == null) {
      return ""
    }

    var argValues : List<String> = {}

    // Do not anticipate a large number of argument sources.  If there are a large number of argument sources,
    // filter on override source before sorting.
    var overriddenValues =
      this.SortedArgumentSources.where(\argSrc -> argSrc.OverrideSource)
                                .map(\argSrc -> argSrc.ArgumentSource)

    if (overriddenValues.Count > 0) {
      argValues.addAll(overriddenValues.toList())
    } else {
      return ""
    }

    if (this.RateTableDefinition.SortedParameters.Count > argValues.Count) {
      argValues.add("...")
    }

    var argStringBuilder = new StringBuilder().append(argValues.join(", "))
    return argStringBuilder.toString()
  }

  function missingRateTable() : String {
    if (this.OperandType == TC_RATETABLE and (this.TableCode.NotBlank) and this.RateTableDefinition == null) {
      return displaykey.Validation.Rating.RateRoutineDefinition.MissingTable(this.TableCode)
    }
    return ""
  }

  function mismatchingRateTableMatchops() : String[] {
    if (this.OperandType == TC_RATETABLE and (this.TableCode.NotBlank)) {
      var argSrcs = this.ArgumentSources*.Parameter.toList()
      var rateTable = this.RateTableDefinition
      var matchOps : List<String> = (rateTable != null) ? rateTable.SortedMatchOps*.Name.toList() : {}
      var missing = argSrcs.subtract(matchOps)
      var extras = matchOps.subtract(argSrcs)
      var misMatches = new ArrayList<String>()
      if (missing.HasElements) {
        misMatches.add(displaykey.Validation.Rating.RateRoutineDefinition.BadRateTableParameters(missing.join(", ")))
      }
      if (extras.HasElements) {
        misMatches.add(displaykey.Validation.Rating.RateRoutineDefinition.ExtraRateTableParameters(extras.join(", ")))
      }
      return misMatches.toTypedArray()
    } else {
      return {}
    }
  }

}
