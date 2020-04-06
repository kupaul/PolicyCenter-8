package gw.webservice.pc.pc700.ccintegration

uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleRU
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCLocationBasedRU
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPCFilteringCriteria
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicy
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCEndorsement
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCAddress
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicyLocation
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCBuilding
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummary
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryProperty
uses gw.webservice.pc.pc700.ccintegration.lob.CCPAPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCWCPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCCPPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCGLPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCIMPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCBOPPolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.lob.CCBAPolicyLineMapper
uses java.util.ArrayList
uses java.util.Date
uses java.util.HashMap
uses java.util.Map

/**
 * Generates a CC policy object and related data from a PC PolicyPeriod.
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.CCPolicyGenerator instead")
class CCPolicyGenerator {
  // store objects here that might be accessed from various parts of the
  // PC policy object graph so we don't create duplicate copies
  private var _mappedPCObjects : Map<Key, Object>

  private var _contactGenerator : CCContactGenerator

  private var _policy : CCPolicy;    // the CC policy
  private var _statusDate: Date;     // Date on which the status of the policy should be considered (as of date or today normally)
  private var _filter : CCPCFilteringCriteria;   // Filter the amount of data returned by this generator
  private var _primaryLocation : PolicyLocation;  // Capture the primary location and use it as the default for any non-location-based risks

  private construct() {

  }

  public construct(statusDate : Date, filter : CCPCFilteringCriteria) {
    _statusDate = statusDate;

    if (filter == null) {
      _filter = new CCPCFilteringCriteria();   // Create an empty filter by default
    } else {
      _filter = filter;
    }

    _mappedPCObjects = new HashMap<Key, Object>()
    _contactGenerator = new CCContactGenerator()

  }

  /**
   * Creates the cc Policy and all related objects given the pc PolicyPeriod.
   */
  public function generatePolicy( pcPolicyPeriod : PolicyPeriod ) : CCPolicy {
    if( pcPolicyPeriod == null ) {
      return null
    }

    _policy = new CCPolicy()

    // Archive-safe fields to add to the CCPolicy

    _policy.EffectiveDate = pcPolicyPeriod.PeriodStart
    _policy.ExpirationDate = pcPolicyPeriod.PeriodEnd
    _policy.PolicyNumber = pcPolicyPeriod.PolicyNumber
    _policy.PolicyType = mapPolicyType(pcPolicyPeriod)
    _policy.Status = mapPolicyStatus(pcPolicyPeriod)
    _policy.ProducerCode = pcPolicyPeriod.ProducerCodeOfRecord.Code
    _policy.Account = pcPolicyPeriod.Policy.Account.AccountNumber
    _policy.CancellationDate = pcPolicyPeriod.CancellationDate
    _policy.OriginalEffectiveDate = pcPolicyPeriod.Policy.IssueDate
    _policy.PolicySystemPeriodID = pcPolicyPeriod.PeriodId.Value
    _policy.PolicySuffix = pcPolicyPeriod.TermNumber as String
    _policy.UnderwritingCo = pcPolicyPeriod.UWCompany.Code.Code
    _policy.Currency = pcPolicyPeriod.PreferredSettlementCurrency.Code

    // Adding these other fields may throw a PolicyTermInArchiveException on an archived policy, so
    // we'll be careful about them.
    if (!pcPolicyPeriod.Archived) {

      // Find and save the primary location, if any
      for (loc in pcPolicyPeriod.PolicyLocations) {
        if (loc.PrimaryLoc) { _primaryLocation = loc }
      }

      // Create all the policy-level contacts
      _policy.Agent = _contactGenerator.getOrCreateContact( pcPolicyPeriod.ProducerOfRecord.Contact )
      for( var policyContactRole in pcPolicyPeriod.PolicyContactRoles ) {
        switch(typeof policyContactRole) {
          case PolicyPriNamedInsured:
              _policy.Insured = _contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact)
              break
          case PolicyAddlNamedInsured:  // FALL THROUGH
          case PolicySecNamedInsured:
              _policy.addToCoveredParty(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
              break
          case PolicyOwnerOfficer:
            if (_policy.PolicyHolder == null) {
              _policy.PolicyHolder = _contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact)
            }
            break
          case PolicyAddlInsured:
            _policy.addToCoveredParty(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
            break
          case PolicyDriver:
            // This will pick up personal auto drivers only.  Comm auto drivers are not in the PolicyContactRole list and must be dealt
            // with in the LOB-specific mapping for comm auto.
            var driverContact = policyContactRole.AccountContactRole.AccountContact.Contact
            if (driverContact typeis Person) {  // This should always be a Person (not a Company), so this is just to be safe.
              if (meetsDriverFilteringCriteria(driverContact.LastName)) {
                _policy.addToCoveredParty(_contactGenerator.getOrCreateContact(driverContact))
              }
            }
            break
          case PolicyBillingContact:
            // Don't bother sending these to ClaimCenter
            break
          default:
            // the rest of the contacts don't map well to CC policy roles but should be sent to CC in case they are useful
            _policy.addToOther(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
        }
      }

      // Initialize risk unit counts
      _policy.TotalProperties = 0
      _policy.TotalVehicles = 0

      // Create all of the policy locations
      for( location in pcPolicyPeriod.PolicyLocations.sortBy(\ l -> l.LocationNum) )
      {
        if (meetsPostalCodeFilteringCriteria(location.PostalCode)) {
          getOrCreateCCLocation( location )
        }
      }

      // Create all of the policy forms
      for( form in pcPolicyPeriod.Forms.sortBy(\ f -> f.EndorsementNumber) )
      {
        var endorsement = new CCEndorsement()
        endorsement.PolicySystemID = form.TypeIDString
        endorsement.FormNumber = form.FormNumber
        endorsement.Description = form.FormDescription
        endorsement.EffectiveDate = form.EffectiveDate
        endorsement.ExpirationDate = form.ExpirationDate
        if( form.EndorsementNumber != null )
        {
          endorsement.Comments = displaykey.CCPolicySearchIntegration.Endorsement.Comment(form.EndorsementNumber)
        }
        _policy.addToEndorsements( endorsement )
      }

      // Map all of the line-level details for each policy line
      for (line in pcPolicyPeriod.Lines.sortBy(\ l -> l.Pattern.Priority)) {
        var lineMapper = getLineSpecificMapper(line);
        lineMapper.mapPolicyLine(_policy);
      }

      // Some of the filtering can cause some CCPolicyLocations to have no risks being returned to CC.  Rather than sending
      // back a long list of "empty" locations, we want to remove those locations from what is returned.
      for (loc in _policy.PolicyLocations)
      {
        if(isCCPolicyLocationUnused(loc)) {
          _policy.removeFromPolicyLocations(loc)
        }
      }
    } // done adding not archive-safe fields

    return _policy
  }

  /**
   * Creates the cc Policy Summary and all related objects given the pc PolicyPeriod.
   */
  public function generatePolicySummary( pcSummary : PolicyPeriodSummary, asOfDate : Date ) : CCPolicySummary {
    var summ = new CCPolicySummary();

    // Get the policy period object
    var pp = pcSummary.fetchPolicyPeriod().getSlice(asOfDate)

    // Set all of the basic fields
    summ.PolicyNumber = pcSummary.PolicyNumber
    summ.PolicyType = mapPolicyType(pp)
    summ.Status = mapPolicyStatus(pp)
    summ.EffectiveDate = pcSummary.PeriodStart
    summ.ExpirationDate = pcSummary.PeriodEnd
    summ.InsuredName = pp.Archived ? pcSummary.InsuredDisplayName : pp.PrimaryNamedInsured.DisplayName
    summ.ProducerCode = pcSummary.ProducerName
    summ.IsArchived = pcSummary.TermArchived

    if (!pcSummary.TermArchived) {
      var policyAddress = pp.PolicyAddress
      summ.Address = policyAddress.AddressLine1
      if (policyAddress.AddressLine2.HasContent) {
        summ.Address = summ.Address + ", " + policyAddress.AddressLine2
      }
      summ.City = policyAddress.City
      summ.State = policyAddress.State.Code
      summ.PostalCode = policyAddress.PostalCode

      // In order to get a list of vehicles or list of buildings, we need to delegate this to line-by-line mapping
      var vehicleList = new ArrayList<CCPolicySummaryVehicle>();
      var propertyList = new ArrayList<CCPolicySummaryProperty>();
      for (line in pp.Lines.sortBy(\ l -> l.Pattern.Priority)) {
        var lineMapper = getLineSpecificMapper(line);
        lineMapper.mapVehicleSummaries(vehicleList);
        lineMapper.mapPropertySummaries(propertyList);
      }
      summ.Vehicles = vehicleList.toTypedArray();
      summ.Properties = propertyList.toTypedArray();
    } else { //policy period in archive
      summ.Address = null
      summ.City = null
      summ.State = null
      summ.PostalCode = null
      summ.Vehicles = null
      summ.Properties = null
    }

    return summ;
  }

  // This function defines which subclass of CCBasePolicyLineMapper should be used for each type of policy line.
  // If you create a new type of policy line, then create a new subclass and add an entry for it here.
  private function getLineSpecificMapper(line : PolicyLine) : CCBasePolicyLineMapper {
    var mapper : CCBasePolicyLineMapper;
    switch (line.PatternCode) {
      case "BOPLine":
        mapper = new CCBOPPolicyLineMapper(line, this);
        break;
      case "BusinessAutoLine":
        mapper = new CCBAPolicyLineMapper(line, this);
        break;
      case "CPLine":
        mapper = new CCCPPolicyLineMapper(line, this);
        break;
      case "GLLine":
        mapper = new CCGLPolicyLineMapper(line, this);
        break;
      case "IMLine":
        mapper = new CCIMPolicyLineMapper(line, this);
        break;
      case "PersonalAutoLine":
        mapper = new CCPAPolicyLineMapper(line, this);
        break;
      case "WorkersCompLine":
        mapper = new CCWCPolicyLineMapper(line, this);
        break;
      // Add additional policy lines here
      default:
        gw.api.util.Logger.logWarning("CCPolicyGenerator: No line-specific mapping provided for policy line type: " + line.PatternCode);
        mapper = new CCBasePolicyLineMapper(line, this);
    }
    return mapper;
  }

  /**
   * Gets the location from the hashmap of already-translated cc objects, or
   * creates it and adds it to the policy if it doesn't exist yet.
   */
  function getOrCreateCCLocation( location : PolicyLocation ) : CCPolicyLocation {
    if( location == null )
    {
      return null
    }

    var ccLocation = _mappedPCObjects.get( location.ID ) as CCPolicyLocation
    if( ccLocation != null )
    {
      return ccLocation
    }
    ccLocation = new CCPolicyLocation()
    _mappedPCObjects.put( location.ID, ccLocation )

    var tmpAddress = new CCAddress()
    tmpAddress.AddressBookUID = location.AccountLocation.AddressBookUID
    tmpAddress.AddressLine1 = location.AddressLine1
    tmpAddress.AddressLine2 = location.AddressLine2
    tmpAddress.AddressLine3 = location.AddressLine3
    tmpAddress.City = location.City
    tmpAddress.Country = location.Country.Code
    tmpAddress.County = location.County
    tmpAddress.Description = location.Description
    tmpAddress.PostalCode = location.PostalCode
    tmpAddress.State = location.State.Code
    ccLocation.Address = _contactGenerator.findExistingAddressOrAddToList( tmpAddress )

    ccLocation.PolicySystemID = location.TypeIDString
    ccLocation.LocationNumber = location.LocationNum as String
    ccLocation.PrimaryLocation = location.PrimaryLoc

    for( var building in location.Buildings )
    {
      var ccBuilding = getOrCreateCCBuilding(building)
      ccLocation.addToBuildings( ccBuilding )
    }

    _policy.addToPolicyLocations( ccLocation )
    return ccLocation
  }

  function getOrCreateCCBuilding( pcBuilding : Building ) : CCBuilding {
    if( pcBuilding == null )
    {
      return null
    }
    var ccBuilding = _mappedPCObjects.get( pcBuilding.ID ) as CCBuilding
    if( ccBuilding != null )
    {
      return ccBuilding
    }
    ccBuilding = new CCBuilding()
    _mappedPCObjects.put( pcBuilding.ID, ccBuilding )

    ccBuilding.BuildingNumber = pcBuilding.BuildingNum as String
    ccBuilding.Notes = pcBuilding.Description
    ccBuilding.PolicySystemID = pcBuilding.TypeIDString

    return ccBuilding
  }

  public function getContactGenerator() : CCContactGenerator {
    return _contactGenerator;
  }

  public function getMappedPCObjects() : Map<Key, Object> {
    return _mappedPCObjects;
  }

  public function getFilteringCriteria() : CCPCFilteringCriteria {
    return _filter;
  }

  public function getPrimaryLocation() : PolicyLocation {
    return _primaryLocation
  }

  // True if the list is null or a matching value is found
  public function meetsPostalCodeFilteringCriteria(code : String) : boolean {
    if (_filter.PostalCodes==null) return true
    if (_filter.PostalCodes.IsEmpty) return false  // nothing in the list, so cannot match

    for (filterCode in _filter.PostalCodes) {
      if (filterCode.equalsIgnoreCase(code)) return true
    }
    return false  // no match found
  }

  // True if the list is null or a matching value is found
  public function meetsVINFilteringCriteria(vin : String) : boolean {
    if (_filter.VINS==null) return true
    if (_filter.VINS.IsEmpty) return false  // nothing in the list, so cannot match

    for (eachVIN in _filter.VINS) {
      if (eachVIN.equalsIgnoreCase(vin)) return true
    }
    return false  // no match found
  }

  // True if the list is null or a matching value is found
  public function meetsLicensePlateFilteringCriteria(plate : String) : boolean {
    if (_filter.LicensePlates==null) return true
    if (_filter.LicensePlates.IsEmpty) return false  // nothing in the list, so cannot match

    for (eachPlate in _filter.LicensePlates) {
      if (eachPlate.equalsIgnoreCase(plate)) return true
    }
    return false  // no match found
  }

  // True if the list of PolicySystemIDs is not null
  public function hasPolicySystemIDFilteringCriteria() : boolean {
    if (_filter.PolicySystemIDs==null) return false
    return true
  }

  // True if the list is null or a matching value is found
  public function meetsPolicySystemIDFilteringCriteria(id : String) : boolean {
    if (_filter.PolicySystemIDs==null) return true
    if (_filter.PolicySystemIDs.IsEmpty) return false  // nothing in the list, so cannot match

    for (filterID in _filter.PolicySystemIDs) {
      if (filterID.equalsIgnoreCase(id)) return true
    }
    return false  // no match found
  }

  // True if the list is null or the beginning of the last name matches ("starts with") one of the criteria strings
  public function meetsDriverFilteringCriteria(lastName : String) : boolean {
    if (_filter.DriverLastNames==null) return true
    if (_filter.DriverLastNames.IsEmpty) return false  // nothing in the list, so cannot match

    for (crit in _filter.DriverLastNames) {
      if (lastName.startsWithIgnoreCase(crit)) return true
    }
    return false  // no match found
  }

 /*
  * Checks whether a ccPolicyLocation is unused, which means that there are no risk units, buildings, lienholders, etc.
  * mapped to it.  Returns true if it is unused.
  */
  private function isCCPolicyLocationUnused(loc : CCPolicyLocation) : boolean {
    if (loc==null) return true

    if (loc.Buildings.HasElements) return false
    if (loc.HighValueItems.HasElements) return false
    if (loc.Lienholders.HasElements) return false

    // It is harder to check if the location is referred to by any risk units...
    for (ru in _policy.RiskUnits) {
      if (ru typeis CCVehicleRU && ru.VehicleLocation == loc) return false
      if (ru typeis CCLocationBasedRU && ru.PolicyLocation == loc) return false
    }

    // No usages found
    return true
  }

  // This function can be used to map from product codes in PC to policy type codes in CC.  The default assumption is
  // that these map 1:1, but if that is not true, then this method can be used to provide the mapping.
  private function mapPolicyType(pp : PolicyPeriod) : String {
    return ProductModelTypelistGenerator.trimTypeCode(pp.Policy.ProductCode)
  }

  // This function determines the typecode in CC that describes the status of the policy (e.g. inforce, expired, etc.)
  private function mapPolicyStatus(pp : PolicyPeriod) : String {
    if (pp.Archived) {
      return "archived";
    } else if (pp.Canceled and pp.CancellationDate <= _statusDate) {
      return "canceled";
    } else if (not pp.PolicyTerm.Bound) {
      return "pending_confirmation";
    } else if (pp.Policy.HasScheduledCancellation) {
      return "pending_cancellation";
    } else if (_statusDate < pp.PeriodStart or pp.PeriodEnd <= _statusDate) {
      return "expired";
    }
    return "inforce";
  }
}
