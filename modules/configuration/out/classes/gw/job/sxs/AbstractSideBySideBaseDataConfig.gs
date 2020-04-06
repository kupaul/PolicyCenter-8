package gw.job.sxs

uses gw.api.match.MatchableKey
uses gw.api.match.MatchableTreeTraverserConfig
uses gw.api.match.MatchableTreeTraverserUtils

uses gw.entity.IArrayPropertyInfo
uses gw.entity.IEntityPropertyInfo
uses gw.entity.IEntityType
uses gw.entity.ILinkPropertyInfo

uses gw.lang.reflect.IType

uses java.lang.IllegalStateException
uses java.util.Map
uses java.util.Set
uses gw.util.concurrent.LocklessLazyVar
uses org.slf4j.Logger
uses gw.pl.logging.LoggerFactory

/**
 * AbstractSideBySideBaseDataConfig
 * Configuration that controls which entities and properties are considered Side By Side Data.
 * Provides access to entities that are created, updated or removed as a result of base
 * data copy when accessing Side By Side data.
 */
@Export
abstract class AbstractSideBySideBaseDataConfig implements MatchableTreeTraverserConfig {
  private var _src : PolicyPeriod as Src
  private var _dst : PolicyPeriod as Dst

  static private var _logger : Logger as SxSLogger = LoggerFactory.getLogger("SXS")

  static private var sideBySideTypes = new LocklessLazyVar<Set<IType>>() {
    override function init() : Set<IType> {
      return MatchableTreeTraverserUtils.getSubAndImplementingTypes({
        // Types that are side by side should be added here:

        // Strongly suggested exclusions
        Coverage,
        Exclusion,
        PolicyCondition,
        CoverageSymbol,
        CoverageSymbolGroup,
        Form,
        FormAssociation,
        FormEdgeTable,
        Reinsurable,
        UWIssue

        // OOB configured exclusions (none yet)
      })
    }
  }

  // The list of properties below will be checked against for all types of properties (e.g. - FKs, arrays, scalars)
  // during base data copy.  If the Type->Property is in this map, it will be considered side by side and NOT copied
  // during base data copy.
  static private var sideBySideProperties = new LocklessLazyVar<Map<IType,Set<String>>>() {
    override function init() : Map<IType,Set<String>> {
      var superTypeToPropertiesMap : Map<IEntityType,Set<String>> = {
        // Properties that are side by side should be added here:

        // Strongly suggested exclusions
        Coverable -> {"InitialCoveragesCreated", "InitialExclusionsCreated", "InitialConditionsCreated"},
        PolicyPeriod -> {"RIRiskVersionLists", "QuoteHidden", "EditLocked", "DepositCollected", "InvoiceStreamCode", "NewInvoiceStream",
                         "SingleCheckingPatternCode", "SeriesCheckingPatternCode", "OverrideBillingAllocation",
                         "BillImmediatelyPercentage", "DepositOverridePct", "DepositAmount", "WaiveDepositChange", "SelectedPaymentPlan",
                         "AltBillingAccountNumber", "AllocationOfRemainder", "RefundCalcMethod", "BillingMethod", "MinimumPremium",
                         "TotalCostRPT", "TotalPremiumRPT", "TransactionCostRPT", "TransactionPremiumRPT", "BaseState", "WrittenDate", "RateAsOfDate", "DoNotPurge", 
                         "WorksheetContainer"},
        Coverage -> {"ReferenceDateInternal"},
        Exclusion -> {"ReferenceDateInternal"},
        Modifier -> {"ReferenceDateInternal"},
        PolicyLine -> {"MinimumPremium", "NumAddInsured"}

        // OOB configured exclusions (none yet)
      }

      // Confirm all Property names refer to real properties and include subtypes
      superTypeToPropertiesMap.eachKeyAndValue(\ type, props -> props.each(\ prop -> checkPropertyName(type, prop)))
      return MatchableTreeTraverserUtils.associateAllSubTypesWithPropertySet(superTypeToPropertiesMap)
    }
  }

  /**
   * Confirms the passed <code>propType</code> has a property denoted by <code>propName</code>, throwing an
   * {@link IllegalArgumentException} if no such property exists.
   *
   * @param propType Parent type of the desired property
   * @param propName Name of the property
   */
  static function checkPropertyName(propType : IEntityType, propName : String) {
    var prop = propType.TypeInfo.getProperty(propName)
    if (null==prop) {
      throw new IllegalStateException("No such property (" + propName + ") for property type: " + propType.RelativeName)
    }
  }

  private function isSideBySideType(type : IType) : boolean {
    if (type typeis IEntityType) {
      return sideBySideTypes.get().contains(type) || getLineSpecificTypeExclusions().contains(type)
    } else {
      return false
    }
  }

