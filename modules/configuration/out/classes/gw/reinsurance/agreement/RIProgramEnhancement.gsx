package gw.reinsurance.agreement

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.reinsurance.RIAttachment
uses gw.api.reinsurance.RILossDateAttachment
uses gw.pl.currency.MonetaryAmount
uses gw.reinsurance.NullSafeMath

uses java.util.ArrayList

enhancement RIProgramEnhancement : entity.RIProgram {

  /**
   * assumes that program and associated treaties are valid
   */
  function makeActive() {
    for (treaty in this.Treaties) {
      if (treaty.Status == TC_DRAFT) {
        treaty.Status = TC_ACTIVE
      }
    }
    this.Status = TC_ACTIVE
    this.RequiresRecalculation = true
  }

  function calculateImpliedNetRetention() : MonetaryAmount {
    var attachments = new ArrayList<RIAttachment>()
    // These loss date attachments are created just for the purpose of calculating ceding,
    // they do not represent attachments to this program
    for(treaty in this.Treaties){
      var attachment = new RILossDateAttachment(null)  // null will make inclusion for this fake attachment always return "included"
      attachment.Agreement = treaty
      attachment.Program = this
      attachments.add(attachment)
    }
    this.updateCeding(attachments)
    return NullSafeMath.nsSub(this.SingleRiskMaximum, attachments.CededRisks(this.Currency))
  }

  function validate() {
    gw.reinsurance.agreement.RIProgramValidation.validateUI(this)
  }

  function validateCurrency() {
    gw.reinsurance.agreement.RIProgramValidation.validateCurrencyUI(this)
  }

  function agreementCurrenciesAreConsistent() : boolean {
    return agreementsHavingDifferentCurrency().IsEmpty
  }

  function agreementsHavingDifferentCurrency() : RIAgreement[] {
    return this.Treaties.where( \ treaty -> treaty.Currency != this.Currency)
  }

  function updateActiveProgram() {
    validate()
    this.RequiresRecalculation = true
  }

  function isAttachedToAnyRIRisk() : boolean {
    var q = Query.make(RIRisk)
    q.or(\ restriction -> {
      restriction.compare("PolicyAttachmentProgram", Relop.Equals, this.ID)
      restriction.compare("LossDateAttachmentProgram", Relop.Equals, this.ID)
    })
    return q.select().HasElements
  }

}
