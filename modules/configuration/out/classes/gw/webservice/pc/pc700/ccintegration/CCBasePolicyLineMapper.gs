package gw.webservice.pc.pc700.ccintegration
uses java.util.ArrayList
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicy
uses java.util.HashSet
uses gw.api.domain.covterm.CovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCoverage
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCovTerm
uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.domain.covterm.DirectCovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicyCoverage
uses java.util.Map
uses gw.api.domain.covterm.TypekeyCovTerm
uses gw.api.domain.covterm.StringCovTerm
uses gw.api.domain.covterm.DateTimeCovTerm
uses gw.api.domain.covterm.BooleanCovTerm
uses java.math.BigDecimal
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryProperty
uses java.lang.Integer
uses gw.pl.currency.MonetaryAmount
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleOwner
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicyLocation
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPropertyOwner
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCFinancialCovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCNumericCovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCClassificationCovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCLocationBasedRU

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.CCBasePolicyLineMapper instead")
class CCBasePolicyLineMapper {

  protected var _line : PolicyLine;
  protected var _ccPolicy : CCPolicy;
  protected var _policyGen : CCPolicyGenerator;
  protected var _contactGen : CCContactGenerator;
  protected var _mappedObjects : Map<Key, Object>;

  // There are some "coverages" in PolicyCenter which are used to track things for the purpose of generating the
  // right policy forms but which may not be useful to the claims system.  A good example of this is "underlying
  // coverages" for an umbrella policy.  The policy system needs to know what the underlying coverages are in order
  // to assess policy risk and rate the policy, but the claims system probably doesn't need to know about them because
  // the are not real coverages.  If you wish to suppress sending a coverage, put its Coverage Pattern Code in this list.
  protected var _excludedCoverages : HashSet = new HashSet<String>();

