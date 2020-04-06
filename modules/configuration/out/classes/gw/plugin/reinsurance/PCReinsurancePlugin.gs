package gw.plugin.reinsurance

uses gw.api.database.Query

uses gw.pl.currency.MonetaryAmount
uses gw.api.system.PCDependenciesGateway
uses gw.api.reinsurance.RIAttachment
uses gw.api.reinsurance.RIRiskVLFinder
uses gw.api.util.MonetaryAmounts
uses gw.api.util.Logger
uses gw.api.validation.EntityValidation
uses gw.api.web.util.PCCurrencyAmountUtil
uses gw.reinsurance.NullSafeMath
uses gw.reinsurance.agreement.RIAgreementInfo
uses gw.reinsurance.risk.RIRiskInfo
uses gw.reinsurance.risk.RIRiskValidation
uses gw.plugin.Plugins
uses gw.validation.PCValidationContext

uses java.util.ArrayList
uses java.math.BigDecimal
uses java.util.Date
uses java.util.HashSet

@Export
class PCReinsurancePlugin implements IReinsurancePlugin {

  var _logger = Logger.forCategory("IReinsurancePlugin")

  construct() {
  }

   override function attachRisk(reinsurable : Reinsurable) {
    // Find or create version list & container, copying version list from previous if available
    var risk = findOrCreateRIRisk(reinsurable, reinsurable.Branch)
    computeAttachments(reinsurable, risk)
  }

   override function reattachRisk(reinsurable : Reinsurable) {
    var ririsk = reinsurable.RIRisk
    computeAttachments(reinsurable, ririsk)
    ririsk.updateAttachments()
   }

  override function detachRisk(reinsurable : Reinsurable, branch : PolicyPeriod) {
    var versionList = findOrCreateVersionList(reinsurable, branch)
    _logger.info("Removing ${reinsurable}")
    versionList.endDate(branch.EditEffectiveDate)
  }

  override function validateRisk(reinsurable : Reinsurable, level : ValidationLevel) : EntityValidation[] {
    var context = new PCValidationContext(level)
    var ririsk = reinsurable.RIRisk
    if (ririsk <> null) {
       ririsk.VersionList.AllVersions.each( \ r -> new RIRiskValidation(context, r).validate())
    }
    return context.Result.EntityValidations
  }

   override function postApplyChangesFromBranch(policyPeriod : PolicyPeriod) {
    // for the case when this branch is a renewal and a changes to remove a reinsurable is applied to this branch
    // then the list of reinsurables does not contains the removed one, we have to look at the list of ririsk to know
    // which one is removed
    var riskNumbers = policyPeriod.AllReinsurables*.RiskNumber
    for (versionList in policyPeriod.RIRiskVersionLists) {
      var riskNumber = versionList.RiskNumber
      if (not riskNumbers.contains(riskNumber)) {
        versionList.endDate(policyPeriod.EditEffectiveDate)
      }
    }
  }

  override function bindBranch(branch : PolicyPeriod) {
    // re-denormalize AccountLocation on all LocationRisks
    for (lr in branch.LocationRisks) {
      lr.AccountLocation = lr.Location.AccountLocation
    }

    branch.RIRiskVersionLists.each(\ versionList -> {
      _logger.info("Binding ${versionList}")
      // PL-14391 - Don't add if already in Bundle; if modified it throws error...
      var vl =
        ( branch.Bundle != versionList.Bundle )
          ? branch.Bundle.add(versionList) : versionList

      if (vl.AllVersions.HasElements) {
        var ririsk = vl.AllVersions.first()
        computeAttachments(ririsk.Reinsurable, ririsk)
        ririsk.updateAttachments()
      }
      vl.makeActive()
    })
    // Implicitly activate Draft Fac agreements.   If there are failures, create a review
    // activity associated with the Job.
    try {
      branch.activateDraftFacAgreements()
    } catch (e : EntitiesValidationException) {
        var activity = branch.Job.createRoleActivity(TC_UNDERWRITER,
                    ActivityPattern.finder.getActivityPatternByCode("activate_fac"),
                    displaykey.Reinsurance.Activity.FacActivate.Subject,
                    displaykey.Reinsurance.Activity.FacActivate.Description)
    }
  }

  override function withdrawBranch(branch : PolicyPeriod) {
    branch.RIRiskVersionLists.each(\ versionList -> {
      _logger.info("Withdrawing ${versionList}")
      versionList.remove()
    })
  }

  override function isContactDeletable(contact : Contact) : boolean {
    var agreementParticipantQuery = new Query(AgreementParticipant)
     .compare("Participant", Equals, contact)
     .select()
    if (agreementParticipantQuery.HasElements) {
      return false
    }
    var agreementBrokerQuery = new Query(RIAgreement)
     .compare("Broker", Equals, contact)
     .select()
    return agreementBrokerQuery.Empty
  }

