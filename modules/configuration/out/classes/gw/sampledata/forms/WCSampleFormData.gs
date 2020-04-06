package gw.sampledata.forms
uses gw.api.builder.FormPatternBuilder
uses gw.api.util.DateUtil
uses gw.transaction.Transaction

/**
 * A set of sample form patterns for PolicyCenter's out-of-the-box WorkersCompLine.
 */
@Export
class WCSampleFormData extends AbstractSampleFormData {

  construct() {
  }

  override property get CollectionName() : String {
    return "WorkersCompLine Forms"
  }

  override property get AlreadyLoaded() : boolean {
    return formPatternLoaded("Form_35_1_OK")
  }

  override function load() {
    Transaction.runWithNewBundle(\bundle -> {
      new FormPatternBuilder()
        // Basics
        .withCode("Form_35_1_OK")
        .withFormNumber("Form 35-1")
        .withEdition("00 00")
        .withDescription("Notice to Policyholders")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("Form_35_3B_OK")
        .withFormNumber("Form 35-3B")
        .withEdition("00 00")
        .withDescription("Workers Compensation Medical Deductible Acceptance/Rejection Form")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("Form_45_1_VA")
        .withFormNumber("Form 45-1")
        .withEdition("11 89")
        .withDescription("Notice to Policyholders")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "VA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("Form_7_CA")
        .withFormNumber("Form 7")
        .withEdition("08 05")
        .withDescription("Endorsement Agreement Limiting and Restricting This Insurance-Medical Benefits Not Insured")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_7_CA
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("PN_04_99_02B_CA")
        .withFormNumber("PN 04 99 02B")
        .withEdition("05 05")
        .withDescription("Policyholder Notice (Insurance Rating Laws)")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("PN_04_99_03_CA")
        .withFormNumber("PN 04 99 03")
        .withEdition("11 99")
        .withDescription("Notice Required by Law")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_AK")
        .withFormNumber("StateNotice")
        .withEdition("08 05")
        .withDescription("Important Notice to Employers (Informs Employer of Potential Need for obtaining Federal Coverage)")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1000)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "AK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_AR")
        .withFormNumber("StateNotice AR")
        .withEdition("00 00")
        .withDescription("Important Policyholder Information-Arkansas")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "AR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_CO")
        .withFormNumber("StateNotice CO")
        .withEdition("00 00")
        .withDescription("Important Notice to Policyholders")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CO", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_DE_1")
        .withFormNumber("StateNotice DE_1")
        .withEdition("00 00")
        .withDescription("Notice of Election to Accept or Reject an Insurance Deductible for Delaware Workers' Compensation Death and Medical Benefits")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "DE", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_DE_2")
        .withFormNumber("StateNotice DE_2")
        .withEdition("00 00")
        .withDescription("Policyholder Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "DE", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_FL")
        .withFormNumber("StateNotice FL")
        .withEdition("00 00")
        .withDescription("Notice to Policyholders")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "FL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_IN")
        .withFormNumber("StateNotice IN")
        .withEdition("00 00")
        .withDescription("Notice to Policyholders")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "IN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_KY_1")
        .withFormNumber("StateNotice KY_1")
        .withEdition("00 00")
        .withDescription("Notice of Insured's Rights")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_KY_2")
        .withFormNumber("StateNotice KY_2")
        .withEdition("00 00")
        .withDescription("Notice to Insureds-Tax and Assessment Charge")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_ME")
        .withFormNumber("StateNotice ME")
        .withEdition("00 00")
        .withDescription("Insurance Inquiry Form")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "ME", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_NJ")
        .withFormNumber("StateNotice NJ")
        .withEdition("00 00")
        .withDescription("Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NJ", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_OK")
        .withFormNumber("StateNotice OK")
        .withEdition("00 00")
        .withDescription("Fraud Warning Endorsement-Oklahoma")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_VA")
        .withFormNumber("StateNotice VA")
        .withEdition("00 00")
        .withDescription("Important Information Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "VA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("StateNotice_WI")
        .withFormNumber("StateNotice WI")
        .withEdition("00 00")
        .withDescription("Notice of Right to File a Complaint")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "WI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_00_00A")
        .withFormNumber("WC 00 00 00")
        .withEdition("08 05")
        .withDescription("Workers Compensation and Employers Liability Insurance Policy")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_00_00_US")
        .withFormNumber("WC 00 00 00")
        .withEdition("08 05")
        .withDescription("Workers Compensation and Employers Liability Insurance Policy")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(12, 31, 1999), DateUtil.createDateInstance(12, 31, 2001), null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_01_01A_US")
        .withFormNumber("WC 00 01 01A")
        .withEdition("04 92")
        .withDescription("Defense Base Act Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(12, 31, 1999), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_01_01A
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_01_02_US")
        .withFormNumber("WC 00 01 02")
        .withEdition("04 92")
        .withDescription("Federal Coal Mine Health And Safety Act Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 15")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_01_02
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_01_04A")
        .withFormNumber("WC 00 01 04A")
        .withEdition("08 05")
        .withDescription("Federal Employers' Liability Act Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_01_04A
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_02_01_US")
        .withFormNumber("WC 00 02 01")
        .withEdition("08 05")
        .withDescription("Maritime Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_02_01
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_06_03_CT")
        .withFormNumber("WC 00 06 03 CT")
        .withEdition("08 05")
        .withDescription("Benefits Deductible Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(10)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CT", null)
        .withInternalGroupCode("WC 00 06 03")
        .withUseInsteadOfCode("WC_00_06_03_US")
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_06_03_CT
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_00_06_03_US")
        .withFormNumber("WC 00 06 03")
        .withEdition("08 05")
        .withDescription("Benefits Deductible Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(10)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        .withInternalGroupCode("WC 00 06 03")
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_00_06_03_US
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_03_06_01A_AR")
        .withFormNumber("WC 03 06 01A")
        .withEdition("04 92")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "AR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_04_03_01A_CA")
        .withFormNumber("WC 04 03 01A")
        .withEdition("03 98")
        .withDescription("Policy Amendatory Endorsement - CA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "CA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_04_03_06_CA")
        .withFormNumber("WC 04 03 06")
        .withEdition("04 84")
        .withDescription("Waiver of Our Right to Recover from Others Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(5)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        .withRemovalEndorsementFormNumber("WC 89 06 14")
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_04_03_06_CA
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_07_06_01_DE")
        .withFormNumber("WC 07 06 01")
        .withEdition("00 00")
        .withDescription("Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "DE", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_08_06_01_DC")
        .withFormNumber("WC 08 06 01")
        .withEdition("04 84")
        .withDescription("Cancellation Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "DC", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_10_00_00")
        .withFormNumber("WC 10 00 00")
        .withEdition("00 00")
        .withDescription("Workers Compensation Manuscript Form")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(100)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 28, 2008), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_10_00_00
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_10_06_01A_GA")
        .withFormNumber("WC 10 06 01A")
        .withEdition("00 00")
        .withDescription("Cancellation, Nonrenewal and Change Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "GA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_12_06_01C_IL")
        .withFormNumber("WC 12 06 01C")
        .withEdition("04 05")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "IL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_15_04_01_KS")
        .withFormNumber("WC 15 04 01")
        .withEdition("04 84")
        .withDescription("Final Premium Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KS", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_15_06_01A_KS")
        .withFormNumber("WC 15 06 01A")
        .withEdition("00 00")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KS", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_16_06_01_KY")
        .withFormNumber("WC 16 06 01")
        .withEdition("12 97")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_16_06_02_KY")
        .withFormNumber("WC 16 06 02")
        .withEdition("10 99")
        .withDescription("Notice of Appeal Rights Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "KY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_17_06_01D_LA")
        .withFormNumber("WC 17 06 01D")
        .withEdition("04 05")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "LA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_17_06_02A_LA")
        .withFormNumber("WC 17 06 02A")
        .withEdition("00 00")
        .withDescription("Cost Containment Act Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "LA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_18_06_03A_ME")
        .withFormNumber("WC 18 06 03A")
        .withEdition("00 00")
        .withDescription("Cancellation/Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "ME", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_18_06_04_ME")
        .withFormNumber("WC 18 06 04")
        .withEdition("05 88")
        .withDescription("Final Premium Audit Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "ME", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_18_06_06_ME")
        .withFormNumber("WC 18 06 06")
        .withEdition("08 99")
        .withDescription("Notice of Filing of First Reports of Injury Within Seven Days Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "ME", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_19_06_01B_MD")
        .withFormNumber("WC 19 06 01B")
        .withEdition("06 05")
        .withDescription("Cancellation Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MD", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_20_03_03B_MA")
        .withFormNumber("WC 20 03 03B")
        .withEdition("00 00")
        .withDescription("Notice to Policyholder Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_20_03_06A_MA")
        .withFormNumber("WC 20 03 06A")
        .withEdition("00 00")
        .withDescription("Limited Other States Insurance Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_20_06_01_MA")
        .withFormNumber("WC 20 06 01")
        .withEdition("00 00")
        .withDescription("Cancellation Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_21_03_03A_MI")
        .withFormNumber("WC 21 03 03A")
        .withEdition("06 97")
        .withDescription("Notice to Policyholder Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_21_03_04_MI")
        .withFormNumber("WC 21 03 04")
        .withEdition("00 00")
        .withDescription("Law Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_22_00_00A_MN")
        .withFormNumber("WC 22 00 00A")
        .withEdition("11 05")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_22_06_01B_MN")
        .withFormNumber("WC 22 06 01B")
        .withEdition("07 97")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_24_06_01B_MO")
        .withFormNumber("WC 24 06 01B")
        .withEdition("00 00")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MO", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_24_06_02A_MO")
        .withFormNumber("WC 24 06 02A")
        .withEdition("00 00")
        .withDescription("Property and Casualty Guaranty Association Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MO", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_24_06_04_MO")
        .withFormNumber("WC 24 06 04")
        .withEdition("00 00")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MO", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_25_03_05_MT")
        .withFormNumber("WC 25 03 05")
        .withEdition("07 05")
        .withDescription("Intentional Injury Exclusion Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_25_06_01A_MT")
        .withFormNumber("WC 25 06 01A")
        .withEdition("10 05")
        .withDescription("Cancelation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_26_06_01C_NE")
        .withFormNumber("WC 26 06 01C")
        .withEdition("07 96")
        .withDescription("Cancelation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NE", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_27_06_01A_NV")
        .withFormNumber("WC 27 06 01A")
        .withEdition("10 05")
        .withDescription("Cancelation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NV", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_28_06_04_NH")
        .withFormNumber("WC 28 06 04")
        .withEdition("04 92")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NH", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_29_03_06A_NJ")
        .withFormNumber("WC 29 03 06A")
        .withEdition("01 05")
        .withDescription("Part Two Employers Liability Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NJ", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_29_03_09A_NJ")
        .withFormNumber("WC 29 03 09A")
        .withEdition("07 05")
        .withDescription("Limited Other States Insurance Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NJ", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_30_06_01_NM")
        .withFormNumber("WC 30 06 01")
        .withEdition("01 90")
        .withDescription("Cancelation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NM", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_31_03_08_NY")
        .withFormNumber("WC 31 03 08")
        .withEdition("04 84")
        .withDescription("Limit of Liability Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_32_03_01B_NC")
        .withFormNumber("WC 32 03 01B")
        .withEdition("00 00")
        .withDescription("Amended Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "NC", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_34_03_01B_OH")
        .withFormNumber("WC 34 03 01B")
        .withEdition("00 00")
        .withDescription("Employers Liability Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OH", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_35_03_02_OK")
        .withFormNumber("WC 35 03 02")
        .withEdition("00 00")
        .withDescription("Employers Liability Amended Coverage Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_35_06_03_OK")
        .withFormNumber("WC 35 06 03")
        .withEdition("00 00")
        .withDescription("Fraud Warning Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_36_03_06_OR")
        .withFormNumber("WC 36 03 06")
        .withEdition("01 05")
        .withDescription("Limits of Liability Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_36_06_01D_OR")
        .withFormNumber("WC 36 06 01D")
        .withEdition("08 99")
        .withDescription("Cancellation Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "OR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_37_06_01_PA")
        .withFormNumber("WC 37 06 01")
        .withEdition("00 00")
        .withDescription("Special Endorsement-Inspection of Manuals")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "PA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_37_06_02_PA")
        .withFormNumber("WC 37 06 02")
        .withEdition("00 00")
        .withDescription("Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "PA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_37_06_03A_PA")
        .withFormNumber("WC 37 06 03A")
        .withEdition("00 00")
        .withDescription("Act 86-1986 Endorsement/Nonrenewal, Notice of Increase of Premium, and Return of Unearned Premium")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "PA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_37_06_04_PA")
        .withFormNumber("WC 37 06 04")
        .withEdition("00 00")
        .withDescription("Employer Assessment Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "PA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_38_06_01_RI")
        .withFormNumber("WC 38 06 01")
        .withEdition("00 00")
        .withDescription("Direct Liability Statute Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "RI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_40_06_05A_SD")
        .withFormNumber("WC 40 06 05A")
        .withEdition("07 05")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "SD", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_42_03_01F_TX")
        .withFormNumber("WC 42 03 01F")
        .withEdition("01 00")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "TX", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_43_06_02_UT")
        .withFormNumber("WC 43 06 02")
        .withEdition("07 05")
        .withDescription("Cancellation Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "UT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_44_06_01_VT")
        .withFormNumber("WC 44 06 01")
        .withEdition("00 00")
        .withDescription("Law Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "VT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_44_06_02A_VT")
        .withFormNumber("WC 44 06 02A")
        .withEdition("09 91")
        .withDescription("Cancelation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "VT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_45_06_02_VA")
        .withFormNumber("WC 45 06 02")
        .withEdition("00 00")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "VA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_48_03_01B_WI")
        .withFormNumber("WC 48 03 01B")
        .withEdition("09 90")
        .withDescription("Limited Other States Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "WI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_48_06_01C_WI")
        .withFormNumber("WC 48 06 01C")
        .withEdition("04 05")
        .withDescription("Law Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "WI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_48_06_06B_WI")
        .withFormNumber("WC 48 06 06B")
        .withEdition("01 05")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "WI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_49_03_01_WY")
        .withFormNumber("WC 49 03 01")
        .withEdition("07 92")
        .withDescription("Amendatory Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "WY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_52_06_02_HI")
        .withFormNumber("WC 52 06 02")
        .withEdition("00 00")
        .withDescription("Notification Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "HI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_54_06_02_AK")
        .withFormNumber("WC 54 06 02")
        .withEdition("00 00")
        .withDescription("Cancellation and Nonrenewal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "AK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_89_06_00_US")
        .withFormNumber("WC 89 06 00")
        .withEdition("04 92")
        .withDescription("Policy Information Page Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(2)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_89_06_00_US
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_89_06_09B_MN")
        .withFormNumber("WC 89 06 09B")
        .withEdition("07 96")
        .withDescription("Policy Termination/Cancellation/Reinstatement Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(-1)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, "MN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_89_06_14_US")
        .withFormNumber("WC 89 06 14")
        .withEdition("04 92")
        .withDescription("Removal Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(3)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(true)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericRemovalEndorsementForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_89_06_15_US")
        .withFormNumber("WC 89 06 15")
        .withEdition("04 92")
        .withDescription("Removal and Replacement Endorsement")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(3)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(true)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericRemovalAndReplacementEndorsementForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_Cancelation")
        .withFormNumber("WC Cancelation Notice")
        .withDescription("WC Cancelation Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(2)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Cancellation")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 1, 2008), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_Payment_Info")
        .withFormNumber("WC Payment Info Sheet")
        .withEdition("00 01")
        .withDescription("WC Payment Info Sheet")
        .withInferenceTime("bind")
        .withEndorsementNumbered(false)
        .withPriority(2)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 1, 2008), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(true)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.wc.forms.Form_WC_Payment_Info
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("WC_Reinstatement")
        .withFormNumber("WC Reinstatement Notice")
        .withDescription("WC Reinstatement Notice")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(2)
        // Products
        .withProduct("WorkersComp")
        // Jobs
        .withJob("Reinstatement")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 1, 2008), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("WorkersCompLine")
        .create(bundle)

    })
  }

}