  private function isSideBySideProperty(entityProp : IEntityPropertyInfo) : boolean {
    var type = entityProp.OwnersType
    var ignoredProperties = sideBySideProperties.get().get(type)
    var ignoredLineSpecificProperties = getLineSpecificPropertyExclusions().get(type)
    if ((ignoredProperties != null && ignoredProperties.contains(entityProp.Name)) ||
        (ignoredLineSpecificProperties != null && ignoredLineSpecificProperties.contains(entityProp.Name))) {
      return true
    } else {
      return false
    }
  }

  override function setup(source : PolicyPeriod, dest : PolicyPeriod) {
    _src = source
    _dst = dest
  }

  override public function shouldCopyProperty(prop : IEntityPropertyInfo) : boolean {
    if (isSideBySideProperty(prop)) {;
      _logger.trace("shouldCopyProperty(" + prop.DisplayName + "): FALSE")
      return false
    } else {
      _logger.trace("shouldCopyProperty(" + prop.DisplayName + "): TRUE")
      return true
    }
  }

  override public function shouldCopyFK(prop : ILinkPropertyInfo) : boolean {
    if (isSideBySideProperty(prop)) {
      _logger.trace("shouldCopyFK(" + prop.DisplayName + "): FALSE")
      return false
    }
    var propComponentType = prop.FeatureType
    if (isSideBySideType(propComponentType)) {
      _logger.trace("shouldCopyFK(" + propComponentType.RelativeName + "): FALSE")
      return false
    } else {
      _logger.trace("shouldCopyFK(): TRUE -> " + propComponentType.RelativeName)
      return true
    }
  }

  override public function shouldCopyArray(prop : IArrayPropertyInfo) : boolean {
    if (isSideBySideProperty(prop)) {
      _logger.trace("shouldCopyArray(" + prop.DisplayName + "): FALSE")
      return false
    }
    var propComponentType = prop.FeatureType.ComponentType
    if (isSideBySideType(propComponentType)) {
      _logger.trace("shouldCopyArray(): FALSE -> " + propComponentType.RelativeName)
      return false
    } else {
      _logger.trace("shouldCopyArray(): TRUE -> " + propComponentType.RelativeName)
      return true
    }
  }

  override function shouldCopyOther(prop : IEntityPropertyInfo) : boolean {
    _logger.trace("shouldCopyOther(" + prop.DisplayName + "): FALSE")
    return false
  }

  override function visitNewlyCreatedEntities(mapOfNewBeans : Map<MatchableKey,KeyableBean>) {
    if (!mapOfNewBeans.Empty) {
      _logger.debug("Added " + mapOfNewBeans.size() + " beans. visitNewlyCreatedEntities(): ")
      mapOfNewBeans.eachKeyAndValue(\ m, k -> {
      _logger.debug("  [Hashcode: " + m.hashCode() + "]->[" + (typeof k) + ": " + k.DisplayName + "]")
      })
    }
  }

  override function visitUpdatedEntities(mapOfUpdatedBeans : Map<MatchableKey,KeyableBean>) {
    if (!mapOfUpdatedBeans.Empty) {
      _logger.debug("Updated " + mapOfUpdatedBeans.size() + " beans. visitUpdatedEntities(): ")
      mapOfUpdatedBeans.eachKeyAndValue(\ m, k -> {
        _logger.debug("  [Hashcode: " + m.hashCode() + "]->[" + (typeof k) + ": " + k.DisplayName + "]")
      })
    }
  }

  override function visitRemovedEntities(mapOfRemovedBeans : Map<MatchableKey,KeyableBean>) {
    if (!mapOfRemovedBeans.Empty) {
      _logger.debug("Removed " + mapOfRemovedBeans.size() + " beans. visitRemovedEntities(): ")
      mapOfRemovedBeans.eachKeyAndValue(\ m, k -> {
        _logger.debug("  [Hashcode: " + m.hashCode() + "]->[" + (typeof k) + ": " + k.DisplayName + "]")
      })
    }
  }

  /**
   * Returns a map from type to set of property names for each type which denote the properties excluded from side by side
   * base data copy at the line level.  These are interpreted literally, so if it is desired that a property be excluded from
   * a type and all its subtypes, an entry for each subtype and that property name should be included explicitly.
   * <br/>
   * The implementing class is also responsible for verifying that all property names for a given type refer to real properties
   * on that type as no attempt to check them will be done by the calling code.
   */
  abstract function getLineSpecificPropertyExclusions() : Map<IType,Set<String>>

  /**
   * Returns a set of types to exclude from side by side base data copy at the line level.  These are interpreted literally,
   * so if it is desired that a type and all subtypes be excluded an entry for each subtype should be included explicitly.
   */
  abstract function getLineSpecificTypeExclusions() : Set<IType>
}
