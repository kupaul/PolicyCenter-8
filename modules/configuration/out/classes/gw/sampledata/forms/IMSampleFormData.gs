package gw.sampledata.forms
uses gw.api.builder.FormPatternBuilder
uses gw.api.util.DateUtil
uses gw.transaction.Transaction

/**
 * A set of sample form patterns for PolicyCenter's out-of-the-box IMLine.
 */
@Export
class IMSampleFormData extends AbstractSampleFormData {

  construct() {
  }

  override property get CollectionName() : String {
    return "IMLine Forms"
  }

  override property get AlreadyLoaded() : boolean {
    return formPatternLoaded("IM00SF")
  }

  override function load() {
    Transaction.runWithNewBundle(\bundle -> {
      new FormPatternBuilder()
        // Basics
        .withCode("IM00SF")
        .withFormNumber("IM 00 SF")
        .withEdition("01 00")
        .withDescription("Signs Coverage Form")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(0)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
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
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")  // custom_form_inference: gw.lob.im.forms.Form_IM_Sign_IM00SF
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM01010904_55")
        .withFormNumber("IM0101")
        .withEdition("0904")
        .withDescription("COMMERCIAL INLAND MARINE CONDITIONS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2004), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM01020900_52")
        .withFormNumber("IM0102")
        .withEdition("0900")
        .withDescription("COMMERCIAL INLAND MARINE COVERAGE PART DECLARATIONS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, null, null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03281185_FL")
        .withFormNumber("IM0328")
        .withEdition("1185")
        .withDescription("CHANGES - WARRANTIES - FLORIDA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(11, 1, 1985), null, "FL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03291185_PR")
        .withFormNumber("IM0329")
        .withEdition("1185")
        .withDescription("CHANGES - APPRAISAL - PUERTO RICO")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(11, 1, 1985), null, "PR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03301006_NC")
        .withFormNumber("IM0330")
        .withEdition("1006")
        .withDescription("CHANGES - NORTH CAROLINA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(10, 1, 2006), null, "NC", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03310101_WI")
        .withFormNumber("IM0331")
        .withEdition("0101")
        .withDescription("CHANGES - WISCONSIN")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2001), null, "WI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03320902_WV")
        .withFormNumber("IM0332")
        .withEdition("0902")
        .withDescription("CHANGES - WEST VIRGINIA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2002), null, "WV", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03330309_WA")
        .withFormNumber("IM0333")
        .withEdition("0309")
        .withDescription("CHANGES - WASHINGTON")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(3, 1, 2009), null, "WA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03340900_WY")
        .withFormNumber("IM0334")
        .withEdition("0900")
        .withDescription("CHANGES - LEGAL ACTION AGAINST US AND LOSS PAYMENT - WYOMING")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "WY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03350701_MI")
        .withFormNumber("IM0335")
        .withEdition("0701")
        .withDescription("CHANGES - MICHIGAN")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(7, 1, 2001), null, "MI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03360900_TX")
        .withFormNumber("IM0336")
        .withEdition("0900")
        .withDescription("CHANGES - TEXAS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "TX", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03370900_UT")
        .withFormNumber("IM0337")
        .withEdition("0900")
        .withDescription("CHANGES - UTAH")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "UT", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03380900_FL")
        .withFormNumber("IM0338")
        .withEdition("0900")
        .withDescription("CHANGES - LOSS PAYMENT - FLORIDA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "FL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03390904_MN")
        .withFormNumber("IM0339")
        .withEdition("0904")
        .withDescription("CHANGES - MINNESOTA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2004), null, "MN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03400405_MO")
        .withFormNumber("IM0340")
        .withEdition("0405")
        .withDescription("CHANGES - MISSOURI")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 1, 2005), null, "MO", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03410900_SC")
        .withFormNumber("IM0341")
        .withEdition("0900")
        .withDescription("CHANGES - LEGAL ACTION AGAINST US - SOUTH CAROLINA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "SC", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03420707_AK")
        .withFormNumber("IM0342")
        .withEdition("0707")
        .withDescription("CHANGES - ALASKA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(7, 1, 2007), null, "AK", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03430700_NE")
        .withFormNumber("IM0343")
        .withEdition("0700")
        .withDescription("CHANGES - NEBRASKA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(7, 1, 2000), null, "NE", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03440808_LA")
        .withFormNumber("IM0344")
        .withEdition("0808")
        .withDescription("CHANGES - LOUISIANA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(8, 1, 2008), null, "LA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03450900_NH")
        .withFormNumber("IM0345")
        .withEdition("0900")
        .withDescription("CHANGES - LOSS PAYMENT - NEW HAMPSHIRE")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "NH", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03460399_IL")
        .withFormNumber("IM0346")
        .withEdition("0399")
        .withDescription("CHANGES - INTENTIONAL ACTS - ILLINOIS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(3, 1, 1999), null, "IL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03470399_HI")
        .withFormNumber("IM0347")
        .withEdition("0399")
        .withDescription("CHANGES - INTENTIONAL ACTS - HAWAII")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(3, 1, 1999), null, "HI", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03481099_ND")
        .withFormNumber("IM0348")
        .withEdition("1099")
        .withDescription("CHANGES - INTENTIONAL ACTS - NORTH DAKOTA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(10, 1, 1999), null, "ND", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03490300_NM")
        .withFormNumber("IM0349")
        .withEdition("0300")
        .withDescription("CHANGES - INTENTIONAL ACTS - NEW MEXICO")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(3, 1, 2000), null, "NM", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03500900_IN")
        .withFormNumber("IM0350")
        .withEdition("0900")
        .withDescription("CHANGES - RIGHTS OF RECOVERY - INDIANA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "IN", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03510408_OH")
        .withFormNumber("IM0351")
        .withEdition("0408")
        .withDescription("CHANGES - OHIO")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(4, 1, 2008), null, "OH", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03520900_KY")
        .withFormNumber("IM0352")
        .withEdition("0900")
        .withDescription("CHANGES - KENTUCKY")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2000), null, "KY", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03531200_GA")
        .withFormNumber("IM0353")
        .withEdition("1200")
        .withDescription("CHANGES - GEORGIA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(12, 1, 2000), null, "GA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03540604_AZ")
        .withFormNumber("IM0354")
        .withEdition("0604")
        .withDescription("CHANGES - ARIZONA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(6, 1, 2004), null, "AZ", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03550508_AL")
        .withFormNumber("IM0355")
        .withEdition("0508")
        .withDescription("CHANGES - ALABAMA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(5, 1, 2008), null, "AL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03561102_PA")
        .withFormNumber("IM0356")
        .withEdition("1102")
        .withDescription("CHANGES - EXCLUSION OF TERRORISM FIRE LOSSES - PENNSYLVANIA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(11, 1, 2002), null, "PA", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03570108_NH")
        .withFormNumber("IM0357")
        .withEdition("0108")
        .withDescription("SPECIAL PROVISIONS ENDORSEMENT - NEW HAMPSHIRE")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2008), null, "NH", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03580108_OR")
        .withFormNumber("IM0358")
        .withEdition("0108")
        .withDescription("SPECIAL PROVISIONS ENDORSEMENT - OREGON")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2008), null, "OR", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03590105_KS")
        .withFormNumber("IM0359")
        .withEdition("0105")
        .withDescription("CHANGES - KANSAS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(1, 1, 2005), null, "KS", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03600705_IL")
        .withFormNumber("IM0360")
        .withEdition("0705")
        .withDescription("CHANGES - ILLINOIS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(7, 1, 2005), null, "IL", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03610902_SD")
        .withFormNumber("IM0361")
        .withEdition("0902")
        .withDescription("CHANGES - SOUTH DAKOTA")
        .withInferenceTime("quote")
        .withEndorsementNumbered(true)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(9, 1, 2002), null, "SD", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

      new FormPatternBuilder()
        // Basics
        .withCode("IM03621185_TX")
        .withFormNumber("IM0362")
        .withEdition("1185")
        .withDescription("INLAND MARINE APPLICATION - TEXAS")
        .withInferenceTime("quote")
        .withEndorsementNumbered(false)
        .withPriority(1)
        // Products
        .withProduct("CommercialPackage")
        .withProduct("InlandMarine")
        // Jobs
        .withJob("Submission")
        .withJob("Renewal")
        .withJob("Rewrite")
        .withJob("PolicyChange")
        // Jurisdictions
        .withLookup(true, DateUtil.createDateInstance(11, 1, 1985), null, "TX", null)
        // Policy Change
        .withInternalRemovalEndorsement(false)
        .withInternalReissueOnChange(false)
        // Inference
        .withGenericInferenceClass("gw.forms.generic.GenericAlwaysAddedForm")
        .withPolicyLinePatternCode("IMLine")
        .create(bundle)

    })
  }

}
