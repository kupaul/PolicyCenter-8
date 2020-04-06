package gw.reinsurance.agreement

uses com.guidewire.commons.typelist.SubtypeKey

uses java.lang.Integer

enhancement RIAgreementTypeKeyEnhancement : typekey.RIAgreement {
  
  property get RiskCedingOrder() : int {
    if (this == typekey.RIAgreement.TC_FACEXCESSOFLOSSRIAGREEMENT) {
      return 1
    } else if (this == typekey.RIAgreement.TC_EXCESSOFLOSSRITREATY) {
      return 2
    } else if (this == typekey.RIAgreement.TC_QUOTASHARERITREATY) {
      return 3
    } else if (this == typekey.RIAgreement.TC_FACPROPORTIONALRIAGREEMENT) {
      return 4
    } else if (this == typekey.RIAgreement.TC_SURPLUSRITREATY) {
      return 5
    } else if (this == typekey.RIAgreement.TC_FACNETEXCESSOFLOSSRIAGREEMENT) {
      return 6
    } else if (this == typekey.RIAgreement.TC_NETEXCESSOFLOSSRITREATY) {
      return 7
    } else if (this == typekey.RIAgreement.TC_PEREVENTRITREATY) {
      return 8
    } else {
      return Integer.MAX_VALUE
    }
  }

  property get PremiumCedingOrder() : int {
    if (this == typekey.RIAgreement.TC_FACEXCESSOFLOSSRIAGREEMENT) {
      return 1
    } else if (this == typekey.RIAgreement.TC_EXCESSOFLOSSRITREATY) {
      return 2
    } else if (this == typekey.RIAgreement.TC_FACPROPORTIONALRIAGREEMENT) {
      return 3
    } else if (this == typekey.RIAgreement.TC_SURPLUSRITREATY) {
      return 4
    } else if (this == typekey.RIAgreement.TC_QUOTASHARERITREATY) {
      return 5
    } else if (this == typekey.RIAgreement.TC_FACNETEXCESSOFLOSSRIAGREEMENT) {
      return 6
    } else if (this == typekey.RIAgreement.TC_NETEXCESSOFLOSSRITREATY) {
      return 7
    } else if (this == typekey.RIAgreement.TC_PEREVENTRITREATY) {
      return 8
    } else {
      return Integer.MAX_VALUE
    }
  }

  property get isTreatyAgreement() : boolean {
    return this.Categories.contains(ArrangementType.TC_TREATY)
  }

  function createNewAgreement() : RIAgreement {
    return (this as SubtypeKey).EntityIntrinsicType.TypeInfo.getCallableConstructor({}).Constructor.newInstance({}) as RIAgreement
  }
}
