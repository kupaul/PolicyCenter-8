package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date
uses java.math.BigDecimal
uses java.util.ArrayList

/**
 * Represents a ClaimCenter Policy
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPolicy
{
  var _account : String as Account
  var _cancellationDate : Date as CancellationDate
  var _effectiveDate : Date as EffectiveDate
  var _origEffectiveDate : Date as OriginalEffectiveDate
  var _expirationDate : Date as ExpirationDate
  var _financialInterests : String as FinancialInterests
  var _foreignCoverage : boolean as ForeignCoverage
  var _notes : String as Notes
  var _otherInsInfo : String as OtherInsuranceInfo
  var _otherInsurance : boolean as OtherInsurance
  var _policyNumber : String as PolicyNumber
  var _policySystemPeriodID : long as PolicySystemPeriodID
  var _policySuffix : String as PolicySuffix
  var _producerCode : String as ProducerCode
  var _totalVehicles : int as TotalVehicles
  var _totalProperties : int as TotalProperties

  var _classCodes = new ArrayList<CCClassCode>()
  var _coverages = new ArrayList<CCPolicyCoverage>()
  var _endorsements = new ArrayList<CCEndorsement>()
  var _statCodes = new ArrayList<CCStatCode>()
  var _riskUnits = new ArrayList<CCRiskUnit>()
  var _policyLocations = new ArrayList<CCPolicyLocation>()

  // virtual settable contact properties
  var _insured : CCContact as Insured
  var _agent : CCContact as Agent
  var _doingBusinessAs : CCCompany as DoingBusinessAs
  var _policyHolder : CCContact as PolicyHolder
  var _underwriter : CCPerson as Underwriter

  // virtual contact arrays
  var _altcontact = new ArrayList<CCPerson>()
  var _coveredParty = new ArrayList<CCContact>()
  var _excludedParty = new ArrayList<CCContact>()
  var _formerAgent = new ArrayList<CCContact>()
  var _formerCoveredParty = new ArrayList<CCContact>()
  var _formerDoingBusinessAs = new ArrayList<CCContact>()
  var _formerExcludedParty = new ArrayList<CCContact>()
  var _formerInsured = new ArrayList<CCContact>()
  var _formerPolicyHolder = new ArrayList<CCContact>()
  var _formerUnderwriter = new ArrayList<CCContact>()
  var _insuredRep = new ArrayList<CCContact>()
  var _mainContact = new ArrayList<CCContact>()
  var _other = new ArrayList<CCContact>()
  var _wcCarrier = new ArrayList<CCContact>()

  // typecodes in CC
  var _coverageForm : String as CoverageForm
  var _currency : String as Currency
  var _policyRatingPlan : String as PolicyRatingPlan
  var _policySource : String as PolicySource
  var _policyType : String as PolicyType
  var _status : String as Status
  var _underwritingCo : String as UnderwritingCo
  var _underwritingGroup : String as UnderwritingGroup

  // workers' comp
  var _insuredSICCode : String as InsuredSICCode
  var _returnToWorkPrgm : boolean as ReturnToWorkPrgm
  var _wcOtherStates : String as WCOtherStates
  var _wcStates : String as WCStates

  // commercial
  var _participation : BigDecimal as Participation
  var _reportingDate : Date as ReportingDate
  var _retroactiveDate : Date as RetroactiveDate

  construct()
  {
  }

  // ----------------------------------------------------- Property Accessors

  property get Coverages() : CCPolicyCoverage[]
  {
    return _coverages as CCPolicyCoverage[]
  }

  function addToCoverages(coverage : CCPolicyCoverage) : void
  {
    _coverages.add(coverage)
  }

  property get WCCarrier() : CCContact[]
  {
    return _wcCarrier as CCContact[]
  }

  function addToWCCarrier(aWCCarrier : CCContact) : void
  {
    _wcCarrier.add(aWCCarrier)
  }

  property get Other() : CCContact[]
  {
    return _other as CCContact[]
  }

  function addToOther(another : CCContact) : void
  {
    _other.add(another)
  }

  property get MainContact() : CCContact[]
  {
    return _mainContact as CCContact[]
  }

  function addToMainContact(aMainContact : CCContact) : void
  {
    _mainContact.add(aMainContact)
  }

  property get FormerUnderwriter() : CCContact[]
  {
    return _formerUnderwriter as CCContact[]
  }

  function addToFormerUnderwriter(aFormerUnderwriter : CCContact) : void
  {
    _formerUnderwriter.add(aFormerUnderwriter)
  }

  property get InsuredRep() : CCContact[]
  {
    return _insuredRep as CCContact[]
  }

  function addToInsuredRep(anInsuredRep : CCContact) : void
  {
    _insuredRep.add(anInsuredRep)
  }

  property get FormerPolicyHolder() : CCContact[]
  {
    return _formerPolicyHolder as CCContact[]
  }

  function addToFormerPolicyHolder(aFormerPolicyHolder : CCContact) : void
  {
    _formerPolicyHolder.add(aFormerPolicyHolder)
  }

  property get FormerInsured() : CCContact[]
  {
    return _formerInsured as CCContact[]
  }

  function addToFormerInsured(aFormerInsured : CCContact) : void
  {
    _formerInsured.add(aFormerInsured)
  }

  property get FormerExcludedParty() : CCContact[]
  {
    return _formerExcludedParty as CCContact[]
  }

  function addToFormerExcludedParty(aFormerExcludedParty : CCContact) : void
  {
    _formerExcludedParty.add(aFormerExcludedParty)
  }

  property get FormerDoingBusinessAs() : CCContact[]
  {
    return _formerDoingBusinessAs as CCContact[]
  }

  function addToFormerDoingBusinessAs(aFormerDoingBusinessAs : CCContact) : void
  {
    _formerDoingBusinessAs.add(aFormerDoingBusinessAs)
  }

  property get FormerCoveredParty() : CCContact[]
  {
    return _formerCoveredParty as CCContact[]
  }

  function addToFormerCoveredParty(aFormerCoveredParty : CCContact) : void
  {
    _formerCoveredParty.add(aFormerCoveredParty)
  }

  property get FormerAgent() : CCContact[]
  {
    return _formerAgent as CCContact[]
  }

  function addToFormerAgent(aFormerAgent : CCContact) : void
  {
    _formerAgent.add(aFormerAgent)
  }

  property get ExcludedParty() : CCContact[]
  {
    return _excludedParty as CCContact[]
  }

  function addToExcludedParty(anExcludedParty : CCContact) : void
  {
    _excludedParty.add(anExcludedParty)
  }

  property get CoveredParty() : CCContact[]
  {
    return _coveredParty as CCContact[]
  }

  function addToCoveredParty(aCoveredParty : CCContact) : void
  {
    _coveredParty.add(aCoveredParty)
  }

  property get AltContact() : CCPerson[]
  {
    return _altcontact as CCPerson[]
  }

  function addToAltContact(anAltcontact : CCPerson) : void
  {
    _altcontact.add(anAltcontact)
  }

  property get PolicyLocations() : CCPolicyLocation[]
  {
    return _policyLocations as CCPolicyLocation[]
  }

  function addToPolicyLocations(policyLocation : CCPolicyLocation) : void
  {
    _policyLocations.add(policyLocation)
  }

  function removeFromPolicyLocations(policyLocation : CCPolicyLocation) : void
  {
    _policyLocations.remove(policyLocation)
  }

  property get RiskUnits() : CCRiskUnit[]
  {
    return _riskUnits as CCRiskUnit[]
  }

  function addToRiskUnits(riskUnit : CCRiskUnit) : void
  {
    _riskUnits.add(riskUnit)
  }

  property get StatCodes() : CCStatCode[]
  {
    return _statCodes as CCStatCode[]
  }

  function addToStatCodes(statCode : CCStatCode) : void
  {
    _statCodes.add(statCode)
  }

  property get Endorsements() : CCEndorsement[]
  {
    return _endorsements as CCEndorsement[]
  }

  function addToEndorsements(endorsement : CCEndorsement) : void
  {
    _endorsements.add(endorsement)
  }

  property get ClassCodes() : CCClassCode[]
  {
    return _classCodes as CCClassCode[]
  }

  function addToClassCodes(classCode : CCClassCode) : void
  {
    _classCodes.add(classCode)
  }
}
