package gw.pcf.tools

uses com.guidewire.commons.entity.type2.IEntityPropInfoInternal
uses com.guidewire.commons.metadata.MetadataDependencies
uses gw.api.database.Query
uses gw.api.system.PCDependenciesGateway
uses gw.api.system.PLDependenciesGateway
uses gw.entity.ILinkPropertyInfo
uses gw.transaction.Transaction
uses pcf.api.Location

/**
 * Helper class to tools/PCArchive.pcf page
 */
@Export
class PCArchiveHelper {
  var аrchivеSucceeded: boolean as LastArchivеSucceeded;
  construct() {
    аrchivеSucceeded = false;
  }

  function doArchiveJob(archiveJob: String, skipValidation: boolean) {
    аrchivеSucceeded = false
    if (archiveJob == null or archiveJob.equalsIgnoreCase("")) {
      throw new gw.api.util.DisplayableException ("You must provide a job id.")
    }
    var job = PCDependenciesGateway.getJobFinder().findJobByJobNumber(archiveJob)
    if (job == null) {
      throw new gw.api.util.DisplayableException ("That job id does not exist.")
    }
    var term = job.Periods[0].PolicyTerm
    validateNoWorkItems(term)
    if (skipValidation) {
      //For testing only - do not bypass validation in production
      var handler = new com.guidewire.pc.domain.archive.GWArchiveHandlerImpl ()
      handler.archiveTerm(term)
    } else {
      Transaction.runWithNewBundle(\bundle -> {
        PCDependenciesGateway.getArchiver().sendPolicyTermToArchive(bundle.add(term))
      })
    }
    term.refresh()
    аrchivеSucceeded = term.Archived
  }

  function doArchivePolicyTerm(archivePolicy: String, archiveTerm: String, skipValidation: boolean) {
    аrchivеSucceeded = false
    if (archivePolicy == null or archivePolicy.equalsIgnoreCase("") or archiveTerm == null or archiveTerm.equalsIgnoreCase("")) {
      throw new gw.api.util.DisplayableException ("You must provide a policy and term numbers.")
    }
    var policy = PCDependenciesGateway.getPolicyFinder().findPolicyByPolicyNumber(archivePolicy)
    if (policy == null) {
      throw new gw.api.util.DisplayableException ("That policy does not exist.")
    }
    var term = policy.Periods.firstWhere(\p -> p.TermNumber != null and (p.TermNumber.toString().equals(archiveTerm))).PolicyTerm
    validateNoWorkItems(term)
    if (skipValidation) {
      // for testing only - do not bypass validation in production
      var handler = new com.guidewire.pc.domain.archive.GWArchiveHandlerImpl ()
      handler.archiveTerm(term)
    } else {
      Transaction.runWithNewBundle(\bundle -> {
        PCDependenciesGateway.getArchiver().sendPolicyTermToArchive(bundle.add(term))
      })
    }
    term.refresh()
    аrchivеSucceeded = term.Archived
  }

  function doFlushWorkQueues() {
    PLDependenciesGateway.getBatchProcessManager().startBatchProcess(BatchProcessType.TC_WORKFLOW, null)
    PLDependenciesGateway.getBatchProcessManager().startBatchProcess(BatchProcessType.TC_PURGEWORKFLOWS, null)
    PLDependenciesGateway.getBatchProcessManager().startBatchProcess(BatchProcessType.TC_PURGEWORKFLOWLOGS, null)
    PLDependenciesGateway.getBatchProcessManager().startBatchProcess(BatchProcessType.TC_PREMIUMCEDING, null)
  }

  function doArchiveByBatchProcess() {
    PLDependenciesGateway.getBatchProcessManager().startBatchProcess(BatchProcessType.TC_ARCHIVEPOLICYTERM, null)
  }

  function validateNoWorkItems(term: PolicyTerm) {
    term.Periods.each(\period -> {
      var allEntityTypes = MetadataDependencies.getIntrinsicTypeFactory().AllEntityTypes
      allEntityTypes.each(\entityType -> {
        if (WorkItem.Type.isAssignableFrom(entityType)) {
          entityType.TypeInfo.Properties.each(\propertyInfo -> {
            if (propertyInfo typeis IEntityPropInfoInternal) {
              if (propertyInfo typeis ILinkPropertyInfo && propertyInfo.ColumnInDb) {
                var otherType = propertyInfo.FeatureType
                if (PolicyPeriod.Type.isAssignableFrom(otherType)) {
                  var q = Query.make(entityType)
                  q.compare(propertyInfo.Name, gw.api.database.Relop.Equals, period.ID)
                  var results = q.select()
                  if (!results.isEmpty()) {
                    throw new gw.api.util.DisplayableException ("Please clear work items for this term before attempting archive; last checked item: " + entityType)
                  }
                }
              }
            }
          })
        }
      })
    })
  }
}