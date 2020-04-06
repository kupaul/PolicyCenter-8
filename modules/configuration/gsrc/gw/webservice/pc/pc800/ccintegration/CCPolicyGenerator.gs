package gw.webservice.pc.pc800.ccintegration

uses gw.api.system.PCLoggerCategory
uses gw.webservice.pc.pc800.ccintegration.entities.Envelope
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCPolicySummary_Properties
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCPolicySummary_Vehicles
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCPolicy_Endorsements
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCAddress
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCBuilding
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCClassCode
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCContact
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCPolicy
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCPolicyLocation
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCPropertyOwner
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCAddress
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCBuilding
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCClassCode
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCContact
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCEndorsement
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCLocationBasedRU
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPCFilteringCriteria
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicy
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicyLocation
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicySummary
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicySummaryProperty
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicySummaryVehicle
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPropertyOwner
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCVehicleRU
uses gw.webservice.pc.pc800.ccintegration.lob.CCBAPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCBOPPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCCPPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCGLPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCIMPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCPAPolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.lob.CCWCPolicyLineMapper
uses gw.xml.XmlElement

uses java.net.URL
uses java.util.ArrayList
uses java.util.Date
uses java.util.HashMap
uses java.util.Map

/**
 * Generates a CC policy object and related data from a PC PolicyPeriod.
 */
@Export
class CCPolicyGenerator {
  // store objects here that might be accessed from various parts of the
  // PC policy object graph so we don't create duplicate copies
  private var _mappedPCObjects : Map<Key, XmlElement>

  private var _contactGenerator : CCContactGenerator
  private var _policy : CCPolicy    // the CC policy
  private var _env : Envelope
  private var _statusDate: Date  // Date on which the status of the policy should be considered (as of date or today normally)
  private var _filter : CCPCFilteringCriteria   // Filter the amount of data returned by this generator
  private var _primaryLocation : PolicyLocation  // Capture the primary location and use it as the default for any non-location-based risks

  private construct() {
  }

  public construct(statusDate : Date, filter : CCPCFilteringCriteria) {
    _statusDate = statusDate;

    if (filter == null) {
      _filter = new CCPCFilteringCriteria();   // Create an empty filter by default
    } else {
      _filter = filter;
    }
    _mappedPCObjects = new HashMap<Key, XmlElement>()
    _contactGenerator = new CCContactGenerator(this)
  }

