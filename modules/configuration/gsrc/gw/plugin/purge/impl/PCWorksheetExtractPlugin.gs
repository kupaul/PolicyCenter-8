package gw.plugin.purge.impl

uses gw.api.database.IQueryBuilder
uses gw.api.database.Relop
uses gw.plugin.InitializablePlugin
uses gw.plugin.purge.WorksheetExtractPlugin

uses java.io.File
uses java.io.FileOutputStream
uses java.lang.IllegalStateException
uses java.util.Map

/**
 * Sample plugin that stores worksheet container data.
 * The default naming scheme takes the naming parameters from the policy period which owns the worksheet:  <PolicyNumber>_<TermNumber>_<JobNumber>_<PublicId>
 * PolicyNumber, JobNumber, and PublicId are run through a mangle function to replace characters that would be illegal in a file name.
 */
@Export
class PCWorksheetExtractPlugin implements WorksheetExtractPlugin, InitializablePlugin {

  public static final var WORKSHEET_EXTRACT_DESTINATION : String = "WorksheetExtractDestination"
  internal static final var GZIP_FILE_EXT : String = ".gz"

  var FILESYSTEM_ROOT : File as readonly FilesystemRoot

  override function setParameters(params: Map<Object, Object>) {
    FILESYSTEM_ROOT = new File(params.get(WORKSHEET_EXTRACT_DESTINATION) as String)
  }

  override function extractWorksheets(container: WorksheetContainer) {
    // extract worksheet data from container into a file
    // worksheet data is GZip compressed XML
    if (container.WorksheetData.Data != null) {
      createDirectoryIfNeeded(container)
      var file = getFileNameForContainer(container)
      if (file.exists()) {
        throw new IllegalStateException("Attempting to extract " +container.DisplayName+ " into existing file " +file)
      }

      using (var output = new FileOutputStream(file),
             var input = container.WorksheetData.Data.toInputStream()) {
        var byteBuffer = new byte[4096]
        var nBytes = 0
        while (nBytes >= 0) { // read at end of file returns -1
          output.write(byteBuffer, 0, nBytes)
          nBytes = input.read(byteBuffer)
        }
      }
    }

    container.CanPurge = true
  }

  override function isExtracted(container: gw.pc.rating.entity.WorksheetContainer): boolean {
    return container.CanPurge //tightly coupled
  }

  /**
   * Worksheet data that was stored in a worksheet container on a policy period is being extracted into xml files.
   * Information about its policy is included in the xml file name.
   * Doing so persists a link between the extracted worksheet data and the policy period it used to be stored on.
   */
  internal function getFileNameForContainer(container: WorksheetContainer) : File {
    var fileName = mangle(container.Branch.PolicyNumber) + "_" +
                   container.Branch.TermNumber + "_" +
                   mangle(container.Branch.Job.JobNumber) + "_" +
                   mangle(container.Branch.PublicID) +
                   GZIP_FILE_EXT

    return new File(FILESYSTEM_ROOT, fileName)
  }

  internal function createDirectoryIfNeeded(container : WorksheetContainer) {
    if (!FILESYSTEM_ROOT.exists()) {
      FILESYSTEM_ROOT.mkdir()
    }
  }

  internal static function mangle(name : String) : String {
    // disallow /, \, and : in filename.  Try to avoid introducing non-uniqueness
    return name.replace(':', '-').replace('\\', '$').replace('/', '_')
  }

  /**
   * Finds Worksheet Containers on bound policies that haven't been extracted already.
   * Once a worksheet container has been extracted, it becomes eligible for purging and its CanPurge field gets set to true.
   */
  override function buildWorksheetCandidatesQuery(query: IQueryBuilder <gw.pc.rating.entity.WorksheetContainer>) {
    query.compare("CanPurge", Equals, false)
    query.join("Branch").join("Job").compare("CloseDate", Relop.NotEquals, null)
  }

}