package gw.webservice.pc.pc800.gxmodel

uses java.lang.IllegalArgumentException

enhancement PolicyPeriodModelEnhancement : gw.webservice.pc.pc800.gxmodel.policyperiodmodel.types.complex.PolicyPeriod {

  function populatePolicyPeriod(period : PolicyPeriod) {
    SimpleValuePopulator.populate(this, period)
    var product = period.Policy.Product
    if (this.Offering.Code <> null) {
      var offering = product.Offerings.firstWhere(\ o -> o.Code == this.Offering.Code)
      if (offering == null) {
        throw new IllegalArgumentException("Could not find offering with code ${this.Offering.Code} for product ${product}")
      }
      period.Offering = offering
    }
    period.Policy.PrimaryLanguage = this.Policy.PrimaryLanguage
    period.Policy.OriginalEffectiveDate = this.Policy.OriginalEffectiveDate
    period.Policy.PriorPremiums = this.Policy.PriorPremiums
    for (answer in this.PeriodAnswers.Entry) {
      var periodAnswer = new PeriodAnswer(period)
      SimpleValuePopulator.populate(answer.$TypeInstance, periodAnswer)
      period.addToPeriodAnswers(periodAnswer)
    }
    var modelContact = this.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact
    var account = period.Policy.Account
    if (modelContact <> null) {
      var primaryInsured = modelContact.$TypeInstance.findOrCreateContact(account)
      period.changePrimaryNamedInsuredTo(primaryInsured)
    }
    for (modelLocation in this.PolicyLocations.Entry) {
      var accountLocation = modelLocation.AccountLocation.$TypeInstance.findMatchedLocation(account)
      var policyLocation : PolicyLocation
      if (accountLocation <> null) {
        policyLocation = period.newLocation(accountLocation)
      } else {
        policyLocation = period.newLocation()
      }
      modelLocation.$TypeInstance.populatePolicyLocation(policyLocation)
    }
    if (period.BusinessAutoLineExists) {
      this.BusinessAutoLine.$TypeInstance.populate(period.BusinessAutoLine)
    }
    period.PreferredCoverageCurrency = (this.PreferredCoverageCurrency != null) ? this.PreferredCoverageCurrency : period.Policy.Account.PreferredCoverageCurrency
    period.PreferredSettlementCurrency = (this.PreferredSettlementCurrency != null) ? this.PreferredSettlementCurrency : period.Policy.Account.PreferredSettlementCurrency
  }
}
