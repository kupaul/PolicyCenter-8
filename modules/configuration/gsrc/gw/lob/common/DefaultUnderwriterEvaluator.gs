package gw.lob.common

uses gw.api.webservice.exception.SOAPServerException
uses gw.losshistory.ClaimSearchCriteria
uses gw.policy.PolicyEvalContext
uses gw.plugin.Plugins
uses gw.plugin.claimsearch.IClaimSearchPlugin
uses gw.plugin.claimsearch.NoResultsClaimSearchException
uses gw.plugin.claimsearch.ResultsCappedClaimSearchException
uses gw.question.QuestionIssueAutoRaiser
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

@Export
class DefaultUnderwriterEvaluator extends AbstractUnderwriterEvaluator {

  construct(policyEvalContext : PolicyEvalContext) {
    super(policyEvalContext)
  }

  override function onDefault() {
    quoteHasManualOverrides()
    policyHold()
  }

  override function onPrequote() {
    periodStartAndEndDates()
    underwritingCompanySegmentNotValid()
    sumOfPreQuoteRiskFactor()
    producerChanged()
  }

  override function onQuestion() {
    QuestionIssueAutoRaiser.autoRaiseIssuesForQuestions(_policyEvalContext)
  }

  override function onReferral() {
    var allReferralReasons = _policyEvalContext.Period.Policy.UWReferralReasons
    var openReferralReasons = allReferralReasons.where(\ referral -> referral.Open)
    for (referralReason in openReferralReasons) {
      var issue = _policyEvalContext.addIssue(
        referralReason.IssueType.Code,
        referralReason.IssueKey,
        \ -> referralReason.ShortDescription,
        \ -> referralReason.LongDescription
      )
      issue.Value = referralReason.Value
    }
  }

  override function onReinsurance()  {
    var period = _policyEvalContext.Period
    var nextOOSSliceDate = period.Policy.BoundEditEffectiveDates.firstWhere(\ d -> d > period.SliceDate)
    // There may be more slices of RIRisk than OOSSlice (because of auto splitting on
    // program end for example. So we need to find those slices of RIRisk and
    // evaluate them.
    var allRIRiskVersions = period.AllReinsurables*.RIVersionList*.AllVersions.where( \ ririsk -> ririsk.EffectiveDate >= period.SliceDate
        and (nextOOSSliceDate == null or ririsk.EffectiveDate < nextOOSSliceDate))

    allRIRiskVersions.each( \ ririsk -> {
      checkTargetNetRetention(ririsk)
      checkFacNotCededTo(ririsk)
      checkAttachmentNotCededToCapacity(ririsk)
    })
  }

  private function checkTargetNetRetention(ririsk : RIRisk) {
    var risk = ririsk.Reinsurable
    var facRINeeded = ririsk.FacRINeeded
    if (facRINeeded.IsPositive) {
      var shortDescription = displaykey.UWIssue.Reinsurance.NetRetentionGreaterThanTarget.ShortDesc
      var longDescription = displaykey.UWIssue.Reinsurance.NetRetentionGreaterThanTarget.LongDesc(risk, CurrencyUtil.renderAsCurrency(facRINeeded))
      _policyEvalContext.addIssue("RINetRetention", risk.UWIssueKey, \-> shortDescription, \->longDescription, ririsk.NetRetention)
    }
  }

  private function checkFacNotCededTo(ririsk : RIRisk) {
    var nonCededFacs = ririsk.Attachments.FacAgreements.where( \ fac -> fac.CededRisk.IsZero)
    if (nonCededFacs.HasElements) {
      var agreementsDisplay = nonCededFacs*.Agreement*.Name.toList()
//      nonCededFacs.each( \ fac -> {
//        agreementsDisplay += displaykey.Web.Reinsurance.RIRisk.Validation.Agreements(fac.Agreement.Name)
//      })

      var shortDescription = displaykey.Web.Reinsurance.RIRisk.Validation.AgreementsHaveNoCededRiskShort
      var longDescription = displaykey.Web.Reinsurance.RIRisk.Validation.AgreementsHaveNoCededRiskLong(ririsk.Reinsurable, agreementsDisplay)
      _policyEvalContext.addIssue("AgreementsHaveNoCededRisk", ririsk.UWIssueKey, \-> shortDescription, \-> longDescription)
    }
  }

  private function checkAttachmentNotCededToCapacity(ririsk : RIRisk) {
    var attachmentsNotCededToMax = ririsk.Attachments.where( \ att -> att.MaxCeding != null and att.MaxCeding > att.CededRisk)
    if (attachmentsNotCededToMax.HasElements) {
      var agreementsDisplay = attachmentsNotCededToMax*.Agreement*.Name.toList()
//      attachmentsNotCededToMax.each( \ att -> {
//        agreementsDisplay += displaykey.Web.Reinsurance.RIRisk.Validation.Agreements(att.Agreement.Name)
//      })

      var shortDescription = displaykey.Web.Reinsurance.RIRisk.Validation.AgreementsDoNotCedeToCapacityShort
      var longDescription = displaykey.Web.Reinsurance.RIRisk.Validation.AgreementsDoNotCedeToCapacityLong(ririsk.Reinsurable, agreementsDisplay)
      _policyEvalContext.addIssue("AgreementsDoNotCedeToCapacity", ririsk.UWIssueKey, \-> shortDescription, \-> longDescription)
    }
  }

