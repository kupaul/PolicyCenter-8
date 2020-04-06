package gw.reinsurance.search

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.search.EntitySearchCriteria

@Export
class ProgramSearchCriteria extends EntitySearchCriteria<RIProgram> {
  
  var _effectivePeriod : EffectivePeriodSearchCriteria as EffectivePeriod
  var _name : String as Name
  var _coverageGroup : typekey.RICoverageGroupType as CoverageGroup
  var _status : typekey.ContractStatus as Status
  var _currency : typekey.Currency as Currency

  construct() {
    EffectivePeriod = new EffectivePeriodSearchCriteria()
  }
  
  override protected function doSearch() : IQueryBeanResult<RIProgram> {
    var q = new Query<RIProgram>(RIProgram)
    if (Name <> null) {
      q.startsWith("Name", Name, true)
    }
    if (CoverageGroup <> null) {
      q.subselect("ID", CompareIn, ProgramCoverageGroup, "Program").compare("GroupType", Equals, CoverageGroup)
    }
    if (Status <> null) {
      q.compare("Status", Relop.Equals, Status)
    }
    if (Currency <> null) {
      q.compare("Currency", Relop.Equals, Currency)
    }
    EffectivePeriod.addSearchCriteria(q)
    return q.select()
  }

  static function findProgramByCoverageGroup(coverageGroup : RICoverageGroupType) : IQueryBeanResult<RIProgram> {
    var q = new Query<RIProgram>(RIProgram)
    var c = q.join(ProgramCoverageGroup, "Program")
    c.compare("GroupType", Relop.Equals, coverageGroup)
    return q.select()
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }
}
