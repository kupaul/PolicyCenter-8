package gw.lob.im

uses java.util.ArrayList
uses java.util.Set
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.util.Collection
uses gw.plugin.diff.impl.IMDiffHelper
uses java.lang.Iterable
uses entity.windowed.IMCostVersionList
uses java.math.BigDecimal
uses gw.api.domain.LineSpecificBuilding
uses entity.windowed.IMBuildingVersionList
uses gw.api.policy.AbstractPolicyLineMethodsImpl
uses gw.rating.AbstractRatingEngine
uses gw.lob.im.rating.IMSysTableRatingEngine
uses java.util.Map

@Export
class IMPolicyLineMethods extends AbstractPolicyLineMethodsImpl {
  
  private var _line : entity.InlandMarineLine
  
  construct(line : entity.InlandMarineLine) {
    super(line)
    _line = line
  }
  
  override function onPrimaryLocationCreation(location : PolicyLocation) {
    _line.addToLineSpecificLocations(location.AccountLocation)
  }

  override property get CoveredStates() : Jurisdiction[] {
    return (_line.BaseState == null) ? {} : { _line.BaseState }
  }
  
  override property get AllCoverages() : Coverage[] {
    var coverages = new ArrayList<Coverage>()
    //Sign Coverage Part Coverages
    if (_line.IMSignPart != null) {
      coverages.addAll( _line.IMSignPart.IMSigns*.Coverages.toList() )
    }
    //Contractors Equipment Part Coverages
    if (_line.ContractorsEquipPart != null) {
      coverages.addAll( _line.ContractorsEquipPart.ContrEquipPartCovs.toList() )
      coverages.addAll( _line.ContractorsEquipPart.ContractorsEquipments*.Coverages.toList() )
    }
    //Accounts Receivable Part Coverages
    if( _line.IMAccountsRecPart != null ) {
      coverages.addAll( _line.IMAccountsRecPart.IMAccountsRecPartCovs.toList() )
      coverages.addAll( _line.IMAccountsRecPart.IMAccountsReceivables*.Coverages.toList() )
    }
    return coverages as Coverage[]
  }

  override property get AllExclusions() : Exclusion[] {
    var exclusions = new ArrayList<Exclusion>()

    //Contractors Equipment Part Exclusions
    if (_line.ContractorsEquipPart != null) {
      exclusions.addAll( _line.ContractorsEquipPart.ContrEquipPartExclusions.toList() )
    }

    //Accounts Receivable Part Exclusions
    if (_line.IMAccountsRecPart != null) {
      exclusions.addAll( _line.IMAccountsRecPart.IMAccountsRecPartExclusions.toList() )
    }    
    
    return exclusions as Exclusion[]
  }

  override property get AllConditions() : PolicyCondition[] {
    var conditions = new ArrayList<PolicyCondition>()

    //Contractors Equipment Part Conditions
    if (_line.ContractorsEquipPart != null) {
      conditions.addAll( _line.ContractorsEquipPart.ContrEquipPartConditions.toList() )
    }
    
    return conditions as PolicyCondition[]
  }

  override property get AllCoverables() : Coverable[] {
    var list = new ArrayList<Coverable>() 
    var imsignpart = _line.IMSignPart
    if (imsignpart != null) {
      list.addAll( imsignpart.IMSigns as Collection<Coverable> )
    }
    var contrEqPart = _line.ContractorsEquipPart
    if (_line.ContractorsEquipPart != null) {
      list.add( contrEqPart )
      list.addAll( contrEqPart.ContractorsEquipments as Collection<Coverable> )
    }
    var accountsRecPart = _line.IMAccountsRecPart
    if( accountsRecPart != null ) {
      list.add( accountsRecPart )
      list.addAll(accountsRecPart.IMAccountsReceivables as Collection<Coverable>)
    }
    return list.toTypedArray()
  }
  
  override property get AllModifiables() : Modifiable[] {
    return new Modifiable[0]
  }
  
  override property get SupportsRatingOverrides() : boolean {
    return true
  }

