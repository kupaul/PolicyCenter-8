package gw.web.admin

uses gw.api.domain.financials.CostKey
uses gw.api.util.DisplayableException
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsuranceCedingPlugin
uses gw.plugin.reinsurance.IReinsurancePlugin
uses gw.reinsurance.search.AgreementSearchCriteria
uses pcf.RILocationRiskProximitySearchPopup

uses java.lang.Exception

@Export
class ReinsuranceUIHelper {

  public static function partitionTransactions(ri : RIRisk) : java.util.Map<gw.api.domain.financials.CostKey,java.util.List<entity.RICededPremiumTransaction>> {
    var pp = ri.Reinsurable.Branch
    var trx = Plugins.get(IReinsuranceCedingPlugin).findRICededPremiums(pp.PolicyTerm).where(\ r -> r.RiskNumber == ri.RiskNumber)*.Cedings
    return trx.partition(\ t -> t.RICededPremium.Cost.CostKey)
  }

  public static function sortCostKeysByBuildingAndCost(map : java.util.Map<CostKey,java.util.List<entity.RICededPremiumTransaction>>) : CostKey[] {
    return map.Keys
        .orderBy(\ k -> map.get(k).first().RICededPremium.Cost.CoverableName)
        .thenBy(\ k -> map.get(k).first().RICededPremium.Cost.DisplayName)
        .toTypedArray()
  }

  // Root cause of this warning is that public method gw.api.web.util.DateRangeUtil.allDatesBetween() returns com.guidewire.pl.system.util.DateRange
  public static function sortDateRanges(map : java.util.Map<com.guidewire.pl.system.util.DateRange,java.util.List<entity.RICededPremiumTransaction>>) : com.guidewire.pl.system.util.DateRange[] {
    return map.Keys
        .orderBy(\ d -> d.Start)
        .thenBy(\ d -> d.End)
        .toTypedArray()
  }


  public static function partitionAgreementTransactions(ri : RIRisk) : java.util.Map<RIAgreement,java.util.List<entity.RICededPremiumTransaction>> {
    var pp = ri.Reinsurable.Branch
    var ricp = Plugins.get(IReinsuranceCedingPlugin).findRICededPremiums(pp.PolicyTerm).where(\ r -> r.RiskNumber == ri.RiskNumber)
    return ricp*.Cedings.partition(\ t -> t.Agreement)
  }


  public static function sortAgreements(map : java.util.Map<RIAgreement,java.util.List<entity.RICededPremiumTransaction>>) : RIAgreement[] {
    return map.Keys
        .orderBy(\ k -> map.get(k).first().CalculationOrder)
        .toTypedArray()
  }

  public static function createCriteria(searchType : int, currency : typekey.Currency, toExcludes : entity.RIAgreement[], ririsk : entity.RIRisk) : AgreementSearchCriteria {
    var criteria : AgreementSearchCriteria
    switch(searchType) {
      case 1: criteria = AgreementSearchCriteria.forPerRisk(toExcludes)
          break
      case 2: criteria = AgreementSearchCriteria.forAggregate(toExcludes)
          break
        default: return AgreementSearchCriteria.forFacultative(ririsk)
    }
    /* non-RIRisk search... */
    if (currency <> null) {
      criteria.Currency = currency
    }
    return criteria
  }

  public static function makeAllCheckedAgreementsActive(checkedValues : RIAgreement[]) {
    var errorFound = false
    for (agreement in checkedValues) {
      try {
        gw.reinsurance.agreement.RIAgreementValidation.validateUI(agreement)
        agreement.Status = TC_ACTIVE
        agreement.Bundle.commit()
      } catch (e : Exception) {
        errorFound = true
      }
    }
    if (errorFound) {
      gw.api.util.LocationUtil.addRequestScopedInfoMessage(displaykey.Web.Reinsurance.Agreement.Verify.MakeActiveFailedError)
    }
  }

  public static function recalcAndValidate(agreement : entity.RIAgreement, ririsk : entity.RIRisk) {
    gw.reinsurance.agreement.RIAgreementValidation.validateUI(agreement)
    if (agreement.Active) {
      if (agreement typeis Facultative) {
        agreement.recalculateCeding()
      }
    }
    gw.reinsurance.agreement.RIAgreementValidation.validateAgainstRisk(agreement, ririsk)
  }

