package gw.reinsurance.search

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.search.EntitySearchCriteria
uses gw.api.database.IQueryBeanResult

@Export
class AgreementSearchCriteria extends EntitySearchCriteria<RIAgreement> {
  // types of search
  var _searchAll : boolean as SearchAll = false
  var _number : String as AgreementNumber
  var _agreementType : typekey.RIAgreement as AgreementType
  var _name : String as AgreementName
  var _effectivePeriod : EffectivePeriodSearchCriteria as EffectivePeriod
  var _status : typekey.ContractStatus as Status
  var _arrangementType : typekey.ArrangementType as ArrangementType = TC_TREATY
  var _coverageGroup : typekey.RICoverageGroupType as CoverageGroup
  var _currency : typekey.Currency as Currency
  // below are criteria to filter out irrelevant agreements
  var _existings : RIAgreement[] as Existings
  protected var _availableSubtypes : typekey.RIAgreement[] // don't allow to change this
  
  /**
   * Should use the static methods
   */  
  public construct() {
    EffectivePeriod = new EffectivePeriodSearchCriteria()
  }
  
  public static function forFacultative(ririsk : RIRisk) : FacultativeSearchCriteria {
    return new FacultativeSearchCriteria(ririsk)
  }
  
  public static function forPerRisk(existingTreaties : RIAgreement[]) : AgreementSearchCriteria {
    var criteria = new AgreementSearchCriteria()
    criteria._availableSubtypes = {typekey.RIAgreement.TC_NETEXCESSOFLOSSRITREATY,
      typekey.RIAgreement.TC_QUOTASHARERITREATY, typekey.RIAgreement.TC_EXCESSOFLOSSRITREATY,
      typekey.RIAgreement.TC_SURPLUSRITREATY}
    criteria.Existings = existingTreaties
    return criteria
  }
  
  public static function forAggregate(existingTreaties : RIAgreement[]) : AgreementSearchCriteria{
    var criteria = new AgreementSearchCriteria()
    criteria._availableSubtypes = {typekey.RIAgreement.TC_PEREVENTRITREATY,
      typekey.RIAgreement.TC_ANNUALAGGREGATERITREATY}
    criteria.Existings = existingTreaties
    return criteria
  }
  
  public static function forAllAgreements() : AgreementSearchCriteria {
    var criteria = new AgreementSearchCriteria()
    criteria._searchAll = true
    criteria._availableSubtypes = typekey.RIAgreement.getTypeKeys(false)
      .where(\ r -> r <> typekey.RIAgreement.TC_RIAGREEMENT
        and r <> typekey.RIAgreement.TC_PROPORTIONALRIAGREEMENT
        and r <> typekey.RIAgreement.TC_NONPROPORTIONALRIAGREEMENT) // do not add abstract types
      .toTypedArray()
    return criteria
  }
  
  property get AvailableSubtypes() : typekey.RIAgreement[] {
    return _availableSubtypes
  }
  
  override protected function doSearch() : IQueryBeanResult<RIAgreement> {
    var query = makeQuery()
    
    return query.select()
  }
  
  protected function makeQuery() : Query<RIAgreement> {
    var query = new Query<RIAgreement>(RIAgreement)
    
    if (AgreementNumber != null) {
      query.compare("AgreementNumber", Relop.Equals, AgreementNumber)
    }

    if (AgreementName != null) {
      query.startsWith("Name", AgreementName, true)
    }
      
    if (EffectivePeriod <> null) {
      EffectivePeriod.addSearchCriteria(query)
    }

    var subtypes = AvailableSubtypes
    
    if (AgreementType <> null) {
      subtypes = {AgreementType}
    }
    
    if (ArrangementType <> null) {
      subtypes = subtypes.where(\ r -> r.hasCategory(ArrangementType))
    }
    
    query.compareIn("SubType", subtypes)
    
    if (CoverageGroup <> null) {
      query.subselect("ID", CompareIn, AgreementCoverageGroup, "Agreement").compare("GroupType", Equals, CoverageGroup)
    }
    
    if (Existings.HasElements) {
      query.compareNotIn("ID", Existings.map(\ r -> r.ID))
    }
    
    if (Status <> null) {
      query.compare("Status", Relop.Equals, Status)
    }

    if (Currency <> null) {
      query.compare("Currency", Relop.Equals, Currency)
    }

    return query
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}