  override property get CostVLs() : Iterable<IMCostVersionList> {
    return _line.VersionList.IMCosts
  }
  
  override property get Transactions() : Set<Transaction> {
    return _line.IMTransactions.toSet()
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation<entity.InlandMarineLine> {
    return new IMLineValidation(validationContext, _line)
  }
  
  override function cloneAutoNumberSequences() {
    if (_line.IMSignPart != null) {
      _line.IMSignPart.cloneSignAutoNumberSequence()
    }
    if (_line.ContractorsEquipPart != null) {
      _line.ContractorsEquipPart.cloneContrEqAutoNumberSequence()
    }
    if (_line.IMAccountsRecPart != null) {
      _line.IMAccountsRecPart.cloneARAutoNumberSequence()
    }
     _line.IMLocations.each(\ location -> location.Location.cloneBuildingAutoNumberSequence())
  }
  
  override function resetAutoNumberSequences() {
    if (_line.IMSignPart != null) {
      _line.IMSignPart.resetSignAutoNumberSequence()
    }
    if (_line.ContractorsEquipPart != null) {
      _line.ContractorsEquipPart.resetContrEqAutoNumberSequence()
    }
    if (_line.IMAccountsRecPart != null) {
      _line.IMAccountsRecPart.resetARAutoNumberSequence()
    }
    _line.IMLocations.each(\ location -> location.Location.resetBuildingAutoNumberSequence())
  }
  
  override function bindAutoNumberSequences() {
    if (_line.IMSignPart != null) {
      _line.IMSignPart.bindSignAutoNumberSequence()
    }
    if (_line.ContractorsEquipPart != null) {
      _line.ContractorsEquipPart.bindContrEqAutoNumberSequence()
    }
    if (_line.IMAccountsRecPart != null) {
      _line.IMAccountsRecPart.bindARAutoNumberSequence()
    }
    _line.IMLocations.each(\ location -> location.Location.bindBuildingAutoNumberSequence())
  }

  override function renumberAutoNumberSequences() {
    var signPart = _line.IMSignPart
    if (signPart != null) {
      signPart.renumberNewIMSigns()
    }
    var equipPart = _line.ContractorsEquipPart
    if (equipPart != null) {
      equipPart.renumberNewIMContrEqs()
    }
    var recPart = _line.IMAccountsRecPart
    if (recPart != null) {
      recPart.renumberNewIMAccountsReceivables()
    }
    _line.IMLocations.where(\location -> not location.New).each(\ location -> location.Location.renumberBuildingAutoNumberSequence())
  }

  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    var currentOrFutureIMLocationsAtLocation = getCurrentOrFutureIMLocationsAtLocation(location).partition(\item -> getItemExistence(item, location))
    if(currentOrFutureIMLocationsAtLocation["current"].HasElements)
      return displaykey.InlandMarine.Location.CannotDelete.HasIMLocation(location)
    if(currentOrFutureIMLocationsAtLocation["future"].HasElements) {
      var futureDatesStr = currentOrFutureIMLocationsAtLocation["future"].map(\l -> l.EffectiveDate).order().join(", ")
      return displaykey.InlandMarine.Location.CannotDelete.HasFutureIMLocation(location, futureDatesStr)
    }
    return super.canSafelyDeleteLocation(location)
  }
  
  override function checkLocationInUse(location : PolicyLocation) : boolean {
    return getCurrentOrFutureIMLocationsAtLocation(location).HasElements or super.checkLocationInUse(location)
  }
  
  private function getCurrentOrFutureIMLocationsAtLocation(location : PolicyLocation) : List<IMLocation> {
    var allIMLocationsEver =  _line.VersionList.IMLocations.allVersionsFlat<IMLocation>()
    return allIMLocationsEver.where(\l -> l.Location.FixedId == location.FixedId and l.ExpirationDate > location.SliceDate)
  }