  override function onRenewal() {
    renewalLossClaim()
  }

  /*----------Private Helper Functions----------*/

  private function createClaimTotalIncurred(result : ClaimSet, basedOn : PolicyPeriod) {
    var claimWithMaxCost = result.Claims.maxBy(\ c -> c.TotalIncurred)
    var shortDescription = \ -> displaykey.UWIssue.LossClaims.ClaimTotalIncurred.ShortDesc(claimWithMaxCost.ClaimNumber)
    var longDescription = \ -> displaykey.UWIssue.LossClaims.ClaimTotalIncurred.LongDesc(basedOn.PeriodStart.format("short"), basedOn.EndOfCoverageDate.format("short"), claimWithMaxCost.ClaimNumber, claimWithMaxCost.TotalIncurred)
    _policyEvalContext.addIssue("ClaimTotalIncurred", "ClaimTotalIncurred", shortDescription, longDescription, claimWithMaxCost.TotalIncurred)
  }

  private function createIncidenceOfClaim(totalIncurred : MonetaryAmount, writtenPremium : BigDecimal, claimCount : int, basedOn : PolicyPeriod) {
    var shortDescription = \ -> displaykey.UWIssue.LossClaims.IncidenceOfClaims.ShortDesc
    var longDescription = \ -> displaykey.UWIssue.LossClaims.IncidenceOfClaims.LongDesc(claimCount, basedOn.PeriodStart.format("short"), basedOn.EndOfCoverageDate.format("short"), writtenPremium)
    _policyEvalContext.addIssue("IncidenceOfClaims", "IncidenceOfClaims", shortDescription, longDescription, claimCount)

    if (not totalIncurred.IsZero) {
      // Create RatioOfClaimsTotalIncurredToWrittenPremium
      var value = totalIncurred.divide(writtenPremium, 5, HALF_UP)
      shortDescription = \ -> displaykey.UWIssue.LossClaims.RatioOfClaimsTotalIncurredToWrittenPremium.ShortDesc
      longDescription = \ -> displaykey.UWIssue.LossClaims.RatioOfClaimsTotalIncurredToWrittenPremium.LongDesc(basedOn.PeriodStart.format("short"), basedOn.EndOfCoverageDate.format("short"), totalIncurred, writtenPremium, value.multiply(100))
      _policyEvalContext.addIssue("RatioOfClaimsTotalIncurredToWrittenPremium", "RatioOfClaimsTotalIncurredToWrittenPremium", shortDescription, longDescription, value)
    }
  }

  private function periodStartAndEndDates() {
    if(_policyEvalContext.Period.Job typeis Rewrite and _policyEvalContext.Period.PeriodEnd != _policyEvalContext.Period.BasedOn.PeriodEnd) {
      var period = _policyEvalContext.Period
      var shortDescription = \ -> displaykey.UWIssue.Rewrite.PeriodMismatch.ShortDesc
      var longDescription =
        \ -> displaykey.UWIssue.Rewrite.PeriodMismatch.LongDesc(period.PeriodStart,
            period.PeriodEnd, period.BasedOn.PeriodStart, period.BasedOn.PeriodEnd)
      _policyEvalContext.addIssue("RewritePeriodDates", "RewritePeriodDates",
        shortDescription, longDescription)
    }
  }

  private function policyHold(){
    if(_policyEvalContext.CheckingSet == UWIssueCheckingSet.TC_UWHOLD or
        _policyEvalContext.CheckingSet == UWIssueCheckingSet.TC_REGULATORYHOLD){
          var policyHolds = PolicyHold.finder.findPolicyHolds()
      for(hold in policyHolds) {
        if (hold.IssueType.CheckingSet == _policyEvalContext.CheckingSet) {
          if (hold.compareWithPolicyPeriod(_policyEvalContext.Period)) {
            var bundle = _policyEvalContext.Period.Bundle
            hold = bundle.add(hold)
            hold.updateLastEvalTime(_policyEvalContext.Period.Job, java.util.Date.CurrentDate, _policyEvalContext.Period)
            _policyEvalContext.addIssue(hold.IssueType.Code, hold.PolicyHoldCode, \->hold.Description, \->hold.UWIssueLongDesc)
          }
        }
      }
    }
  }

  private function quoteHasManualOverrides() {
    if(_policyEvalContext.CheckingSet == TC_PreQuoteRelease and _policyEvalContext.Period.hasAtLeastOneCostOverride()) {
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.QuoteHasManualOverrides.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.QuoteHasManualOverrides.LongDesc
      _policyEvalContext.addIssue("QuoteHasManualOverrides", "QuoteHasManualOverrides",
          shortDescription, longDescription)
    }
  }