  // There are some coverage terms which are meaningful for sizing and rating the risk but which are not really part
  // of defining the amount of coverage or its limitations.  For example, you might have a coverage for employee
  // benefits liability where one of the coverage terms is the number of employees.  This is important for rating
  // the coverage but is not needed by claims.  If you wish to exclude any coverage terms from being sent to CC,
  // put its CovTerm Pattern Code in this list.
  protected var _excludedCovTerms : HashSet = new HashSet<String>();

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    _line = line;
    _policyGen = policyGen;
    _contactGen = policyGen.getContactGenerator();
    _mappedObjects = policyGen.getMappedPCObjects();
  }

  // This method is used to add vehicle summaries to a list of vehicles for the CCPolicySummary.  It should
  // be overridden by any policy line that has a list of covered vehicles.
  public function mapVehicleSummaries(vehicleList : ArrayList<CCPolicySummaryVehicle>) {
  }

  // This method is used to add property summaries to a list of properties for the CCPolicySummary.  It should
  // be overridden by any policy line that has a list of covered properties (probably just buildings, but could
  // be done for other specific owned property items).
  public function mapPropertySummaries(propertyList : ArrayList<CCPolicySummaryProperty>) {
  }

  // This is the main method that is called for each PolicyLine.
  public function mapPolicyLine(ccPolicy : CCPolicy) {
    // Set the CC policy that we are mapping PC data to
    _ccPolicy = ccPolicy;

    // Set up any exclusions for coverages or cov terms
    initializeExclusions();

    // Populate any line-specific fields
    setLineSpecificFields();

    // For all line-level coverages, create policy-level coverages for CC
    createLineLevelCoverages();

    // For every coverable on the policy line, create a risk unit for CC and create RU-level coverages
    createRiskUnits();
  }

  // This function can be used to set fields on the CC Policy that are only used by certain lines.  For example,
  // a GL policy might set the claims made vs. occurrence field or a retroactive date, which is held in PC at the
  // line level.  The base class sets nothing.  If there are line-specific fields to set, then the subclass should
  // override this function.
  protected function setLineSpecificFields() {
  }

  // This function should be overridden by almost all subclasses in order to create an line-specific risk units,
  // coverages for those risk units, and any other line-specific data that should be sent to CC.  In most cases, this
  // function will be most of the work in implementing the mapping for a new policy line.
  protected function createRiskUnits() {
  }

  // This method creates a policy-level CC coverage for every line-level PC Coverage
  protected function createLineLevelCoverages() {
    for (pcCov in getLineCoverages().sortBy(\ c -> c.Pattern.Priority ) ) {
      if (!isCoverageExcluded(pcCov)) {
        var ccCov = new CCPolicyCoverage();
        populateCoverage(ccCov, pcCov);
        _ccPolicy.addToCoverages(ccCov);
      }
    }
  }

  // This function should be overridden by subclasses in order to provide a list of line-level coverages.  The base
  // class just returns an empty list which will rarely be what is desired.
  protected function getLineCoverages() : List<entity.Coverage> {
    return new ArrayList<Coverage>();
  }

  // This function handles all of the generic population of a coverage from PC to CC (anything that is not specific
  // to the subclass of coverage.
  protected function populateCoverage(ccCov : CCCoverage, pcCov : Coverage) {
    ccCov.EffectiveDate = pcCov.EffectiveDate;
    ccCov.ExpirationDate = pcCov.ExpirationDate;
    ccCov.PolicySystemID = pcCov.TypeIDString
    ccCov.Type = mapToCCCoverageCode(pcCov);
    createCovTerms(ccCov, pcCov)
  }

  protected function createCovTerms(ccCov : CCCoverage, pcCov : Coverage) {
    // Iterate over all the cov terms for the coverage, sorted by the covterm pattern's priority (ascending)
    for(covTerm in pcCov.CovTerms.sortBy(\ term -> term.Pattern.Priority) ) {
      if (!isCovTermExcluded(covTerm)) {
        // Create one or more CC cov terms for each non-excluded PC Cov Term
        // It can be multiple cov terms in the case of a PC package cov term
        var ccCovTerms = getCCCovTerms( covTerm )

        // Go through all of the newly created CC covTerms and do 2 things:
        // 1) Add them to the cov term list for the CC Cov
        // 2) See if there are values we can put directly on the Coverage.
        // Ideally, these cov terms would be ordered so that the "first" deductible or limit found in priority
        // order would be the one used to set the coverage-level fields.
        for(ccCovTerm in ccCovTerms ) {
          ccCov.addToCovTerms(ccCovTerm);

          // Only cov terms whose value represents Money can be denormalized to the coverage level since those fields
          // are assumed to mean money values.
          if (ccCovTerm typeis CCFinancialCovTerm) {
            // Set the Coverage-level deductible field if there is a deductible cov term
            if( covTerm.ModelType == CovTermModelType.TC_DEDUCTIBLE )  {
              ccCov.Deductible = (ccCovTerm.FinancialAmount == null or ccCovTerm.FinancialAmount.signum() == 0) ? null : ccCovTerm.FinancialAmount
            }
            if( covTerm.ModelType == CovTermModelType.TC_LIMIT )  {
              // Set the coverage-level exposure limit field if one is found (per person, per vehicle, etc.)
              if( ccCovTerm.ModelAggregation.equalsIgnoreCase(CovTermModelAgg.TC_PP.Code)
                    or ccCovTerm.ModelAggregation.equalsIgnoreCase(CovTermModelAgg.TC_PI.Code) ) {

                ccCov.ExposureLimit = ccCovTerm.FinancialAmount
              }
              // Set the coverage-level exposure limit field if one is found (per incident, per accident, per injury, etc.)
              if( ccCovTerm.ModelAggregation.equalsIgnoreCase(CovTermModelAgg.TC_PC.Code)
                    or ccCovTerm.ModelAggregation.equalsIgnoreCase(CovTermModelAgg.TC_EA.Code)
                    or ccCovTerm.ModelAggregation.equalsIgnoreCase(CovTermModelAgg.TC_PO.Code) ) {

                ccCov.IncidentLimit = ccCovTerm.FinancialAmount
              }
            }
          }
        } // End of loop for each CC CovTerm

        // handle any special cases
        this.handleCovTermSpecialCases(pcCov, covTerm, ccCov, ccCovTerms);
      }
    } // End of loop for each PC CovTerm
  }

  protected function getCovTermTypeIDString(covTerm : CovTerm) : String {
    return "${covTerm.Clause.TypeIDString}.${covTerm.PatternCode}"
  }

  /**
   * Generates CC CovTerms from a given PC CovTerm.  Some PC CovTerms map to only one
   * CC term, but package terms map to multiple cc terms.
   */
  protected function getCCCovTerms( covTerm : CovTerm) : CCCovTerm[] {

    var ccCovTerms = new ArrayList<CCCovTerm>()

    if ( covTerm typeis OptionCovTerm )  {

      if (isMoneyTerm(covTerm)) {
        var ccOptCovTerm = new CCFinancialCovTerm()
        setBasicCovTermFields(ccOptCovTerm, covTerm)
        ccOptCovTerm.ModelAggregation = covTerm.AggregationModel.Code
        ccOptCovTerm.ModelRestriction = covTerm.RestrictionModel.Code
        ccOptCovTerm.setFinancialAmount(covTerm.Value, covTerm.Clause.Currency)
        ccCovTerms.add( ccOptCovTerm )
      } else {
        var ccOptCovTerm = new CCNumericCovTerm()
        setBasicCovTermFields(ccOptCovTerm, covTerm)
        ccOptCovTerm.ModelAggregation = covTerm.AggregationModel.Code
        ccOptCovTerm.ModelRestriction = covTerm.RestrictionModel.Code
        ccOptCovTerm.NumericValue = covTerm.Value
        ccOptCovTerm.Units = covTerm.Pattern.ValueType.Code
        ccCovTerms.add( ccOptCovTerm )
      }
    } else if ( covTerm typeis PackageCovTerm ) {

      for( packageTerm in covTerm.PackageValue.PackageTerms ) {
        if (isMoneyTerm(covTerm)) {
          var ccPackCovTerm = new CCFinancialCovTerm()
          setBasicCovTermFields(ccPackCovTerm, covTerm)
          ccPackCovTerm.PolicySystemID = getCovTermTypeIDString(covTerm) + "." + packageTerm.Code
          ccPackCovTerm.ModelAggregation = packageTerm.AggregationModel.Code
          ccPackCovTerm.ModelRestriction = packageTerm.RestrictionModel.Code
          ccPackCovTerm.setFinancialAmount(packageTerm.Value, covTerm.Clause.Currency)
          ccCovTerms.add( ccPackCovTerm )
        } else {
          var ccPackCovTerm = new CCNumericCovTerm()
          setBasicCovTermFields(ccPackCovTerm, covTerm)
          ccPackCovTerm.PolicySystemID = getCovTermTypeIDString(covTerm) + "." + packageTerm.Code
          ccPackCovTerm.ModelAggregation = packageTerm.AggregationModel.Code
          ccPackCovTerm.ModelRestriction = packageTerm.RestrictionModel.Code
          ccPackCovTerm.NumericValue = packageTerm.Value
          ccPackCovTerm.Units = packageTerm.ValueType.Code
          ccCovTerms.add( ccPackCovTerm )
        }
      }

    } else if ( covTerm typeis DirectCovTerm )  {

      if (isMoneyTerm(covTerm)) {
        var ccDirCovTerm = new CCFinancialCovTerm()
        setBasicCovTermFields(ccDirCovTerm, covTerm)
        ccDirCovTerm.ModelAggregation = covTerm.AggregationModel.Code
        ccDirCovTerm.ModelRestriction = covTerm.RestrictionModel.Code
        ccDirCovTerm.setFinancialAmount(covTerm.Value, covTerm.Clause.Currency)
        ccCovTerms.add( ccDirCovTerm )
      } else {
        var ccDirCovTerm = new CCNumericCovTerm()
        setBasicCovTermFields(ccDirCovTerm, covTerm)
        ccDirCovTerm.ModelAggregation = covTerm.AggregationModel.Code
        ccDirCovTerm.ModelRestriction = covTerm.RestrictionModel.Code
        ccDirCovTerm.NumericValue = covTerm.Value
        ccDirCovTerm.Units = covTerm.Pattern.ValueType.Code
        ccCovTerms.add( ccDirCovTerm )
      }

    } else if ( covTerm typeis TypekeyCovTerm ) {

      var ccTKCovTerm = new CCClassificationCovTerm()
      setBasicCovTermFields(ccTKCovTerm, covTerm)
      ccTKCovTerm.Code = covTerm.Value.Code
      ccTKCovTerm.Description = covTerm.Value.Description
      ccCovTerms.add(ccTKCovTerm)

    } else if ( covTerm typeis StringCovTerm ) {

      var ccStrCovTerm = new CCClassificationCovTerm()
      setBasicCovTermFields(ccStrCovTerm, covTerm)
      ccStrCovTerm.Description = covTerm.Value
      ccCovTerms.add(ccStrCovTerm)

    } else if ( covTerm typeis DateTimeCovTerm ) {

      var ccDTCovTerm = new CCClassificationCovTerm()
      setBasicCovTermFields(ccDTCovTerm, covTerm)
      ccDTCovTerm.Description = covTerm.ValueAsString
      ccCovTerms.add(ccDTCovTerm)

    } else if ( covTerm typeis BooleanCovTerm ) {

      var ccBooleanCovTerm = new CCClassificationCovTerm()
      setBasicCovTermFields(ccBooleanCovTerm, covTerm)
      ccBooleanCovTerm.Description = covTerm.ValueAsString
      ccCovTerms.add(ccBooleanCovTerm)

    }

    return ccCovTerms as CCCovTerm[]
  }

  private function setBasicCovTermFields(ccTerm : CCCovTerm, pcTerm : CovTerm) {
    ccTerm.PolicySystemID = getCovTermTypeIDString(pcTerm)
    ccTerm.CovTermOrder = pcTerm.Pattern.Priority
    ccTerm.CovTermPattern = ProductModelTypelistGenerator.trimTypeCode(pcTerm.Pattern.Code)
  }

  // This function can be used to handle special case mappings for certain kinds of PC Cov Terms.  These will be very
  // line and coverage specific, so the base class does not do anything.  The function should be extended by subclasses
  // in order add handling for any special cases.
  // Note that for PC package cov terms, this method will be called once for each CC CovTerm created, which may be more
  // than once for the same PCCovTerm.
  protected function handleCovTermSpecialCases(pcCov : Coverage, pcCovTerm : CovTerm, ccCov : CCCoverage, ccCovTerms : CCCovTerm[]) {
  }

  // By default, the base policy line mapper will not exclude anything.  This function should be overridden in sub-classes
  // in order to add exclusions that are specific to the policy line.
  protected function initializeExclusions() {
  }

  // Returns true if the Coverage should be excluded from what is sent to CC
  protected function isCoverageExcluded(cov : Coverage) : Boolean {
    return _excludedCoverages.contains(cov.PatternCode)
  }

  // Returns true if the CovTerm should be excluded from what is sent to CC
  protected function isCovTermExcluded(covTerm : CovTerm) : Boolean {
    return _excludedCovTerms.contains(covTerm.PatternCode)
  }

  // In most cases, we expect that the coverage codes used by the policy system and the claims system will be the same.
  // By default, this is the assumption made by the base class.  Unfortunately, this may not always be true.  In case
  // it is not, this method can be overridden by subclasses to define mappings from the coverage code in PC to the
  // equivalent code in CC.
  protected function mapToCCCoverageCode(cov : Coverage) : String {
    return ProductModelTypelistGenerator.trimTypeCode(cov.PatternCode);
  }

  protected function addCustomFinancialCovTerm(ccCov : CCCoverage, parentSystemID : String, patternCode : String, order : Integer,
                                             value : MonetaryAmount) {
    var covTerm = new CCFinancialCovTerm();
    ccCov.addToCovTerms(covTerm);
    covTerm.PolicySystemID = parentSystemID + "." + patternCode
    covTerm.CovTermPattern = patternCode;
    covTerm.CovTermOrder = order;
    covTerm.setFinancialAmount(value);
  }

  protected function addCustomNumericCovTerm(ccCov : CCCoverage, parentSystemID : String, patternCode : String, order : Integer,
                                             value : BigDecimal, units : String) {
    var covTerm = new CCNumericCovTerm();
    ccCov.addToCovTerms(covTerm);
    covTerm.PolicySystemID = parentSystemID + "." + patternCode
    covTerm.CovTermPattern = patternCode;
    covTerm.CovTermOrder = order;
    covTerm.NumericValue = value;
    covTerm.Units = units;
  }

  protected function addCustomClassificationCovTerm(ccCov : CCCoverage, parentSystemID : String, patternCode : String, order : Integer,
                                             code : String, desc : String) {
    var covTerm = new CCClassificationCovTerm();
    ccCov.addToCovTerms(covTerm);
    covTerm.PolicySystemID = parentSystemID + "." + patternCode
    covTerm.CovTermPattern = patternCode;
    covTerm.CovTermOrder = order;
    covTerm.Code = code;
    covTerm.Description = desc;
  }

  // Decides whether a covTerm's value represents money.  Note: this function assumes that for a covterm of a type
  // that could represent money, a null ValueType is assumed to mean money.  A Date, Boolean, or String cov term is
  // assumed not to represent money.
  protected function isMoneyTerm(covTerm : CovTerm) : boolean {
    if (covTerm typeis DirectCovTerm) {
      if (covTerm.ValueType == CovTermModelVal.TC_MONEY) { return true; }
    } else if (covTerm typeis OptionCovTerm) {
      if (covTerm.Pattern.ValueType == CovTermModelVal.TC_MONEY) { return true; }
    } else if (covTerm typeis PackageCovTerm) {
      if (covTerm.PackageValue.PackageTerms[0].ValueType == CovTermModelVal.TC_MONEY) { return true; }
    }

    return false;
  }

  // Adds to the properties count for the policy, based on the number of new properties added for a single line
  protected function addToPropertiesCount(newProperties : Integer) {
    if (_ccPolicy.TotalProperties == null) {
      _ccPolicy.TotalProperties = newProperties;
    } else {
      _ccPolicy.TotalProperties = _ccPolicy.TotalProperties + newProperties;
    }
  }

  protected function mapCoinsurance(pcStringValue : String) : BigDecimal {
    // Get the coinsurance value (e.g. "80") and convert it to a numeric value (e.g. 80).
    // Note that it is sending "80" and not "0.80", assuming that this is understood to mean 80%.
    return new BigDecimal(pcStringValue);
  }

  // This maps codes from either the ValuationMethod (BOP) or CPValuationMethod (CP) typelists to
  // codes in CC.  Not all PC codes match codes in CC.  This method will return null if there is no good match.
  protected function mapValuationMethod(pcValMethod : String) : String {
    switch (pcValMethod) {
      case "ActualCash":  // CP
      case "ACV":         // BOP
        return "ACV";
      case "ReplaceCost": // CP
      case "ReplCost":    // BOP
        return "Replacement";
      default:
        // By default, return null if it cannot be mapped to any corresponding CC value
        return null;
    }
  }

  // This function maps from the PC bodyType list to the CC vehicle Style list, for use by both Personal Auto and
  // Business Auto.
  protected function mapBodyType(bodyTypeCode : String) : String {
    switch (bodyTypeCode) {
      case "convertible":
      case "coupe":
      case "fourdoor":
      case "twodoor":
      case "wagon":
      case "suv":
        return "passengercar";
      case "pickup":
        return "pickup";
      case "van":
      case "atv":
        return "ATV";
      case "bus":
        return "bus";
      case "motorcycle":
        return "motorcycle";
      case "rv":
        return "rv";
      case "snowmobile":
        return "snowmobile";
      case "tractor":
        return "tractor_only";
      case "trailer":
        return "trailer";
      case "truck":
        return "straight_truck";
      case "util-trailer":
      default:
        // By default, return "other" if there is no good mapping.
        return "other";
    }
  }

  // Creates a new CCVehicleOwner for a given vehicle, using a PC contact (from a vehicle-level additional interest)
  protected function addVehicleOwner(ccVehicle : CCVehicle, pcContact : Contact) {
    var ccAddInt = new CCVehicleOwner();
    ccVehicle.addToLienholders(ccAddInt);
    var ccContact = _contactGen.getOrCreateContact(pcContact);
    ccAddInt.Lienholder = ccContact;
    ccAddInt.OwnerType = "partial_owner";
  }

  // Creates a new CCPropertyOwner for a given location, using a PC contact (from a risk-level additional interest)
  protected function addLocationLevelAdditionalInterest(ccLocation : CCPolicyLocation, pcContact : Contact) {
    var ccContact = _contactGen.getOrCreateContact(pcContact);
    var ccPropContact = new CCPropertyOwner();
    ccPropContact.Lienholder = ccContact;
    ccPropContact.OwnerType = "partial_owner";  // Value in CC typelist
    ccLocation.addToLienholders(ccPropContact);
  }

  // Creates a new CCPropertyOwner for a given risk unit (must be a LocationBasedRiskUnit), using a PC contact
  protected function addRULevelAdditionalInterest(ccRiskUnit : CCLocationBasedRU, pcContact : Contact) {
    var ccContact = _contactGen.getOrCreateContact(pcContact);
    var ccPropContact = new CCPropertyOwner();
    ccPropContact.Lienholder = ccContact;
    ccPropContact.OwnerType = "partial_owner";  // Value in CC typelist
    ccRiskUnit.addToLienholders(ccPropContact);
    // Also add this to the array of lienholders for the location since the "Property" FK (to PolicyLocation) on PropertyOwner is required
    ccRiskUnit.PolicyLocation.addToLienholders(ccPropContact);
  }

  protected function meetsLocationFilteringCriteria(loc : PolicyLocation) : boolean {
    return (_policyGen.meetsPostalCodeFilteringCriteria(loc.PostalCode));
  }

  protected function trimRUDescription(desc : String) : String {
    if (desc.length <= 255) { return desc }

    return desc.substring(0,255)
  }
}