  public static function createAgreement(basedOn : entity.RIAgreement, agreementType : typekey.RIAgreement) : RIAgreement{
    if(basedOn == null){
      var riAgreement = agreementType.createNewAgreement()
      riAgreement.Currency = gw.api.util.CurrencyUtil.getDefaultCurrency()
      return riAgreement
    }else{
      return basedOn.clone(gw.transaction.Transaction.getCurrent())
    }
  }

  public static function createTreaty(ri : entity.RIRisk, agreementType : typekey.RIAgreement) : RIAgreement{
    var newAgreement = agreementType.createNewAgreement()

    var riEnd = ri.Reinsurable.LatestExpirationDate
    var ppEnd = ri.VersionList.PolicyPeriod.EndOfCoverageDate

    newAgreement.setEffectiveDateWithDefaultTime(ri.EffectiveDate)
    newAgreement.setExpirationDateWithDefaultTime(riEnd.before(ppEnd) ? riEnd : ppEnd)
    newAgreement.Currency = ri.Currency

    return newAgreement
  }

  public static function initProgram() : RIProgram {
    var prog = new RIProgram()
    prog.Currency = gw.api.util.CurrencyUtil.getDefaultCurrency()
    return prog
  }

  public static function saveDraft(policyPeriod : entity.PolicyPeriod, wizard : pcf.api.Wizard) {
    policyPeriod.RIRiskVersionLists.each(\ v -> v.AllVersions.each(\ r -> gw.reinsurance.risk.RIRiskValidation.validateUI(r)))
    wizard.saveDraft()
  }

  public static function getAttachments(ririsk : entity.RIRisk, isPerRisk : boolean) : java.util.List<gw.api.reinsurance.RIAttachment> {
    return ririsk.Attachments.where(\ r -> isPerRisk == r.Agreement typeis PerRisk)
  }

  public static function getCededPremiums(ri : RIRisk) : RICededPremiumTransaction[] {
    var pp = ri.Reinsurable.Branch
    var ricp = Plugins.get(IReinsuranceCedingPlugin).findRICededPremiums(pp.PolicyTerm).where(\ r -> r.RiskNumber == ri.RiskNumber)
    return ricp*.Cedings
  }

  public static function searchAndFilterByLocationGroup(criteria : gw.reinsurance.search.RILocationRiskProximitySearchCriteria, locationGroup : String, date : java.util.Date) : LocationRisk[] {
    var results = criteria.findLocationRisks()

    if (locationGroup?.trim()?.length() == 0) {
      return results
    } else {
      var filterRisks = Plugins.get(IReinsurancePlugin).getRisksInALocationRiskGroup(locationGroup, date)
      return results.where(\ l -> filterRisks.contains(l.RiskNumber))
    }
  }

  public static function assignLocGroup(locRisks : LocationRisk[], effDate : java.util.Date, value : String, targetLocationRisk : entity.LocationRisk, currentLocation : pcf.RILocationRiskProximitySearchPopup) {
    var lrs = locRisks as List<LocationRisk>
    if (targetLocationRisk.isEffective(effDate)) {
      lrs.add(targetLocationRisk)
    }

    var valueToAssign = normalizedLocationGroupName(value)
    lrs.each(\ l -> {
      var slice = targetLocationRisk.Bundle.add(l.asOf(effDate))
      slice.LocationRiskGroup = valueToAssign
    })
    currentLocation.commit()
  }

  public static function normalizedLocationGroupName(value : String) : String {
    var val = value?.trim()
    return val.Empty ? null : val
  }

  public static function getTreaties(program : entity.RIProgram, isPerRisk : boolean) : RIAgreement[]{
    return program.Treaties.where(\ r -> isPerRisk ? r typeis PerRisk : not (r typeis PerRisk))
  }

  public static function getMaxRetention(agreement : RIAgreement) : gw.pl.currency.MonetaryAmount {
    return agreement typeis SurplusRITreaty ? agreement.MaxRetention : null
  }

  public static function getLines(agreement : RIAgreement) : java.math.BigDecimal {
    return agreement typeis SurplusRITreaty ? agreement.LinesOfCoverage : null
  }

