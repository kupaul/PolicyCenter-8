package gw.pcf

/**
 * Provides support for the Archiving LVs
 */
@Export
class ArchiveHelper {
  public static function getArchivedStyle(job : Job) : boolean {
    return job.SelectedVersion.PolicyTerm.Archived
  }
}
  