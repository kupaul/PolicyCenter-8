package gw.job.sxs

uses gw.api.match.MatchableTreeTraverserUtils

uses gw.lang.reflect.IType

uses java.util.Map
uses java.util.Set
uses gw.util.concurrent.LocklessLazyVar
uses gw.entity.IEntityType

/**
 * PersonalAutoSideBySideBaseDataConfig
 * Configuration that controls which entities and properties are considered Side By Side Data.
 * Provides access to entities that are created, updated or removed as a result of base
 * data copy when accessing Side By Side data.
 */
@Export
class PersonalAutoSideBySideBaseDataConfig extends AbstractSideBySideBaseDataConfig {
  private var _src : PolicyPeriod as Src
  private var _dst : PolicyPeriod as Dst

  static private var sideBySideTypes = new LocklessLazyVar<Set<IType>>() {
    override function init() : Set<IType> {
      return MatchableTreeTraverserUtils.getSubAndImplementingTypes({
        // Types that are side by side should be added here:

        // Strongly suggested exclusions
        VehicleDriver,
        PAVhcleAddlInterest,
      
        // OOB configured exclusions
        PersonalAutoCov,
        PersonalVehicle

        // Note: The above exclusions assume that certain types are excluded in AbstractSideBySideBaseDataConfig, including:
        // Coverage, Exclusion, PolicyCondition, CoverageSymbol, CoverageSymbolGroup, Form, FormAssociation, FormEdgeTable,
        // Reinsurable, and UWIssue.  If any of those types is removed from that class, they may need to be added here to
        // make this code work correctly.
      })
    }
  }

  // The list of properties below will be checked against for all types of properties (e.g. - FKs, arrays, scalars)
  // during base data copy.  If the Type->Property is in this map, it will be considered side by side and NOT copied
  // during base data copy.  To exclude multiple properties for the same type, be sure to use a single [type]->[property set>] entry.
  // e.g. - make typeA.prop1 and typeA.prop2 side-by-side:
  //   Correct: prop1 and prop2 will be excluded
  //     <typeA> -> {<prop1>, <prop2>}
  //   Incorrect: only prop2 will be excluded (previous definition is over written)
  //     <typeA> -> {<prop1>}
  //     <typeA> -> {<prop2>}
  //
  static private var sideBySideProperties = new LocklessLazyVar<Map<IType,Set<String>>>() {
    override function init() : Map<IType,Set<String>> {
      var superTypeToPropertiesMap : Map<IEntityType,Set<String>> = {
        // Properties that are side by side should be added here:

        // Strongly suggested exclusions
        entity.PersonalAutoLine -> {"ReferenceDateInternal"},
        PersonalVehicle -> {"ReferenceDateInternal", "QuickQuoteNumber"},
        PolicyDriver -> {"QuickQuoteNumber"},

        // OOB configured exclusions
        EffectiveDatedFields -> {"OfferingCode"}

        // Note: The above exclusions assume that certain properties are excluded in AbstractSideBySideBaseDataConfig, including:
        // Coverable: InitialCoveragesCreated, InitialExclusionsCreated, and InitialConditionsCreated
        // PolicyPeriod: RIRiskVersionList, QuoteHidden, EditLocked, DepositCollected, InvoiceStreamCode, NewInvoiceStream,
        //               ReportingPatternCode, SingleCheckingPatternCode, SeriesCheckingPatternCode, OverrideBillingAllocation,
        //               BillImmediatelyPercentage, DepositOverridePct, DepositAmount, WaiveDepositChange, SelectedPaymentPlan,
        //               AltBillingAccountNumber, AllocationOfRemainder, RefuncCalcMethod, BillingMethod, MinimumPremium,
        //               TotalCostRPT, TotalPremiumRPT, TransactionCostRPT, TransactionPremiumRPT, BaseState, and WrittenDate
        // Coverage, Exclusion, and Modifier: ReferenceDateInternal
        // PolicyLine: MinimumPremium and NumAddlInsured
        // If any of those types is removed from that class, they may need to be added here to
        // make this code work correctly.
      }

      // Confirm all Property names refer to real properties and include subtypes
      superTypeToPropertiesMap.eachKeyAndValue(\ type, props -> props.each(\ prop -> checkPropertyName(type, prop)))
      return MatchableTreeTraverserUtils.associateAllSubTypesWithPropertySet(superTypeToPropertiesMap)
    }
  }

  override function shouldCopyBean(parentBean : KeyableBean, targetBean : KeyableBean) : boolean {
    if ((parentBean typeis PersonalAutoLine) and (targetBean typeis PAModifier)) {
      return (not targetBean.PatternCode.equals("PAMultiCarDiscount"))
    }
    return true
  }

  override function supportsPolicies(policyPeriods : List<PolicyPeriod>) : boolean {
    return policyPeriods.allMatch(\pp -> (not pp.MultiLine) and pp.PersonalAutoLineExists)
  }

  override function getLineSpecificPropertyExclusions() : Map<IType, Set<String>> {
    return sideBySideProperties.get()
  }

  override function getLineSpecificTypeExclusions() : Set<IType> {
    return sideBySideTypes.get()
  }
}