  /**
   * Creates the cc Policy and all related objects given the pc PolicyPeriod.
   */
  public function generatePolicy( pcPolicyPeriod : PolicyPeriod ) : Envelope {
    if( pcPolicyPeriod == null ) {
      return null
    }

    _env = new Envelope()
    _env.declareNamespace(new URL("http://www.w3.org/2001/XMLSchema-instance").toURI(), "xsi")
    _policy = new CCPolicy()
    _env.CCPolicy = new(_policy)

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
    _policy.CustomerServiceTier = pcPolicyPeriod.Policy.Account.ServiceTier.Code

    // Adding these other fields may throw a PolicyTermInArchiveException on an archived policy, so
    // we'll be careful about them.
    if (!pcPolicyPeriod.Archived) {

      // Find and save the primary location, if any
      for (loc in pcPolicyPeriod.PolicyLocations) {
        if (loc.PrimaryLoc) {
          _primaryLocation = loc
        }
      }

      // Create all the policy-level contacts
      if (pcPolicyPeriod.ProducerOfRecord.Contact != null) {
        _policy.Agent = _contactGenerator.getOrCreateContact( pcPolicyPeriod.ProducerOfRecord.Contact )
      }
      for( var policyContactRole in pcPolicyPeriod.PolicyContactRoles ) {
        if (policyContactRole.AccountContactRole.AccountContact.Contact != null) {
          switch(typeof policyContactRole) {
            case PolicyPriNamedInsured:
                _policy.Insured = _contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact)
                break
            case PolicyAddlNamedInsured:  // FALL THROUGH
            case PolicySecNamedInsured:
                _policy.CoveredParty.add(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
                break
            case PolicyOwnerOfficer:
              if (_policy.PolicyHolder == null) {
                _policy.PolicyHolder = _contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact)
              }
              break
            case PolicyAddlInsured:
              _policy.CoveredParty.add(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
              break
            case PolicyDriver:
              // This will pick up personal auto drivers only.  Comm auto drivers are not in the PolicyContactRole list and must be dealt
              // with in the LOB-specific mapping for comm auto.
              var driverContact = policyContactRole.AccountContactRole.AccountContact.Contact
              if (driverContact typeis Person) {  // This should always be a Person (not a Company), so this is just to be safe.
                if (meetsDriverFilteringCriteria(driverContact.LastName)) {
                  _policy.CoveredParty.add(_contactGenerator.getOrCreateContact(driverContact))
                }
              }
              break
            case PolicyBillingContact:
              // Don't bother sending these to ClaimCenter
              break
            default:
              // the rest of the contacts don't map well to CC policy roles but should be sent to CC in case they are useful
              _policy.Other.add(_contactGenerator.getOrCreateContact(policyContactRole.AccountContactRole.AccountContact.Contact))
          }
        }
      }

      // Initialize risk unit counts
      _policy.TotalProperties = 0
      _policy.TotalVehicles = 0

      // Create all of the policy locations
      for( location in pcPolicyPeriod.PolicyLocations.sortBy(\ l -> l.LocationNum) ) {
        if (meetsPostalCodeFilteringCriteria(location.PostalCode)) {
          getOrCreateCCLocation( location )
        }
      }

      // Create all of the policy forms
      for( form in pcPolicyPeriod.Forms.sortBy(\ f -> f.EndorsementNumber) ) {
        var endorsement = new CCEndorsement()
        endorsement.PolicySystemID = form.TypeIDString
        endorsement.FormNumber = form.FormNumber
        endorsement.Description = form.FormDescription
        endorsement.EffectiveDate = form.EffectiveDate
        endorsement.ExpirationDate = form.ExpirationDate
        if( form.EndorsementNumber != null ) {
          endorsement.Comments = displaykey.CCPolicySearchIntegration.Endorsement.Comment(form.EndorsementNumber)
        }
        _policy.Endorsements.add(new CCPolicy_Endorsements( endorsement ))
      }

      // Map all of the line-level details for each policy line
      for (line in pcPolicyPeriod.Lines.sortBy(\ l -> l.Pattern.Priority)) {
        var lineMapper = getLineSpecificMapper(line);
        lineMapper.mapPolicyLine(_policy);
      }

      // Some of the filtering can cause some CCPolicyLocations to have no risks being returned to CC.  Rather than sending
      // back a long list of "empty" locations, we want to remove those locations from what is returned.
      var itr = _policy.PolicyLocations.iterator()
      while (itr.hasNext()) {
        var loc = itr.next()
        if (loc.TypeInstance typeis CCPolicyLocation && isCCPolicyLocationUnused(loc.TypeInstance)) {
          itr.remove()
          _env.CCPolicyLocation.remove(loc as Envelope_CCPolicyLocation)
        }
      }
    } // done adding not archive-safe fields

    return _env
  }

