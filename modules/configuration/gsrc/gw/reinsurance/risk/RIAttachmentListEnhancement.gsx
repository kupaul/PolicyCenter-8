package gw.reinsurance.risk

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.RIAttachment

enhancement RIAttachmentListEnhancement : List<RIAttachment> {

  function CededRisks(currency : Currency) : MonetaryAmount {
    return this.sum(currency, \ r -> r.CededRisk ?: 0bd.ofCurrency(currency) )
  }

  function MaxCedings(currency : Currency) : MonetaryAmount {
    return this.sum(currency, \ r -> r.MaxCeding ?: 0bd.ofCurrency(currency))
  }

  property get Treaties() : List<RIAttachment> {
    return this.where(\ r -> r.Agreement typeis Treaty)
  }

  property get FacAgreements() : List<RIAttachment> {
    return this.where(\ r -> r.Agreement typeis Facultative)
  }

  property get AttachmentsForRiskCeding() : List<RIAttachment> {
    return this.where(\ r -> r.InclusionType != TC_EXCLUDED
                         and ((r.Agreement typeis PerRisk) ? r.Agreement .CountTowardTotalLimit == true : true))
  }

  property get AttachmentsForPremiumCeding() : List<RIAttachment> {
    return AttachmentsForRiskCeding.where(\ r -> not r.IsProjected  and (r.Agreement typeis Facultative or r.CededRisk.Amount != 0))
  }

  property get NXOLAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_NETEXCESSOFLOSSRITREATY, TC_FACNETEXCESSOFLOSSRIAGREEMENT})
  }

  property get XOLAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_EXCESSOFLOSSRITREATY, TC_FACEXCESSOFLOSSRIAGREEMENT})
  }

  property get QuotaShareAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_QUOTASHARERITREATY})
  }

  property get SurplusAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_SURPLUSRITREATY})
  }

  property get GrossAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_QUOTASHARERITREATY, TC_SURPLUSRITREATY, TC_EXCESSOFLOSSRITREATY, TC_FACPROPORTIONALRIAGREEMENT, TC_FACEXCESSOFLOSSRIAGREEMENT})
  }

  property get GrossPerRiskTreatyAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_QUOTASHARERITREATY, TC_SURPLUSRITREATY, TC_EXCESSOFLOSSRITREATY})
  }

  property get ProportionalTreatyAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_QUOTASHARERITREATY, TC_SURPLUSRITREATY})
  }

  property get ProportionalFacAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_FACPROPORTIONALRIAGREEMENT})
  }

  property get ProportionalAttachmentsForCalc() : List<RIAttachment> {
    return AttachmentsForRiskCeding.getAttachmentsOfType({TC_QUOTASHARERITREATY, TC_SURPLUSRITREATY, TC_FACPROPORTIONALRIAGREEMENT})
  }

  property get MaxCoverageLimit() : MonetaryAmount {
    var limits = this*.Agreement*.CoverageLimit.where(\ b -> b != null)
    return limits.HasElements ? limits.max() : null
  }

  function getAttachmentsOfType(types : typekey.RIAgreement[]) : List<RIAttachment> {
    return this.where(\ r -> types.contains(r.Agreement.Subtype))
  }
}
