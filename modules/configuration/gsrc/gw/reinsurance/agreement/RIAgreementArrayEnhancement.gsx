package gw.reinsurance.agreement

uses gw.pl.currency.MonetaryAmount

uses java.text.DateFormat
uses java.util.ArrayList
uses java.util.Date

enhancement RIAgreementArrayEnhancement : RIAgreement[] {

  property get GrossPerRiskAgreementsForCalc() : RIAgreement[] {
    return PerRiskAgreementsForCalc.getAgreementsOfType({TC_QUOTASHARERITREATY, TC_SURPLUSRITREATY, TC_EXCESSOFLOSSRITREATY, TC_FACEXCESSOFLOSSRIAGREEMENT, TC_FACPROPORTIONALRIAGREEMENT})
  }

  property get NXOLAgreementsForCalc() : RIAgreement[] {
    return PerRiskAgreementsForCalc.getAgreementsOfType({TC_NETEXCESSOFLOSSRITREATY, TC_FACNETEXCESSOFLOSSRIAGREEMENT})
  }

  property get PerRiskAgreementsForCalc() : RIAgreement[] {
    return this.where(\ r -> r typeis PerRisk && r.CountTowardTotalLimit == true)
  }

  property get XOLAgreementsForCalc() : RIAgreement[] {
    return PerRiskAgreementsForCalc.getAgreementsOfType({TC_EXCESSOFLOSSRITREATY, TC_FACEXCESSOFLOSSRIAGREEMENT})
  }

  public function getAgreementsOfType(types : typekey.RIAgreement[]) : RIAgreement[] {
    return this.where(\ r -> types.contains(r.Subtype))
  }

  function getCoverageOverlapErrors(grossRetention : MonetaryAmount, from : Date, to : Date) : List<String> {
    var errors = new ArrayList<String>()

    this.eachWithIndex(\ agreement1, i -> {
        this.eachWithIndex(\ agreement2, j -> {
          // Ignoring attachments where attachment == limit
          if (j > i
                and agreement1.getAttachmentPoint(grossRetention) != agreement1.getCoverageLimit(grossRetention)
                and agreement2.getAttachmentPoint(grossRetention) != agreement2.getCoverageLimit(grossRetention)
                and agreement1.overlapsAgreement(agreement2, grossRetention)) {
            // Found overlap
            if (from == null or to == null) {
              errors.add(displaykey.Web.Reinsurance.Program.Validation.OverlappingCoverageError(agreement1.Name, agreement2.Name))
            } else {
              errors.add(displaykey.Web.Reinsurance.RIRisk.Validation.OverlappingCoverageError(agreement1.Name, agreement2.Name, DateFormat.getDateInstance().format(from)))
            }
          }
        })
    })

    return errors
  }
}
