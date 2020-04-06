package gw.plugin.archive.impl

uses gw.plugin.archiving.ArchiveSource
uses gw.api.database.Query
uses gw.api.util.PCDeleteBuilder
uses gw.api.archiving.ArchivingUtil
uses gw.api.archiving.upgrade.Issue
uses gw.api.system.PCLoggerCategory

@Export
class PCArchiveSourcePlugin extends ArchiveSource {
  private static final var ARCHIVESOURCE_UWISSUEHISTORIES = "ArchiveSource.UWIssueHistories"
  
  override function prepareForArchive(info : RootInfo) {
    super.prepareForArchive(info)
    // Record IDs of UWIssueHistory to delete after archiving
    ArchivingUtil.getArchivingContext().put(ARCHIVESOURCE_UWISSUEHISTORIES, historiesToDelete(info as PolicyPeriod))
  }

  override function storeFinally(info : RootInfo, result : ArchiveFinalStatus, cause : List<String>) {
    super.storeFinally(info, result, cause)

    // Do nothing if archiving did not succeed
    if (result != ArchiveFinalStatus.TC_SUCCEEDED) {
      return
    }

    // Delete UWIssueHistory from the database
    var query = Query.make(UWIssueHistory)
    query.compareIn("ID", ArchivingUtil.getArchivingContext().get(ARCHIVESOURCE_UWISSUEHISTORIES) as Key[])
    PCDeleteBuilder.executeDelete(query)    
  }

  override function handleUpgradeIssues(info : RootInfo, root : KeyableBean, issues : List<Issue>) {
    PCLoggerCategory.ARCHIVING.info(issues.join("\n"))
  }

  function historiesToDelete(period : PolicyPeriod) : Key[] {
    // Find UWIssueHistory that are:
    //  * Related to this PolicyPeriod
    //  * Auto-approvable and approved
    //  * For UWIssues that are not human touched
    return period.UWIssuesIncludingSoftDeleted
      .where(\ issue -> !issue.HumanTouched && issue.IssueType.AutoApprovable)*.Histories
      .where(\ history -> history.PolicyPeriod == period && history.Status == TC_APPROVED)*.ID
  }
}