  public static function shouldInitializeRiskDetailVariables(risk : Reinsurable, riModuleOn : boolean ) : boolean {
    return risk.RIRisk != null and riModuleOn
  }

  public static function attachFacs(ririsk : RIRisk, agreements : RIAgreement[]) {
    for (agreement in agreements) {
      if(agreement.Status == TC_ACTIVE or agreement.IsValid){
        ririsk.attachRiskToFacultative(agreement)
      }else{
        gw.api.util.LocationUtil.addRequestScopedErrorMessage(displaykey.Web.Reinsurance.Validation.CannotAddInvalidFac(agreement.AgreementNumber))
      }
    }
  }

  public static function doProximitySearch(slice : Reinsurable) {
    var locRisk = slice as LocationRisk
    if (not locRisk.AccountLocation.SuccessfullyGeocoded) {
      throw new DisplayableException(displaykey.Web.Reinsurance.ProximitySearch.LocationNotGeocoded)
    }
    RILocationRiskProximitySearchPopup.push(locRisk)
  }

  public static function getRIRiskDateRangeDisplay(risk : Reinsurable, sliceDate : java.util.Date) : String {
    var ririsk = risk.RIRisk.VersionList.getVersionAsOf(sliceDate)
    return ririsk.EffectiveDate.ShortFormat + " - " + ririsk.ExpirationDate.ShortFormat
  }

  public static function getAllRIRiskVersions(risk : Reinsurable, riModuleOn : boolean, policyPeriod : entity.PolicyPeriod) : List<java.util.Date> {
    var allEffDates : List<java.util.Date> = {}
    if (shouldInitializeRiskDetailVariables(risk, riModuleOn)) {
      allEffDates = risk.RIRisk.VersionList.AllVersions*.EffectiveDate.toList()
      if (not policyPeriod.Locked) {
        allEffDates = allEffDates.where(\ d -> d >= policyPeriod.EditEffectiveDate )
      }
    }
    return allEffDates
  }

  public static function getReinsurableSlice(risk : Reinsurable, sliceDate : java.util.Date) : Reinsurable{
    var version = risk.VersionList.getVersionAsOf(sliceDate)
    return version.getSliceUntyped(sliceDate) as Reinsurable
  }

  public static function resetSliceDate(currentSlice : Reinsurable, newSlice : Reinsurable, currentDate : java.util.Date, riModuleOn : boolean, asOfDate : java.util.Date, policyPeriod : entity.PolicyPeriod) : java.util.Date{
    if (not shouldInitializeRiskDetailVariables(currentSlice, riModuleOn)) {
      return asOfDate
    }

    if (currentSlice.VersionList <> newSlice.VersionList){
      var versions = getAllRIRiskVersions(newSlice, riModuleOn, policyPeriod)
      var defaultSliceDateForThisRisk = versions.lastWhere(\ d -> d <= asOfDate)
      if (defaultSliceDateForThisRisk == null) {
        throw "Could not figure out the default slice date for this risk as of this date: ${asOfDate}. Available effective dates includes: ${versions.join(",")}"
      }
      return defaultSliceDateForThisRisk
    }
    return currentDate
  }

  public static function updateActiveProgram(program : entity.RIProgram, currentLocation : pcf.api.Location){
    program.updateActiveProgram()
    currentLocation.commit()
  }

  public static function delete(program : entity.RIProgram) {
    //if program is not used
    if (program.isAttachedToAnyRIRisk()) {
      throw new DisplayableException(displaykey.Web.Reinsurance.Program.DeleteError)
    } else {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        bundle.add(program).remove()
      })
    }
  }

  public static function makeActive(program : entity.RIProgram) {
    program.validate()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      bundle.add(program).makeActive()
    })
  }

  public static function updateCurrency(program : entity.RIProgram) {
    program.TargetMaxRetention = null
    program.SingleRiskMaximum = null
  }

  public static function updateImpliedNetRetention(program : entity.RIProgram) : MonetaryAmount {
    if (not program.agreementCurrenciesAreConsistent()) {
      return null
    }

    return program.calculateImpliedNetRetention()
  }

}