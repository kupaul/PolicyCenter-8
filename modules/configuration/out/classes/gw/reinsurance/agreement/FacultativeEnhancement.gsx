package gw.reinsurance.agreement

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.pl.currency.MonetaryAmount

uses java.lang.IllegalArgumentException

enhancement FacultativeEnhancement : entity.Facultative {

  property get TotalCost() : MonetaryAmount {
    return (this.CededPremium == null ? null : (1 + this.MarkUp / 100) * this.CededPremium)
  }

  // Trigger recalc if an Active fac is edited and saved
  // This is meant to be called by beforeCommit
  function recalculateCeding() {
    var changes = this.ChangedFields
    var agreement = this as RIAgreement
    if (changes.contains("Active") or not agreement.Active) {
      // not active, or was just activated
      return
    }
    if (changes.HasElements) {
      var attachments = Query.make(RIPolicyAttachment)
            .compare("Agreement", Equals, agreement)
            .select()
      if (attachments.Empty) {
        // This can happen if the Fac hasn't been attached to a policy yet...we need to tolerate it.
        return
      }
      //update ceding for each ririsk with fac as an attachment
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        attachments.each(\ p -> {
          var ririsk : entity.RIRisk
          try {
             ririsk = agreement.Bundle.add(p.Risk)
           } catch (e : IllegalArgumentException) {
             // can't use that bundle
             ririsk = bundle.add(p.Risk)
           }
           ririsk.updateCedingOnAllAttachments()
        })
      })

      //update ceded premiums
      var branch = agreement.Bundle.add(attachments.first().Risk.Reinsurable.Branch)
      branch.enqueueForCededPremiumCalculation(RIRecalcReason.TC_AGREEMENTCHANGE, displaykey.Web.Reinsurance.FacAgreement.CededPremiumRecalcReason(agreement.AgreementNumber))
    }
  }

  function isAttachedToAnyRIRisk() : boolean {
    var RIPolicyAttachmentQuery = Query.make(RIPolicyAttachment)
    RIPolicyAttachmentQuery.compare("Agreement", Relop.Equals, this)
    return RIPolicyAttachmentQuery.select().HasElements
  }
}