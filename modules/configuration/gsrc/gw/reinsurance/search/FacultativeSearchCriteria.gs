package gw.reinsurance.search
uses java.util.Date
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.util.DateUtil

/**
 * Search for facultative to attach to ririsk.
 */
@Export
class FacultativeSearchCriteria extends AgreementSearchCriteria {
  protected var _ririsk : RIRisk
  var _effectiveOn : Date as EffectiveOn // for fac search only

  construct(ririsk : RIRisk) {
    EffectivePeriod = null
    EffectiveOn = ririsk.EffectiveDate
    _ririsk = ririsk
    _availableSubtypes = typekey.RIAgreement.getTypeKeys(false)
      .where(\ r -> r.hasCategory(typekey.ArrangementType.TC_FACULTATIVE)).toTypedArray()
    ArrangementType = TC_FACULTATIVE
    Currency = ririsk.Currency
    Existings = ririsk.Agreements
  }

  override function makeQuery() : Query<RIAgreement>{
    var query = super.makeQuery()
    query.subselect("ID", CompareNotIn, RIPolicyAttachment, "Agreement")
      .join("Risk").join("VersionList")
      .compare("RiskNumber", NotEquals, _ririsk.RiskNumber)
    if (EffectiveOn <> null) {
      query.compare("EffectiveDate", Relop.LessThanOrEquals, DateUtil.endOfDay(EffectiveOn))
      query.compare("ExpirationDate", Relop.GreaterThan, DateUtil.endOfDay(EffectiveOn))
    }
    return query
  }
}
