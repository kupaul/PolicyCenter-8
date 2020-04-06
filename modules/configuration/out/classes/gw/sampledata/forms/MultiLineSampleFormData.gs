package gw.sampledata.forms
uses gw.api.builder.FormPatternBuilder
uses gw.api.util.DateUtil
uses gw.transaction.Transaction

/**
 * A set of sample form patterns for PolicyCenter's out-of-the-box product model.
 * These forms are not specific to a particular policy line.
 */
@Export
class MultiLineSampleFormData extends AbstractSampleFormData {

  construct() {
  }

  override property get CollectionName() : String {
    return "Multi-Line Forms"
  }

  override property get AlreadyLoaded() : boolean {
    return formPatternLoaded("FormCPP01")
  }

  override function load() {
    Transaction.runWithNewBundle(\bundle -> {
      new FormPatternBuilder()
        // Basics
        .withCode("FormCPP01")
        .withFormNumber("CPP 01")
        .withEdition("00 00")
        .withDescription("Commercial Package Policy Definition")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(5, 21, 2009), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("FormIL17")
        .withFormNumber("PF 01")
        .withEdition("00 00")
        .withDescription("Common Policy Conditions")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(2)
        // Products
        .withProduct("CommercialProperty")
        .withProduct("InlandMarine")
        .withProduct("GeneralLiability")
        .withProduct("BusinessAuto")
        .withProduct("CommercialPackage")
        .withProduct("PersonalAuto")
        .withProduct("BusinessOwners")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(5, 21, 2009), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .create(bundle)

    })
  }

}
