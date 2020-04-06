package gw.reinsurance.risk

uses java.lang.IllegalStateException
enhancement RIPolicyAttachmentEnhancement : RIPolicyAttachment {

  // NOTE: InclusionType property same as on RIAttachmentEnhancement
  property get InclusionType() : RIAttachmentInclusionType{
    if (this.Risk <> null) {
      return this.Agreement.getInclusion(this.Risk)
    }
    return RIAttachmentInclusionType.TC_INCLUDED // this only happenss for fake attachments to program?
  }

  property set InclusionType(rIAttachmentInclusionType : RIAttachmentInclusionType) {
    var agreement = this.Agreement
    if (agreement.Bundle.ReadOnly) {
      throw new IllegalStateException("Cannot update inclusion type in a read only bundle.")
    } else {
      agreement.updateInclusion(this.Risk, rIAttachmentInclusionType)
    }
  }
}