package gw.reinsurance.risk
uses gw.api.reinsurance.RIAttachment
uses gw.api.reinsurance.RILossDateAttachment
uses java.lang.IllegalStateException

enhancement RIAttachmentEnhancement : RIAttachment {

  // NOTE: InclusionType property must be on RIPolicyAttachmentEnhancement also!
  property get InclusionType() : RIAttachmentInclusionType{
    if (this.Risk <> null) {
      return this.Agreement.getInclusion(this.Risk)
    }
    return RIAttachmentInclusionType.TC_INCLUDED // this only happens for fake attachments to program
  }
  
  property set InclusionType(rIAttachmentInclusionType : RIAttachmentInclusionType) {
    var agreement = this.Agreement
    if (agreement.Bundle.ReadOnly) {
      throw new IllegalStateException("Cannot update inclusion type in a read only bundle.")
    } else {
      agreement.updateInclusion(this.Risk, rIAttachmentInclusionType)
    }
  }

  //projected if treaty belongs to draft program or loss date treaty from previous slices program
  property get IsProjected() : boolean {
    if (this.Agreement typeis Treaty) {
      if (not this.Program.Active) {
        return true
      } else if (this typeis RILossDateAttachment and this.Program.ExpirationDate <= this.Risk.EffectiveDate) {
        return true 
      } else if (this.Program.ExpirationDate <= this.Risk.Reinsurable.Branch.PeriodStart) {
        return true // prior year program was used
      }
    }
    return false
  }

  function hasCedingPriorityOver(attachment : RIAttachment) : boolean {
    return this.Agreement.Subtype.RiskCedingOrder < attachment.Agreement.Subtype.RiskCedingOrder
  }
}