  /**
   * Compares the effective date of an {@link entity.EffDated} item with the slice date of a {@link entity.PolicyLocation} to determine
   * whether or not the item is in use in the current period or a future period
   * @param item - the {@link entity.EffDated} item that's being compared
   * @param location - the {@link entity.PolicyLocation} that's being compared
   * @return String - either "current" or "future"
   */
  function getItemExistence(item : EffDated, location : PolicyLocation) : String {
    return item.EffectiveDate <= location.SliceDate ? "current" : "future"
  }
  
  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : IMDiffHelper {
    return new IMDiffHelper(reason, this._line, policyLine as InlandMarineLine)
  }

  override function doGetTIVForCoverage(cov : Coverage) : BigDecimal {
    switch(cov.FixedId.Type) {
      //Inland Marine Line
      case IMAccountsRecCov.Type:
        return getIMAccountsRecCovLimit(cov as IMAccountsRecCov)
      case entity.IMSignCov.Type:
        return getIMSignCovLimit(cov as entity.IMSignCov)
      case ContractorsEquipCov.Type:
        return getIMContractorsEquipCovLimit(cov as ContractorsEquipCov)
      case ContrEquipPartCov.Type:
        return getIMContractorsEquipPartCovLimit(cov as ContrEquipPartCov)
      case IMAccountsRecPartCov.Type:
        break
    }
    return BigDecimal.ZERO
  }
  
  override property get ContainsBuildings() : boolean {
    return true
  }
  
  override function getAllLineBuildingsEver() : List<LineSpecificBuilding> {
    return _line.VersionList.IMLocations.arrays<IMBuildingVersionList>("Buildings").allVersionsFlat<IMBuilding>()
  }

  override protected function getCannotDeleteBuildingMessage(building : Building) : String {
    return displaykey.InlandMarine.Building.CannotDelete.HasIMBuilding(building)
  }

  override protected function getCannotDeleteBuildingFutureMessage(building : Building, dates : String) : String {
    return displaykey.InlandMarine.Building.CannotDelete.HasFutureIMBuilding(building, dates)
  }

  override property get SupportsNonSpecificLocations() : boolean {
    return true
  }

  private function getIMContractorsEquipPartCovLimit(cov : ContrEquipPartCov) : BigDecimal {
    switch(cov.PatternCode) {
      case "ContractorsEquipEmployeesTools":
        return cov.ContractorsEquipPart.ContractorsEquipEmployeesTools.ContractorsEquipEmployeesToolsLimitTerm.Value
      case "ContractorsEquipMiscUnscheduledCov":
        return cov.ContractorsEquipPart.ContractorsEquipMiscUnscheduledCov.ContractorsEquipMiscUnscheduledLimitTerm.Value
      case "ContractorsEquipRentedEquipment":
        return cov.ContractorsEquipPart.ContractorsEquipRentedEquipment.ContractorsEquipRentedEquipmentLimitTerm.Value
      default:
        return 0 
    }    
  }
  
  private function getIMContractorsEquipCovLimit(cov : ContractorsEquipCov) : BigDecimal {
    switch(cov.PatternCode) {
      case "ContractorsEquipSchedCov":
        return cov.ContractorsEquipment.ContractorsEquipSchedCov.ContractorsEquipSchedCovLimitTerm.Value
      default:
        return 0 
    }    
  }

  private function getIMSignCovLimit(cov : entity.IMSignCov) : BigDecimal {
    switch(cov.PatternCode) {
      case "IMSignCov":
        return cov.IMSign.IMSignCov.IMSignLimitTerm.Value
      default:
        return 0 
    }    
  }

  private function getIMAccountsRecCovLimit(cov: IMAccountsRecCov): BigDecimal {
    switch (cov.PatternCode) {
      case "IMAccountReceivableCov":
          return cov.IMAccountsReceivable.IMAccountReceivableCov.IMAccountsReceivableLimitTerm.Value
        default:
        return 0
    }
  }

  override function createRatingEngine(method : RateMethod, parameters : Map<RateEngineParameter, Object>) : AbstractRatingEngine<IMLine> {
    if (RateMethod.TC_SYSTABLE == method) {
      return new IMSysTableRatingEngine(_line as IMLine)
    }
    return null
  }

  override property get BaseStateRequired() : boolean {
    return false
  }
}