  override function getLocationRiskGroup(risk : Reinsurable) : String {
    return risk.RIRisk.LocationRiskGroup
  }

  override function setLocationRiskGroup(risk : Reinsurable, locationRiskGroup : String) {
    risk.RIRisk.LocationRiskGroup = locationRiskGroup
  }

  override function getRisksInALocationRiskGroup(locationRiskGroup : String, date : Date) : List<String> {
    if (locationRiskGroup?.trim()?.length() == 0) {
      return {}
    } else {
      var query = Query.make(RIRiskVersionList)
      query.join(RIRisk, "VersionList")
              .compare("EffectiveDate", LessThanOrEquals, date)
              .compare("ExpirationDate", GreaterThan, date)
              .startsWith("LocationRiskGroup", locationRiskGroup, true)

      return query.withDistinct(true).select(\ r -> r.RiskNumber).toList()
    }
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //

  private function computeAttachments(reinsurable : Reinsurable, risk : RIRisk) {
    // always look for policy attachments at period start
    var finder = PCDependenciesGateway.getRIProgramFinder()
    var program = finder.findProgramForReinsurableAtDate(reinsurable, risk.VersionList.PolicyPeriod.PeriodStart)

    // Remove unneeded attachments after copying from previous version list;
    // fix up program attachments in existing splits; and ensure that there are split points
    // at the program change dates.
    splitRiskAtProgramBoundaries(reinsurable, program)
  }

  /**
   * Attach a risk to its policy attachment program.
   */
  private function attachToProgram(risk : RIRisk, program : RIProgram) : List<RIAgreement> {
    var agreements = program.PolicyAttachmentTreaties
    for (agreement in agreements) {
      risk.attach(agreement, program)
    }
    risk.PolicyAttachmentProgram = program
    return agreements
  }

  private function replacePolicyAttachments(risk : RIRisk, program : RIProgram) {
    var attachmentsToRemove = risk.PolicyAttachments == null ?  new ArrayList<RIPolicyAttachment>() : risk.PolicyAttachments.toList()
    attachmentsToRemove.removeWhere(\ r -> r.Agreement typeis Facultative
                                           or r.InclusionType == TC_EXCLUDED
                                           or r.InclusionType == TC_SPECIALACCEPTANCE)
    var oldProgram = risk.PolicyAttachmentProgram
    var addedAgreements = attachToProgram(risk, program)
    for (agreement in addedAgreements) {
      attachmentsToRemove.removeWhere(\ r -> r.Agreement == agreement)
    }
    attachmentsToRemove.each(\ attachment -> risk.detach(attachment))
    if (risk.PolicyAttachmentProgram <> oldProgram) { // change program, reset gross retention
      risk.GrossRetention = risk.DefaultGrossRetention
      risk.DefaultRetentionFromProgram = risk.GrossRetention
    }
  }

  private function splitRiskAtProgramBoundaries(reinsurable : Reinsurable, paProgram : RIProgram) {
    // we put program dates into the splitDates set.  We need to remove anything
    // that is outside the range of the policy period, so set up clip dates.
    var startDate = reinsurable.Branch.PeriodStart
    var endDate = reinsurable.Branch.PeriodEnd
    var finder = PCDependenciesGateway.getRIProgramFinder()

    // we will filter these later.   They must ONLY be used to generate possible split dates;
    // it is a mistake to assign programs directly from this list.
    var possiblePrograms =
        finder.findApplicablePrograms(reinsurable, startDate, endDate)
        .toList()
        .sortBy(\ p -> p.EffectiveDate)

    if (possiblePrograms.Empty or possiblePrograms.first().EffectiveDate > startDate) {
      possiblePrograms.add(0, finder.findProgramForReinsurableAtDate(reinsurable, startDate))
    }

    // Seems we need to process each version of reinsurable.
    for (version in reinsurable.VersionList.AllVersions) {
      version = version.getSlice(version.EffectiveDate)
      var splitDates = possiblePrograms
        .flatMap(\ p -> {return {p.EffectiveDate, p.ExpirationDate}})
        .where(\ d -> d != null && version.EffectiveDate != null && version.ExpirationDate != null &&
                      d >= version.EffectiveDate && d < version.ExpirationDate)
        .toSet()
      var datesSeen = new HashSet<Date>()

      var r = version.RIVersionList.AllVersions.first()
      // this automatically propagates down the RIVersionList...
      replacePolicyAttachments(r, paProgram)

      // ... but it's necessary to process each slice individually in order to
      // record the split date and set LossDateAttachmentProgram.
      for (risk in version.RIVersionList.AllVersions) {
        datesSeen.add(risk.EffectiveDate)

        // must always go through this finder call to filter down to the correct, single program
        var pgm = finder.findProgramForReinsurableAtDate(reinsurable, risk.EffectiveDate)
        risk.LossDateAttachmentProgram = pgm
      }

      // don't try to split again if there's already a split at the necessary point
      splitDates.removeAll(datesSeen)

      // If there are different possible programs with disparate start/end dates, this may result
      // in extra splits. E.g. imagine that the normal reinsurance year runs Jan-Jan
      // while we have some "special" program that runs Apr-Apr.  The list of "possible" programs
      // could contain both Jan-Jan programs and the Apr-Apr program, resulting in spits in January
      // and April even though one of them may not apply.
      for (d in splitDates) {
        var versionList = version.RIVersionList
        var risk = versionList.addVersion(d)

        // must always go through this finder call to filter down to the correct, single program
        var pgm = finder.findProgramForReinsurableAtDate(reinsurable, risk.EffectiveDate)
        risk.LossDateAttachmentProgram = pgm
      }
    }
  }

  /**
   * Find the risk; if it doesn't exist, create it.
   * Adjust the effective window of the risk to fit the reinsurable risk.
   */
  private function findOrCreateRIRisk(reinsurable : Reinsurable, branch : PolicyPeriod) : RIRisk {
    var versionList = findOrCreateVersionList(reinsurable, branch)
    reinsurable.VersionList.AllVersions.each(\ version -> {
      _logger.info("Adding new version for ${version}")
      var riVersion = versionList.addVersion(version.EffectiveDate)
      riVersion.TotalInsuredValue = MonetaryAmounts.roundToCurrencyScaleNullSafe(version.TotalInsuredValue)
      if (riVersion.ExpirationDate == null) {
        //needs to be entire length of version list to handle case if reinsurable was sliced for rewrite to new account
        riVersion.ExpirationDate = version.VersionList.AllVersions*.ExpirationDate.max()
      }
      version.RiskNumber = versionList.RiskNumber
    })
    // Add a temporary slice for the RI risk as of the edit effective date so that user can edit the RI risk as of this date.
    // This version will be merged back to the previous version when binding the version list if there is no changes.
    var dateToAddVersion = versionList.EditEffectiveDate
    if ((reinsurable.BranchUntyped as PolicyPeriod).Job.OOSJob and reinsurable.EffectiveDate.after(versionList.EditEffectiveDate)) {
      dateToAddVersion = reinsurable.EffectiveDate
    }
    return versionList.addVersion(dateToAddVersion)
  }

  /**
   * Find the version list; if it doesn't exist, create it.
   * Adjust the effective window to fit the reinsurable risk.
   */
  private function findOrCreateVersionList(reinsurable : Reinsurable, branch : PolicyPeriod) : RIRiskVersionList {
    var versionList = branch.RIRiskVersionLists.firstWhere(\ r -> r.RiskNumber == reinsurable.RiskNumber )
    if(versionList == null){
      var riskNumber = reinsurable.RiskNumber
      if (riskNumber == null) {
         riskNumber = generateRiskNumber(reinsurable)
      }
      versionList = RIRiskVLFinder.getVersionListForBranch(riskNumber, reinsurable.Bundle, branch)
      if (versionList == null) {
        _logger.info("Creating new VersionList for ${reinsurable}, and branch ${branch}")
        versionList = RIRiskVLFinder.addVersionList(riskNumber, reinsurable.Bundle, branch)
      }
    }
    var start = {branch.PeriodStart, reinsurable.EarliestEffectiveDate}.max()
    var end = {branch.PeriodEnd, reinsurable.LatestExpirationDate}.min()
    versionList.setEffectiveWindow(start, end)
    versionList.EditEffectiveDate = branch.EditEffectiveDate
    versionList.CancellationDate = branch.CancellationDate
    return versionList
  }

  private function generateRiskNumber(reinsurable : Reinsurable) : String {
    _logger.info("Creating new risk number for ${reinsurable}")
    var plugin = Plugins.get(IReinsuranceConfigPlugin)
    return plugin.generateRiskNumber()
  }

  override function findReinsuranceRiskInfo(risks : Reinsurable[], riCovGroup : RICoverageGroupType, date : Date) : IRIRiskInfo {
    if (risks == null or risks.where(\ r -> r.CoverageGroup == riCovGroup).IsEmpty) {
      return null
    }

    var risk = risks.singleWhere(\ r -> r.CoverageGroup == riCovGroup)
    var ririsk = risk.RIRisk

    //bundle needed for creating ririsk loss date attachments which are nonpersisted entities
    var riskInfo : RIRiskInfo
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var localRIRisk = bundle.add(ririsk)
      riskInfo = createRIRiskInfo(localRIRisk, date)
    })
    return riskInfo
  }

  /**
   * mapping agreement information from reinsurance agreement implementation to RIAgreementInfo
   * attachments that cede in nonsequential layers because of coverage overlaps are returned as multiple RIAgreementInfo objects
   * with different attachment points and coverage limits
   */
  protected function createRIAgreementInfo(attachment : RIAttachment) : List<RIAgreementInfo> {
    var agreementLayers = new ArrayList<RIAgreementInfo>()
    if (attachment.Agreement typeis FacProportionalRIAgreement) { //fac proportional agreements dont have coverage layers
      agreementLayers.add(createRIAgreementInfoLayer(null, null, attachment))
    } else if (attachment.Agreement typeis AnnualAggregateRITreaty or attachment.Agreement typeis PerEventRITreaty) {
      agreementLayers.add(createRIAgreementInfoLayer(attachment.Agreement.AttachmentPoint, attachment.Agreement.CoverageLimit, attachment))
    } else {
      attachment.CoverageLayers.each(\ p -> {
        agreementLayers.add(createRIAgreementInfoLayer(p.Start, p.End, attachment))
      })
    }
    return agreementLayers
  }

  private function createRIAgreementInfoLayer(attachmentPoint : MonetaryAmount, coverageLimit : MonetaryAmount, attachment : RIAttachment) : RIAgreementInfo {
    var agreementInfo = new RIAgreementInfo()
    var agreement = attachment.Agreement

    agreementInfo.AgreementNumber = agreement.AgreementNumber
    agreementInfo.Name = agreement.Name
    agreementInfo.Type = agreement.Subtype
    agreementInfo.Currency = agreement.Currency
    agreementInfo.AttachmentPoint = attachmentPoint
    agreementInfo.TopOfLayer = coverageLimit
    agreementInfo.EffectiveDate = agreement.EffectiveDate
    agreementInfo.ExpirationDate = agreement.ExpirationDate
    agreementInfo.Comments = agreement.Comments
    agreementInfo.CededShare = agreement.CededShare

    if (agreement typeis NonProportionalRIAgreement) {
      agreementInfo.AttachmentPointIndexed = agreement.AttachmentIndexed
      agreementInfo.TopOfLayerIndexed = agreement.LimitIndexed
      agreementInfo.RecoveryLimit = PCCurrencyAmountUtil.calculatePercentage(NullSafeMath.nsSub(agreementInfo.TopOfLayer, agreementInfo.AttachmentPoint), agreementInfo.CededShare)
    } else { //proportional
      agreementInfo.RecoveryLimit = attachment.CededRisk
      agreementInfo.ProportionalPercentage = attachment.ProportionalPercentage
    }

    if (agreement typeis PerRisk) {
      agreementInfo.NotificationThreshold = agreement.NotificationThreshold
    }

    if (agreement typeis Facultative) {
      agreementInfo.Draft = agreement.Status == TC_DRAFT
    } else { //treaty
      agreementInfo.Draft = attachment.Program.Status == TC_DRAFT
    }
    return agreementInfo
  }

  /**
   * mapping risk information from reinsurance risk implementation to RIRiskInfo
   */
  protected function createRIRiskInfo(riRisk : RIRisk, date : Date) : RIRiskInfo {
    var riskInfo = new RIRiskInfo()

    riskInfo.RIRiskID = riRisk.VersionList.RiskNumber
    riskInfo.Description = displaykey.Web.Reinsurance.ReinsurableRisk.Description(riRisk.Reinsurable.CoverageGroup.DisplayName, riRisk.Reinsurable.DisplayName)

    var includedAgreements = new ArrayList<RIAgreementInfo>()

    riRisk.getAttachmentsForLoss(date).each(\ a -> {
      if (include_attachment(a)) {
        var agreementInfo = createRIAgreementInfo(a)
        includedAgreements.addAll(agreementInfo)
      }
    })
    riskInfo.Agreements = includedAgreements.toTypedArray()

    return riskInfo
  }

  //exclude excluded attachments, proportional agreemnts that are not ceded to, and projected attachments
  private function include_attachment(attachment : RIAttachment) : boolean {
    return not attachment.IsProjected
       and attachment.InclusionType != TC_EXCLUDED
       and (not (attachment.Agreement typeis ProportionalRIAgreement) or attachment.ProportionalPercentage > BigDecimal.ZERO)
  }
}
