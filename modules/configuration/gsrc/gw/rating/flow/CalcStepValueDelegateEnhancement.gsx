package gw.rating.flow

uses gw.lang.reflect.TypeSystem
uses gw.entity.ITypeList
uses gw.api.productmodel.CovTermPattern
uses java.lang.RuntimeException
uses gw.rating.flow.util.InScopeUsage
uses gw.rating.flow.util.RateFlowReflection
uses java.text.SimpleDateFormat
uses java.util.Locale
uses gw.lang.reflect.IType
uses java.util.Date
uses gw.api.util.DisplayableException
uses com.guidewire.pl.system.util.NumberFormatUtil
uses java.math.BigDecimal
uses java.lang.Integer
uses java.lang.ArithmeticException
uses gw.api.productmodel.CovTermPatternLookup

enhancement CalcStepValueDelegateEnhancement: entity.CalcStepValueDelegate {
  private static function determineConstantTypeForStringValue(constantValue: String): IType {
    var validConstantBooleanValues = {"True", "true", "False", "false", "TRUE", "FALSE"}
    var validConstantNullValues = {"null", "NULL", "Null"}
    var trimmedValue = constantValue.trim()
    if (trimmedValue.contains('"' as java.lang.CharSequence)) {
      return String
    }
    if (validConstantBooleanValues.contains(trimmedValue)) {
      return Boolean
    }
    if (validConstantNullValues.contains(trimmedValue)) {
      return null
    }
    try {
      Number.valueOf(trimmedValue)
      return Number
    } catch (e: java.lang.NumberFormatException) {
      throw new DisplayableException(displaykey.Validation.Rating.UntypedConstantValue)
    }
  }

  property get TypeOfConstant(): IType {
    if (this.OperandType != null and this.OperandType != TC_CONSTANT) {
      throw "Illegal attempt to access property ConstantType for operand type " + this.OperandType
    }
    if (this.InScopeValueType!= null and typeIsInvalid(this.InScopeValueType)) {
      throw new DisplayableException(displaykey.Validation.Rating.UntypedConstantValue)
    }
    if (this.ConstantValue == null) {
      return null
    }
    if (typeIsTypeKey(this.InScopeValueType)) {
      return gw.entity.TypeKey
    }
    if (typeIsDate(this.InScopeValueType)) {
      return Date
    }
    if (typeIsBoolean(this.InScopeValueType)) {
      return Boolean
    }
    if (typeIsInteger(this.InScopeValueType) or typeIsBigDecimal(this.InScopeValueType)) {
      return Number
    }

    // TODO: It would be better not to have to do this, but unless/until we write an
    // upgrade trigger for old rating data, we have no choice.   If we *can* get rid of
    // this, we may still need to check for ConstantValue == "null"/"Null"/"NULL"
    return determineConstantTypeForStringValue(this.ConstantValue)
  }

  property get LocalizedConstantValue(): String {
      try {
        if (typeIsBigDecimal(this.InScopeValueType)){
          var decConstant = new BigDecimal(this.ConstantValue)
          var decConstantAfterRender = NumberFormatUtil.render(decConstant)
          var fmt = NumberFormatUtil.getNumberFormat()
          if(decConstantAfterRender.indexOf(fmt.DecimalSymbol)<0 and decConstant.scale()>0) {
            return decConstantAfterRender.concat(fmt.DecimalSymbol).concat("0".repeat(decConstant.scale()))
          }
          return decConstantAfterRender
        } else if (typeIsInteger(this.InScopeValueType)){
          return NumberFormatUtil.render(new Integer(this.ConstantValue))
        } else {
          return this.ConstantValue
        }
      } catch (e: java.lang.NumberFormatException) {
        // This shouldn't really happen, because the setter is putting valid data into the field.
        throw new DisplayableException(displaykey.Validation.Rating.UntypedConstantValue)
      }
  }

  property set LocalizedConstantValue(str : String) {
    if(str!=null and !str.trim().Empty){
      try {
        var v = parseNum(str)
        this.ConstantValue = v.toString()
        this.TypeDeclaration = (typeof v).toString()
        return // done!
      } catch (e2: org.apache.commons.beanutils.ConversionException) {
      }

      if (str.toLowerCase().matches("(true|false)"))  {
        this.ConstantValue = str.toLowerCase() // gosu wants it in lowercase
        this.TypeDeclaration = "java.lang.Boolean"
      } else if (str.matches("^\".*\"$")) {
        this.ConstantValue = str
        this.TypeDeclaration = "java.lang.String"
      } else if({"null", "NULL", "Null"}.contains(str.trim())){
        this.ConstantValue = "null"
        this.TypeDeclaration = null
      } else {
        this.ConstantValue = str
        this.TypeDeclaration = InvalidType
      }
    }else {
      this.ConstantValue = null
      this.TypeDeclaration = null
    }
  }

  private function parseNum(str : String) : java.lang.Number {
    var fmt = NumberFormatUtil.getNumberFormat()
    str = str.trim()
    if (str.endsWith("bd")) {
      return NumberFormatUtil.parse(str.substring(0, str.length() - 2))
    } else if (str.indexOf(fmt.DecimalSymbol) >= 0) {
      // assume that without a decimal separator OR a 'bd' suffix, it's an int
      return NumberFormatUtil.parse(str)
    } else {
      // What happens in the (very strange!) case where integer format and bigdecimal format look different?
      // (Will this really happen?)  To avoid it, we would need an explicit NumberFormatUtil.parseIntOnly()
      return NumberFormatUtil.parse(str).intValueExact()
    }
  }

  /**
   * This property on the enhancement can go away if we rename InScopeValueType to TypeDeclaration
   */
  property get TypeDeclaration(): String {
    return this.InScopeValueType
  }

  property set TypeDeclaration(typeDecl: String) {
    this.InScopeValueType = typeDecl
  }

  //This function used only to return a date to be displayed on the UI, and set it to Today by default
  //DateConstantValue is the function to be used in several places to return the "Date Constant Value" from the entity
  property get DateConstantValueForUI(): java.util.Date {
    //The date widget won't call the setter on DateConstantValueForUI unless the user selects a different date
    //To overcome this issue, don't just display current date by default, but also manually set the date to current date
    if (this.ConstantValue == null or this.ConstantValue.Empty) {
      this.DateConstantValue = java.util.Date.Today
    }
    return this.DateConstantValue
  }

  property set DateConstantValueForUI(value: java.util.Date) {
    this.DateConstantValue = value
  }

  //This function used to return the "Date Constant Value" from the entity
  //Do not use DateConstantValueForUI for that purpose as that would set the constantValue to Today if null
  property get DateConstantValue(): java.util.Date {
    var dateParser = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy", new Locale("en", "US"))
    return dateParser.parse(this.ConstantValue)
  }

  property set DateConstantValue(value: java.util.Date) {
    this.ConstantValue = (value == null) ? java.util.Date.Today as String : value.toString()
    TypeDeclaration = "java.util.Date"
  }

  property get IsDate(): boolean {
    return typeIsDate(TypeDeclaration)
  }

  private function typeIsDate(typeDecl: String): boolean {
    if (typeDecl == null) {
      return false
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl)
      return java.util.Date.Type.isAssignableFrom(t)
    } catch (e: java.lang.ClassNotFoundException) {
      return false
    }
  }

  property get BooleanConstantValue(): Boolean {
    return this.ConstantValue as Boolean
  }

  property set BooleanConstantValue(value: Boolean) {
    this.ConstantValue = value == null ? null : value.toString()
    TypeDeclaration = "java.lang.Boolean"
  }

  property get IsBoolean(): boolean {
    return typeIsBoolean(TypeDeclaration)
  }

  private function typeIsBoolean(typeDecl: String): boolean {
    if (typeDecl == null) {
      return false
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl)
      return java.lang.Boolean.Type.isAssignableFrom(t)
          or java.lang.Boolean.Type.isAssignableFrom(TypeSystem.getBoxType(t))
    } catch (e: java.lang.ClassNotFoundException) {
      return false
    }
  }

  private function typeIsBigDecimal(typeDecl: String) : boolean {
    if (typeDecl == null) {
      return false
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl)
      return java.math.BigDecimal.Type.isAssignableFrom(t)
          or java.math.BigDecimal.Type.isAssignableFrom(TypeSystem.getBoxType(t))
    } catch (e: java.lang.ClassNotFoundException) {
      return false
    }
  }

  private function typeIsInteger(typeDecl: String) : boolean {
    if (typeDecl == null) {
      return false
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl)
      return java.lang.Integer.Type.isAssignableFrom(t)
          or java.lang.Integer.Type.isAssignableFrom(TypeSystem.getBoxType(t))
    } catch (e: java.lang.ClassNotFoundException) {
      return false
    }
  }

  private function typeIsInvalid(typeDecl: String) : boolean {
    return typeDecl.equals(InvalidType)
  }

  private static property get InvalidType() : String {
    return "Invalid Type"
  }

  property get TypekeyConstantValue(): gw.entity.TypeKey {
    return getTypekeyValue(TypeDeclaration, this.ConstantValue)
  }

  property set TypekeyConstantValue(value: gw.entity.TypeKey) {
    TypeDeclaration = value.IntrinsicType.RelativeName
    this.ConstantValue = value.Code
  }

  property get IsTypeKey(): boolean {
    return typeIsTypeKey(TypeDeclaration)
  }

  property get IsNumeric(): boolean {
   return TypeOfConstant == Number
  }

  property get IsEditableConstant() : boolean {
    return this.OperandType == TC_CONSTANT and !(this.IsDate or this.IsTypeKey)
  }

  property get IsRounding(): boolean {
    return this.OperandType == TC_ROUNDING
  }

  private function typeIsTypeKey(typeDecl: String): boolean {
    if (typeDecl == null) {
      return false
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl)
      if (t.Interfaces.Count > 0) {
        return t.Interfaces.hasMatch(\i -> i.Name == "gw.entity.TypeKey")
      } else {
        return false
      }
    } catch (e: java.lang.ClassNotFoundException) {
      return false
    }
  }

  private function getTypekeyValue(typeDecl: String, code: String): gw.entity.TypeKey {
    if (typeDecl == null or code == null) {
      return null
    }
    try {
      var t = TypeSystem.getByRelativeName(typeDecl) as ITypeList
      return t.getTypeKey(code)
    } catch (e: java.lang.ClassNotFoundException) {
      return null
    }
  }

  function resetInScope() {
    this.InScopeParam = null
    this.InScopeValueType = null
    this.InScopeValue = null
    this.InScopeValueIsModifier = false
  }

  /**
   * This is what we want to pass in to method maybeClearConstantSubtypeValue when we want to indicate that
   * we are creating a Typelist Constant, but we don't know the specific typelist yet.
   */
  property get TYPELIST_SUBTYPE(): String {
    return "gw.entity.TypeList"
  }

  // We have issues whenever we switch from one type of constant to another:
  // date <-> typekey, typekey <-> untyped, untyped <-> date
  // Eventually this may improve (because you cannot change to an untyped constant w/o
  // invoking clear) but we STILL will have the problem between typekey and date.
  function maybeClearConstantSubtypeValue(newTypeDecl: String) {
    if (newTypeDecl == TYPELIST_SUBTYPE) {
      if (not IsTypeKey) {
        this.TypeDeclaration = null
        this.ConstantValue = null
      }
    } else if (newTypeDecl != this.TypeDeclaration) {
      this.TypeDeclaration = newTypeDecl
      this.ConstantValue = null
    }
  }

  function clearValueDelegateValues() {
    resetInScope()
    this.VariableName = null
    this.ConstantValue = null
    this.TypeDeclaration = null
  }

  function clearDependentValues() {
    if (this typeis CalcStepDefinitionArgument) {
      switch (this.Operand.OperandType) {
        case TC_RATETABLE:
            if (this.getDependentList().HasElements) {
              var depList = this.getDependentList()
              depList.each(\dl -> {
                var argSource = this.Operand.ArgumentSources.singleWhere(\c -> c.Parameter == dl.MatchOp.Name)
                argSource.clear()
              })
            }
            break
          default:
          // Nothing
      }
    }
  }

  property get StepDefinition(): CalcStepDefinition {
    var def: CalcRoutineDefinition
    if (this typeis CalcStepDefinitionOperand) {
      def = this.CalcStep.CalcRoutineDefinition
    } else if (this typeis CalcStepDefinitionArgument) {
      def = this.CalcRoutineDefinition
    }
    return def.OrderedSteps.firstWhere(\step -> step.StoreLocation == this.VariableName)
  }

  // Read-only property used to provide a UI friendly label for CalcStepValueDelegate
  // (e.g. CalcStepDefinitionOperands and CalcStepDefinitionArguments)
  property get StepValueDisplayName(): String {
    if (this.OperandType == null) {
      return ""
    }
    switch (this.OperandType) {
      case TC_CONSTANT:
          if (this.IsDate) {
            return displaykey.Web.Rating.Flow.CalcRoutine.RateConstantLabel(this.DateConstantValue.ShortFormat)
          } else if (this.IsTypeKey) {
            return this.TypekeyConstantValue != null ?
                displaykey.Web.Rating.Flow.TypeKeyConstantLabel(this.TypekeyConstantValue.IntrinsicType.RelativeName, // the associated list's name
                    this.TypekeyConstantValue.DisplayName) // the typekey's display name
                : displaykey.Web.Rating.Flow.TypeKeyConstantLabel(this.TypeDeclaration.remove(gw.rating.rtm.util.RatingUIUtil.TypekeyPrefix), // the associated list's name
                    this.ConstantValue)
          }
          return displaykey.Web.Rating.Flow.CalcRoutine.RateConstantLabel(this.LocalizedConstantValue)
      case TC_LOCALVAR:
          if (this.VariableFieldName.HasContent) {
            // Currently we assume that the only case this is set is in the case where
            // we are referencing factors off a MultiFactorVariable; we need to determine
            // the table who's multiple factors are stored in the targeted variaable.
            // NOTE: This does not take into the account the case where two different
            // multi-factor rate tables are storing all factors to the same multi-factor variable.
            var colLabel = this.StepDefinition.PrimaryOperand.RateTableDefinition.getFactorLabel(this.VariableFieldName)
            return displaykey.Web.Rating.Flow.CalcRoutine.RateVariableLabel(this.VariableName,
                displaykey.Web.Rating.Flow.CalcRoutine.LocalVarFieldLabel(colLabel))
          }
          return displaykey.Web.Rating.Flow.CalcRoutine.RateVariableLabel(this.VariableName, "")
      case TC_INSCOPE:
          if (this.InScopeParam == TC_COSTDATA) {
            if (this.InScopeValue != null) {
              return displaykey.Web.Rating.Flow.CalcRoutine.CostDataStoreLabel(this.InScopeParam.DisplayName, this.InScopeValue)
            } else {
              return ""
            }
          } else if (this.InScopeValue != null) {
            if (this.CovTermCode != null) {
              var termPattern = CovTermPatternLookup.getByCode(this.CovTermCode)
              var valueType = TypeSystem.getByRelativeName(this.InScopeValueType)
              if (CovTermPattern.Type.isAssignableFrom(valueType)) {
                return displaykey.Web.Rating.Flow.CalcRoutine.InScopeCovTermOperandLabel(this.InScopeParam.DisplayName, termPattern.DisplayName)
              } else {
                var suffix = InScopeUsage.getCovTermOptionDisplaySuffix(termPattern, this.InScopeValue)
                return displaykey.Web.Rating.Flow.CalcRoutine.InScopeCovTermValueOperandLabel(this.InScopeParam.DisplayName, termPattern.DisplayName, suffix)
              }
            }
            return displaykey.Web.Rating.Flow.CalcRoutine.InScopeOperandAndValueLabel(this.InScopeParam.DisplayName, this.InScopeValue)
          } else {
            return displaykey.Web.Rating.Flow.CalcRoutine.InScopeOperandLabel(this.InScopeParam.DisplayName)
          }
        default:
        throw new RuntimeException("Attempted to get Step Value Display Name for unsupported operand type: " + this.OperandType)
    }
  }
}