  /**
   * Creates the cc Policy Summary and all related objects given the pc PolicyPeriod.
   */
  public function generatePolicySummary( pcSummary : PolicyPeriodSummary, asOfDate : Date ) : CCPolicySummary {
    var ccSummary = new CCPolicySummary()
    configureSummary(ccSummary, pcSummary, asOfDate)
    return ccSummary
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
        PCLoggerCategory.INTEGRATION.warn("CCPolicyGenerator: No line-specific mapping provided for policy line type: " + line.PatternCode);
        mapper = new CCBasePolicyLineMapper(line, this);
    }
    return mapper;
  }

  /**
   * Gets the location from the hashmap of already-translated cc objects, or
   * creates it and adds it to the policy if it doesn't exist yet.
   */
  function getOrCreateCCLocation( location : PolicyLocation ) : XmlElement {
    var el = _mappedPCObjects.get( location.ID )
    if( el != null ) {
      return el
    }
    var ccLocation = new CCPolicyLocation()
    el = addPolicyLocation(location.ID, ccLocation)

    var tmpAddress = new CCAddress()
    tmpAddress.configure(location)
    tmpAddress.AddressBookUID = location.AccountLocation.AddressBookUID

    //temporary key for CCAddress
    var tmpKey = new Key(PolicyLocation, -location.ID.Value)

    ccLocation.Address = _contactGenerator.findExistingAddressOrAddToList(tmpKey, tmpAddress)

    ccLocation.PolicySystemID = location.TypeIDString
    ccLocation.LocationNumber = location.LocationNum as String
    ccLocation.PrimaryLocation = location.PrimaryLoc
    ccLocation.Description = location.AccountLocation.LocationName

    for( var building in location.Buildings ) {
      ccLocation.Buildings.add(getOrCreateCCBuilding(building))
    }
    _policy.PolicyLocations.add(el)
    return el
  }

  public function addAddress(key : Key, ccAddress: CCAddress) : XmlElement {
    ccAddress.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCAddress(ccAddress)
    _env.CCAddress.add( el )
    if (key != null) {
      _mappedPCObjects.put( key, el )
    }
    return el
  }

  public function addBuilding(id : Key, ti : CCBuilding) : XmlElement {
    ti.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCBuilding(ti)
    _env.CCBuilding.add( el )
    if (id != null) {
      _mappedPCObjects.put( id, el )
    }
    return el
  }

  public function addClassCode(id : Key, ti : CCClassCode) : XmlElement {
    ti.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCClassCode(ti)
    _env.CCClassCode.add( el )
    if (id != null) {
      _mappedPCObjects.put( id, el )
    }
    return el
  }

  public function addContact(id : Key, ccContact : CCContact) : XmlElement {
    ccContact.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCContact(ccContact)
    _env.CCContact.add( el )
    if (id != null) {
      _mappedPCObjects.put( id, el )
    }
    return el
  }

  public function addPolicyLocation(id : Key, ti : CCPolicyLocation) : XmlElement {
    ti.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCPolicyLocation(ti)
    _env.CCPolicyLocation.add( el )
    _mappedPCObjects.put( id, el )
    return el
  }

  public function addPropertyOwner(id : Key, ti : CCPropertyOwner) : XmlElement {
    ti.ID = "_" + _mappedPCObjects.Count;
    var el = new Envelope_CCPropertyOwner(ti)
    _env.CCPropertyOwner.add( el )
    _mappedPCObjects.put( id, el )
    return el
  }


  function getOrCreateCCBuilding( pcBuilding : Building ) : XmlElement {
    var el = _mappedPCObjects.get( pcBuilding.ID )
    if( el != null ) {
      return el
    }
    var ccBuilding = new CCBuilding()
    el = addBuilding( pcBuilding.ID, ccBuilding )
    ccBuilding.BuildingNumber = pcBuilding.BuildingNum as String
    ccBuilding.Notes = pcBuilding.Description
    ccBuilding.PolicySystemID = pcBuilding.TypeIDString
    return el
  }

  public function getContactGenerator() : CCContactGenerator {
    return _contactGenerator;
  }

  public function getMappedPCObjects() : Map<Key, XmlElement> {
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
    if (_filter.PostalCodes.Entry.Empty) return false  // nothing in the list, so cannot match

    for (filterCode in _filter.PostalCodes.Entry) {
      if (filterCode.equalsIgnoreCase(code)) return true
    }
    return false  // no match found
  }

  // True if the list is null or a matching value is found
  public function meetsVINFilteringCriteria(vin : String) : boolean {
    if (_filter.VINS==null) return true
    if (_filter.VINS.Entry.Empty) return false  // nothing in the list, so cannot match

    for (eachVIN in _filter.VINS.Entry) {
      if (eachVIN.equalsIgnoreCase(vin)) return true
    }
    return false  // no match found
  }

  // True if the list is null or a matching value is found
  public function meetsLicensePlateFilteringCriteria(plate : String) : boolean {
    if (_filter.LicensePlates==null) return true
    if (_filter.LicensePlates.Entry.Empty) return false  // nothing in the list, so cannot match

    for (eachPlate in _filter.LicensePlates.Entry) {
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
    if (_filter.PolicySystemIDs.Entry.Empty) return false  // nothing in the list, so cannot match

    for (filterID in _filter.PolicySystemIDs.Entry) {
      if (filterID.equalsIgnoreCase(id)) return true
    }
//    print("does not meetsPolicySystemIDFilteringCriteria(id=" + id)
    return false  // no match found
  }

  // True if the list is null or the beginning of the last name matches ("starts with") one of the criteria strings
  public function meetsDriverFilteringCriteria(lastName : String) : boolean {
    var result = false // will be false if no match is found

    if (_filter.DriverLastNames == null) {
      result = true
    }
    if (_filter.DriverLastNames.Entry.Empty) { // nothing in the list, so cannot match
      result = false
    }

    for (filteringCriteria in _filter.DriverLastNames.Entry) {
      if (lastName.startsWithIgnoreCase(filteringCriteria)) {
        result = true
      }
    }
    return result
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
      if (ru.$TypeInstance typeis CCVehicleRU && loc.ID.equals(ru.$TypeInstance.VehicleLocation.getAttributeValue("ID"))) return false
      if (ru.$TypeInstance typeis CCLocationBasedRU && loc.ID.equals(ru.$TypeInstance.PolicyLocation.getAttributeValue("ID"))) return false
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

  private function configurePolicySummaryAddressFields(ccSummary : CCPolicySummary, pcPolicyPeriod : PolicyPeriod) {
    var pcAddress = pcPolicyPeriod.PolicyAddress

    // CCPolicySummary.Address is deprecated as of 8.0.1. Use AddressLine1 and AddressLine2 instead.
    ccSummary.Address = pcAddress.AddressLine1
    if (pcAddress.AddressLine2.HasContent) {
      ccSummary.Address = ccSummary.Address + ", " + pcAddress.AddressLine2
    }
    ccSummary.AddressLine1 = pcAddress.AddressLine1
    ccSummary.AddressLine1Kanji = pcAddress.AddressLine1Kanji
    ccSummary.AddressLine2= pcAddress.AddressLine2
    ccSummary.AddressLine2Kanji = pcAddress.AddressLine2Kanji
    ccSummary.City = pcAddress.City
    ccSummary.CityKanji = pcAddress.CityKanji
    ccSummary.State = pcAddress.State.Code
    ccSummary.PostalCode = pcAddress.PostalCode
    ccSummary.CEDEX = pcAddress.CEDEX
    ccSummary.CEDEXBureau = pcAddress.CEDEXBureau
  }

  private function configureSummary(ccSummary : CCPolicySummary, pcSummary : PolicyPeriodSummary, asOfDate : Date) {
    var pcPolicyPeriod = pcSummary.fetchPolicyPeriod().getSlice(asOfDate)

    ccSummary.PolicyNumber = pcSummary.PolicyNumber
    ccSummary.PolicyType = mapPolicyType(pcPolicyPeriod)
    ccSummary.Status = mapPolicyStatus(pcPolicyPeriod)
    ccSummary.EffectiveDate = pcSummary.PeriodStart
    ccSummary.ExpirationDate = pcSummary.PeriodEnd
    ccSummary.InsuredName = pcPolicyPeriod.Archived ? pcSummary.InsuredDisplayName : pcPolicyPeriod.PrimaryNamedInsured.DisplayName
    ccSummary.ProducerCode = pcPolicyPeriod.ProducerCodeOfRecord.Code
    ccSummary.IsArchived = pcSummary.TermArchived

    if (!pcSummary.TermArchived) {

      configurePolicySummaryAddressFields(ccSummary, pcPolicyPeriod)

      // In order to get a list of vehicles or list of buildings, we need to delegate this to line-by-line mapping
      var vehicleList = new ArrayList<CCPolicySummaryVehicle>()
      var propertyList = new ArrayList<CCPolicySummaryProperty>()
      for (line in pcPolicyPeriod.Lines.sortBy(\ l -> l.Pattern.Priority)) {
        var lineMapper = getLineSpecificMapper(line)
        lineMapper.mapVehicleSummaries(vehicleList)
        lineMapper.mapPropertySummaries(propertyList)
      }
      for (vehicle in vehicleList) {
        ccSummary.Vehicles.add(new CCPolicySummary_Vehicles(vehicle))
      }
      for (ccProperty in propertyList) {
        ccSummary.Properties.add(new CCPolicySummary_Properties(ccProperty))
      }
    }
  }
}
