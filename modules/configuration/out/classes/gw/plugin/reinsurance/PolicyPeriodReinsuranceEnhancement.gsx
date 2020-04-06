package gw.plugin.reinsurance

uses java.util.ArrayList
uses gw.reinsurance.agreement.RIAgreementValidation
uses gw.job.JobProcessValidator
uses com.guidewire.pl.system.bundle.validation.EntityValidationException
uses gw.plugin.Plugins
uses gw.api.system.PCLoggerCategory

@Export
enhancement PolicyPeriodReinsuranceEnhancement : entity.PolicyPeriod {

  /**
   * @return all reinsurable risks calculated from this policy period.
   */

  property get AllReinsurables() : List<Reinsurable>{
    var risks = new ArrayList<Reinsurable>()
    risks.addAll(this.LocationRisks.toList())
    risks.addAll(this.PolicyRisks.toList())
    return risks
  }

  /**
   * @returns all reinsurable risks (RIRisk objects) for this policy.
   */
  property get AllRIRisks() : RIRisk[]{
    return AllReinsurables*.RIRisk
  }

  /**
   * @param riskNumber  : The riskNumber of the reinsurable to be retrieved.
   * @return the reinsurable with a matching risk number, or null if no such reinsurable exists.
   */
  function getReinsurable(riskNumber : String) : Reinsurable{
    return this.AllReinsurables.singleWhere(\ r -> r.RiskNumber == riskNumber)
  }


  function updateEditEffectiveDateForReinsurance(sourcePeriod : PolicyPeriod){
    for(risk in sourcePeriod.AllReinsurables){
      var ririsk = risk.RIRisk
      if(ririsk <> null){ // ririsk can be null if this branch has never been quoted
        ririsk.VersionList.PolicyPeriod = this // move ririsk to new branch
        ririsk.VersionList.moveEditEffectiveDate(this.EditEffectiveDate)
      }
    }
  }

  function reevalutateAttachments() {
    this.AllReinsurables.where(\ r -> r.RIRisk != null).each(\ risk -> {
      var dirty = risk.RIRisk.VersionList.AllVersions.reduce(false, \ v, r -> v or r.PolicyAttachmentProgram.RequiresRecalculation or r.LossDateAttachmentProgram.RequiresRecalculation)
      if (dirty) {
        regenerateRisks()
      }
    })
  }

  function regenerateRisks() : PolicyPeriod {
    var periodInBundle : PolicyPeriod
    var plugin = Plugins.get(IReinsurancePlugin)
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      periodInBundle = bundle.add(this)
      periodInBundle.AllReinsurables.each(\ r -> plugin.reattachRisk(r))
    })
    return periodInBundle
  }

  function activateDraftFacAgreements() {
    // implicitly activate Fac agreements if necessary
    var inactiveFacs = this.RIRiskVersionLists*.AllVersions*.Agreements
                      .where(\ f -> f typeis Facultative and not f.Active)

    if (inactiveFacs.HasElements) {
      var exceptionsThrown : List<EntityValidationException> = {}

      inactiveFacs.each(\ f -> {
        //Prevents one invalid fac from stopping valid facs being updated
        try {
          if (this.JobProcess.JobProcessValidator != JobProcessValidator.NO_OP_VALIDATOR) {
            RIAgreementValidation.validateUI(f)
          }
          PCLoggerCategory.REINSURANCE_PLUGIN.info("Activating fac ${f}")
          f.Status = TC_ACTIVE;
          (f as Facultative).recalculateCeding()
        } catch (e : EntityValidationException) {
          exceptionsThrown.add(e)
        }
      })
      if (exceptionsThrown.HasElements) {
        throw new EntitiesValidationException(exceptionsThrown)
      }
    }
  }

  private function copyForwardRIAttachmentInclusions() {
    //copy forwared changed RIAttachmentInclusions if used in different ririskversionlist
    var configPlugin = Plugins.get(IReinsuranceConfigPlugin)
    if (this.AllReinsurables != null and this.BasedOn?.AllReinsurables != null) {
      var newRIRisks = this.AllReinsurables*.RIRisk
      var reinsurablesThatStillExist = this.BasedOn.AllReinsurables.where(\ r -> newRIRisks*.RiskNumber?.contains(r.RiskNumber) )
      var oldRIRisks = reinsurablesThatStillExist*.RIRisk.where(\ r -> r != null)

      oldRIRisks.each(\ oldRisk -> {
        var changedInclusionStatusAttachments = oldRisk.Attachments.where(\ a -> a.InclusionType != configPlugin.getInclusionType(oldRisk, a.Agreement))
        if (changedInclusionStatusAttachments.HasElements) {
          var newRIRisk = newRIRisks.singleWhere(\ risk -> risk.RiskNumber == oldRisk.RiskNumber)
          changedInclusionStatusAttachments.each(\ attachment -> {
            attachment.Agreement.updateInclusion(newRIRisk, attachment.InclusionType)
          })
        }
      })
    }
  }

  private function removeInactiveRiskNumbers(plugin : IReinsurancePlugin)  {
    var activeRiskNumbers = this.AllReinsurables*.RiskNumber.toSet()

      //do not check basedon for rewrite new account because reinsurable will have different
      //risk number and look as if it never existed.  Detaching risk that does not exist results
      //in a versionlist without RIRisks and causes problems
      if(this.BasedOn <> null and this.Job.Subtype != typekey.Job.TC_REWRITENEWACCOUNT){
        this.BasedOn.AllReinsurables.each(\ r -> {
          if(not activeRiskNumbers.contains(r.RiskNumber)) {
            // create a enddated version list of the removed RIRisk
            plugin.detachRisk(r, this)
            activeRiskNumbers.add(r.RiskNumber)
          }
        })
      }

      var versionsListsToRemove = this.RIRiskVersionLists.where(\ r -> not activeRiskNumbers.hasMatch(\ a -> a == r.RiskNumber))
      versionsListsToRemove.each(\ v -> {
        v.remove()
      })
  }

  function createRIRisks() {
    if (gw.api.system.PCConfigParameters.RIModuleOn()) {
      var plugin = Plugins.get(IReinsurancePlugin)

      for (riskEntity in this.AllReinsurables) {
        plugin.attachRisk(riskEntity)
      }
      removeInactiveRiskNumbers(plugin)
      copyForwardRIAttachmentInclusions()
    }
  }
}