  private function renewalLossClaim(){
    if (not (_policyEvalContext.Period.Job typeis Renewal)) {
      return
    }

    var renewalPeriod = _policyEvalContext.Period
    var basedOn = renewalPeriod.BasedOn

    try {
      var result = searchForClaims(basedOn)
      var totalIncurred = result.Claims.where(\ c -> c.TotalIncurred != null).sum(_policyEvalContext.Period.PreferredSettlementCurrency, \ c -> c.TotalIncurred)
      var claimCount = result.Claims.Count

      if (not totalIncurred.IsZero) {
        createClaimTotalIncurred(result, basedOn)
      }

      var writtenPremium = basedOn.TotalPremiumRPT
      if (writtenPremium != null and not writtenPremium.IsZero and claimCount != 0 ) {
        createIncidenceOfClaim(totalIncurred, writtenPremium, claimCount, basedOn)
      }
    } catch (ex : NoResultsClaimSearchException) {
      // No actions necessary
    } catch (ex : ResultsCappedClaimSearchException) {
      // Create ManualClaimReviewNeeded
      var shortDescription = \ -> displaykey.UWIssue.LossClaims.ManualClaimReviewNeeded.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.LossClaims.ManualClaimReviewNeeded.LongDesc(basedOn.PeriodStart.format("short"), basedOn.EndOfCoverageDate.format("short"))
      _policyEvalContext.addIssue("ManualClaimReviewNeeded", "ManualClaimReviewNeeded",
          shortDescription, longDescription)
    } catch(ex : SOAPServerException) {
      //Create UnableRetrieveClaimInfo
      var shortDescription = \ -> displaykey.UWIssue.LossClaims.UnableRetrieveClaimInfo.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.LossClaims.UnableRetrieveClaimInfo.LongDesc(basedOn.PeriodStart.format("short"), basedOn.EndOfCoverageDate.format("short"))
      _policyEvalContext.addIssue("UnableRetrieveClaimInfo", "UnableRetrieveClaimInfo",
          shortDescription, longDescription)
    }
  }

  private function searchForClaims(basedOn : PolicyPeriod) : ClaimSet {
    var result : ClaimSet
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var searchCriteria = new ClaimSearchCriteria()
      searchCriteria.Policy = basedOn.Policy
      searchCriteria.DateCriteria.StartDate = basedOn.PeriodStart
      searchCriteria.DateCriteria.EndDate = basedOn.EndOfCoverageDate
      searchCriteria.DateCriteria.DateSearchType = TC_ENTEREDRANGE
      result = Plugins.get(IClaimSearchPlugin).searchForClaims(searchCriteria)
    })
    return result
  }

  private function sumOfPreQuoteRiskFactor() {
    if(_policyEvalContext.Period.Job?.createsNewPolicy() and
        _policyEvalContext.CheckingSet == TC_PreQuote and
        _policyEvalContext.Period.PreQualRiskPointSum >= 100){

      var sum = _policyEvalContext.Period.PreQualRiskPointSum
      _policyEvalContext.addIssue("PreQualQuestionRiskPointSum",
        "PreQualQuestionRiskPointSum",
        \ -> displaykey.UWIssue.Question.PreQualRiskPointSumDescription(sum),
        \ -> displaykey.UWIssue.Question.PreQualRiskPointSumDescription(sum),
        sum)
    }
  }

  private function underwritingCompanySegmentNotValid() {
    if (_policyEvalContext.Period.Job typeis Submission or
          _policyEvalContext.Period.Job typeis Rewrite or
          _policyEvalContext.Period.Job typeis RewriteNewAccount ) {
      var uwcompany = _policyEvalContext.Period.UWCompany
      var polperiod = _policyEvalContext.Period
      var segmentOkay = true
      var uwcompanysegment : typekey.Segment
      if (uwcompany.LicensedStates.Count > 0) {
        uwcompanysegment = uwcompany.LicensedStates
            .firstWhere(\ l -> l.State == polperiod.BaseState ).Segment
        //  if the polperiod segment is low, then any uw company is okay
        if (polperiod.Segment <> "low") {
          // policy segment is not lows so if the uwcompanysegmemnt is low, then problem
          if (uwcompanysegment == "low") {
            segmentOkay = false
          } else {
            // if uw company is high then no problem
            // so only problem is if uw is medium and policy is high
            if (uwcompanysegment == "med" and polperiod.Segment == "high") {
              segmentOkay = false
            }
          }
        }
      }
      if (!segmentOkay) {
        var shortDescription =
            \ -> displaykey.UWIssue.PolicySegment.PolicyRiskSegmentInvalidForUWCompany
        var longDescription =
            \ -> displaykey.UWIssue.PolicySegment.PolicyRiskSegmentValueNotAllowedForUWCompany(polperiod.Segment.DisplayName, uwcompany.DisplayName)
        _policyEvalContext.addIssue("UWCompanySegmentValid", "UWCompanySegmentValid",
            shortDescription, longDescription)
      }
    }
  }

}
