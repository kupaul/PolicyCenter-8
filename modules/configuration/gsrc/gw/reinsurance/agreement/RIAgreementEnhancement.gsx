package gw.reinsurance.agreement

uses gw.pl.currency.MonetaryAmount
uses gw.validation.ValidationUtil

enhancement RIAgreementEnhancement : entity.RIAgreement {

  property get IsValid() : boolean{
    var context = ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
    var validator = new RIAgreementValidation(context, this)
    validator.validateAgreementItself()
    return not context.Result.hasErrors()
  }

  property get IsLossDateAttachment() : boolean {
    return (this.AttachmentBasis == TC_LOSSDATEEARNED)
      or (this.AttachmentBasis == TC_LOSSDATEWRITTEN)
  }

  property get IsNetCalculation() : boolean {
    return (this typeis NetExcessOfLossRITreaty) or (this typeis FacNetExcessOfLossRIAgreement)
  }

  property get IsGrossCalculation() : boolean {
    return not IsNetCalculation
  }

  property get IsNXOLWithApplyToGrossRetention() : boolean {
    return (this typeis FacNetExcessOfLossRIAgreement and this.ApplyToGrossRetentionOnly) or (this typeis NetExcessOfLossRITreaty and this.ApplyToGrossRetentionOnly)
  }

  property get hasEditPermission() : boolean {
    if (this typeis Treaty) {
      return (perm.System.editreinsuranceprogram and not this.Active) or (perm.System.editreinsuranceactiveprogram and this.Active)
    } else {
      return perm.System.editreinsurancefacagreement
    }
  }

  /**
   * Add an empty participant to the agreement.
   */
  function addParticipant() : AgreementParticipant {
    return addParticipant(null)
  }

  function addParticipant(contact : Contact) : AgreementParticipant {
    if(not contact.Changed){
      contact = this.Bundle.add(contact)
    }
    contact.AutoSync = AutoSync.TC_ALLOW
    var participant = new AgreementParticipant(this.Bundle)
    participant.Participant = contact
    var participants = this.Participants
    var remainingRisk = participants.HasElements ? participants.sum(\ a -> a.RiskShare) : 0
    if(remainingRisk <= 100){
      participant.RiskShare = 100 - remainingRisk
    }
    this.addToParticipants(participant)
    return participant
  }

  function overlapsAgreement(agreement : RIAgreement, grossRetention : MonetaryAmount) : boolean {
    if (this typeis FacProportionalRIAgreement or agreement typeis FacProportionalRIAgreement)
      return false
    if (this.IsNetCalculation != agreement.IsNetCalculation)
      return false

    var minLimit = {this.getCoverageLimit(grossRetention), agreement.getCoverageLimit(grossRetention)}.min()
    var maxAttachPoint = {this.getAttachmentPoint(grossRetention), agreement.getAttachmentPoint(grossRetention)}.max()
    return minLimit > maxAttachPoint
  }

  function PremiumAndCoverageMode() : String {
    return this typeis Facultative ? "facultative" : "treaty"
  }

  function validate() {
    gw.reinsurance.agreement.RIAgreementValidation.validateUI(this)
  }

  function resetMonetaryAmounts() {
    if (this.AmountOfCoverage != null) {
      this.AmountOfCoverage = null
    }
    if (this.CoverageLimit != null) {
      this.CoverageLimit = null
    }
    if (!(this typeis QuotaShareRITreaty or this typeis FacProportionalRIAgreement) and this.AttachmentPoint != null) {
      this.AttachmentPoint = null
    }
    if (this typeis SurplusRITreaty and this.MaxRetention != null) {
      this.MaxRetention = null
    }
    if (this typeis Facultative and this.CededPremium != null) {
      this.CededPremium = null
    } else if (this typeis Treaty and this.MinDepositPremium != null) {
      this.MinDepositPremium = null
    }
    if (this typeis PerRisk and this.NotificationThreshold != null) {
      this.NotificationThreshold = null
    }
  }
}
