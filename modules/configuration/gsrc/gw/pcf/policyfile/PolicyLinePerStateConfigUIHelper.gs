package gw.pcf.policyfile

uses gw.lob.wc.rating.WCRatingPeriod
uses gw.api.util.DateUtil
uses gw.api.productmodel.ModifierPattern

@Export
class PolicyLinePerStateConfigUIHelper {

  public static function getUnsplitModifiers(ratingPeriods : List<WCRatingPeriod>, allModifierVersions : List<WCModifier>) : List<Modifier>{
    if (ratingPeriods.Count > 1) {
      return allModifierVersions.where( \ mod -> not (mod.Pattern as ModifierPattern).SplitOnAnniversary)
    } else {
      return allModifierVersions
    }
  }

  public static function getSplitModifiers(allModifierVersions : List<WCModifier>, start : java.util.Date, end : java.util.Date) : List<Modifier>{
    return allModifierVersions.where( \ m -> (m.Pattern as ModifierPattern).SplitOnAnniversary
        and DateUtil.compareIgnoreTime(m.EffectiveDate, start) == 0
        and DateUtil.compareIgnoreTime(m.ExpirationDate, end) == 0 )
  }

  public static function validateAnniversaryDate(jurisdiction : WCJurisdiction, date: java.util.Date): String {
    var policyPeriod = jurisdiction.Branch
    if (date > policyPeriod.PeriodStart) {
      return displaykey.Web.SubmissionWizard.PolicyInfo.AnniversaryDate.Error1
    } else if (!(date > policyPeriod.PeriodStart.addYears(-1))) {
      return displaykey.Web.SubmissionWizard.PolicyInfo.AnniversaryDate.Error2
    }
    return null
  }

}