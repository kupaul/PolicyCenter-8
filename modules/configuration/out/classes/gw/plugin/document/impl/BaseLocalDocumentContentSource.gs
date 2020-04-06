package gw.plugin.document.impl

uses gw.plugin.InitializablePlugin
uses java.util.Map
uses java.io.File
uses java.lang.RuntimeException
uses java.io.IOException
uses java.io.InputStream
uses gw.document.DocumentContentsInfo
uses gw.document.DocumentExistsException
uses java.lang.IllegalArgumentException
uses java.lang.Exception
uses java.io.FileOutputStream
uses java.lang.IllegalStateException
uses gw.pl.util.FileUtil

uses java.net.URL
uses gw.api.util.Logger
uses java.lang.StringBuilder
uses java.lang.Throwable

@Export
abstract class BaseLocalDocumentContentSource implements InitializablePlugin
{
  private var _rootDir : String as readonly RootDir
  private var _tempDir : String as readonly TempDir
  private var _documentsPathParameter : String as readonly DocumentsPathParameter
  private var _documentsPath : String as DocumentsPath
  private var _demoDocumentsPath : String as DemoDocumentsPath

  private var _contentMode : String = "content"
  private var _contentURL : String
  private var _targetHiddenFrame : boolean = false

  private static var DOCUMENTS_PATH = "documents.path"

  public property get DemoDocumentsURL() : URL {
    return new URL("file", "", DemoDocumentsPath)
  }

  public property get DocumentsURL() : URL {
    return new URL("file", "", DocumentsPath)
  }

  //These mode parameters are provided for testing purposes; they allow simulation of different kinds of
  // content responses. See the documentation for DocumentContentsInfo for more details on the various modes.
  // Note that not all of the simulated modes faithfully transmit the actual document contents.
  // Generally speaking, the mode parameter should not be used in production.
  private static var MODE_PARAM = "mode"

  //Determine whether a hidden frame should be targeted
  private static var TARGET_PARAM = "target"

  //This is the script used for the jscript mode simulation
  private static var URL_MODE = "url"
  private static var URL_PARAM = "url"

  construct() {
  }

  property get InboundAvailable() : boolean {
    return true
  }

  property get OutboundAvailable() : boolean {
    return true
  }
  
  override function setParameters( parameters : Map ) : void {
    if (parameters != null) {
      // FIXME: getResource will not return file path for Gosu that is inside JAR.
      //_rootDir = new File((typeof this).TypeLoader.getResource( (typeof this).Name.replace( ".", "/" ) + ".gs" ).getPath()).Parent
      _rootDir = parameters.get(ROOT_DIR) as String
      _tempDir = parameters.get(TEMP_DIR) as String
      _documentsPathParameter = parameters.get(DOCUMENTS_PATH) as String
      buildDocumentsPath(RootDir, TempDir)

      var mode = parameters.get(MODE_PARAM) as String
      if (mode.HasContent) {
          _contentMode = mode
          if (URL_MODE.equals(_contentMode)) {
              _contentURL = parameters.get(URL_PARAM) as String
          }
      }
      var target = parameters.get(TARGET_PARAM) as String
      if (target.HasContent) {
          _targetHiddenFrame = "hidden".equals(target)
      }
    }
  }

  public static function appendFileToPath(strPath : String, strFile : String) : String {
    if (strPath == null) {
        strPath = ""
    }
    var strSeparator = File.separator
    if (strPath.endsWith("/") || strPath.endsWith("\\") || strPath.endsWith(File.separator)) {
        strSeparator = ""
    }
    return strPath + strSeparator + strFile
  }

  protected function match(source : String, words : String[]) : boolean {
    return match(source.split(","), words)
  }

  /**
   * @param source
   * @param words
   */
  protected function match(source : String[], words : String[]) : boolean {
    if (words == null || words.length == 0 || words[0] == null || words[0].length() == 0) {
        return true
    }
    if (source == null || source.length == 0) {
        return false
    }

    for (var word in words) {
      var found = false
      for (var src in source) {
        if (src != null && word.equalsIgnoreCase(src.trim())) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }
    }
    return true
  }

  protected function buildDocumentsPath(documentRootDir : String, documentTmpDir : String) {
    if (DocumentsPathParameter.HasContent) {
      DemoDocumentsPath = getAbsolutePath(DocumentsPathParameter, documentRootDir)
      if (!new File(DemoDocumentsPath).equals(new File(DocumentsPathParameter))) {
          Logger.DOCUMENT.warn((typeof this).RelativeName + " has a relative path specified for its documents.path parameter, so it will store documents in the app container's temporary directory. For production use, the configuration should be changed to a full directory path, not a relative path")
          DocumentsPath = getAbsolutePath(DocumentsPathParameter, documentTmpDir)
          var file = new File(DocumentsPath)
          if (!file.exists() && file.isDirectory()) {
              file.mkdirs()
          }
      } else {
          DocumentsPath = DemoDocumentsPath
      }
    }
    Logger.DOCUMENT.info("Documents path: " + DocumentsPath)
  }

  /**
   * Builds the DocumentContentsInfo containing the document contents information. Most of the code in this method
   * exists for the testing-time "mode" parameter; see the CONTENT_MODE section for the standard content-returning scenario.
   * @param strDocUID The DocUID of the document whose contents should be returned
   * @param includeContents If true, the actual contents of the document should be included in the DocumentContentsInfo
   * @return A DocumentContentsInfo object with the metadata of the Document Contents, and possibly the contents themselves
   */
  protected function getDocumentContents(strDocUID : String, includeContents : boolean) : DocumentContentsInfo {
    return DocumentContentsInfo.getDocumentContents(strDocUID, _contentMode, _contentURL, DocumentsURL as String, _documentsPath,
                                                    _demoDocumentsPath, _targetHiddenFrame, includeContents)
  }

  /**
   * Builds the DocumentContentsInfo containing the document contents information. Most of the code in this method
   * exists for the testing-time "mode" parameter; see the CONTENT_MODE section for the standard content-returning scenario.
   * @param strDocUID The DocUID of the document whose contents should be returned
   * @param includeContents If true, the actual contents of the document should be included in the DocumentContentsInfo
   * @return A DocumentContentsInfo object with the metadata of the Document Contents, and possibly the contents themselves
   */
  protected function getExternalDocumentContents(strDocUID : String) : DocumentContentsInfo {
    return DocumentContentsInfo.getDocumentContents(strDocUID, "content", null, DocumentsURL as String, _documentsPath,
                                                    _demoDocumentsPath, false, true)
  }

 /**
   * Store a new set of contents for the given DocUID.  Note that this can not default the date modified, because the
   * date is not null.
   */
  protected function updateDocument(strDocUID : String, isDocument : InputStream) {
    try {
        var file = getDocumentFile(strDocUID)
        if (!FileUtil.isFile( file ) || file.isReservedFileName()) {
            throw new IllegalArgumentException("Document ${strDocUID} does not exist!")
        }
        var backupFile = new File(file.getPath() + ".bak")
        if (not file.renameTo(backupFile) ) { // renamed physical file, 'file' still has previous name
          throw new RuntimeException("Failed to rename file to ${backupFile}")
        }
        copyToFile(isDocument, file)
        backupFile.delete()
    } catch (e : Exception) {
        throw new RuntimeException("Exception encountered trying to update document with doc UID: ${strDocUID}", e)
    }
  }

 /**
   * Store a new chunk of contents.
   * @param isDocument An input stream containing the content to be stored
   * @param docInfoWrapper Information which uniquely identifies this content
   * @return A string which can be used to retrieve the contents in the future (the DocUID)
   */
  protected function addDocument(isDocument : InputStream, docInfoWrapper : IDocumentInfoWrapper) : String {
    try {
        var strUrl = getDocUID(docInfoWrapper)
        var file = getDocumentFile(docInfoWrapper, false)
        if (FileUtil.isFile(file) && !file.isReservedFileName()) {
            throw new DocumentExistsException("${strUrl} already exists.")
        }
        copyToFile(isDocument, file)
        Logger.DOCUMENT.info("DocMgmt created content file '${file}'")
        return strUrl
    } catch (e : Exception) {
        Logger.DOCUMENT.debug("DocMgmt failed to create content file for '${docInfoWrapper.getDocumentName()}'")
        throw new RuntimeException("Exception encountered trying to add document with doc UID: ${getDocUID(docInfoWrapper)}", e)
    }
  }
  
  /** This will create a document UID, in the case of OOTB this is the relative path
  */
  protected function getDocUID(docInfoWrapper : IDocumentInfoWrapper) : String {
    var strDocumentName = makeValidPortableFileName(docInfoWrapper.getDocumentName())
    if (strDocumentName == null) {
        throw new IllegalArgumentException("Document name is null.")
    }
    var strUrl = convertBackSlashPathToSlashPath(makeSubDirPath(docInfoWrapper) + strDocumentName)
    return strUrl
  }
  
  /**
   * Remove the contents identified by the given DocUID
   */
  protected function removeDocumentById(strDocumentId : String) {
    try {
        var file = getDocumentFile(strDocumentId)
        if (!file.exists()) {
            return
        }
        if (!file.delete()) {
            throw new IllegalStateException("Document could not be deleted: ${file}")
        }
    } catch (e : Exception) {
        throw new RuntimeException("Exception encountered trying to remove document with doc UID: ${strDocumentId}", e)
    }
  }

  protected function removeLinkToInfo(strDocumentId : String) {
    removeDocumentById(strDocumentId)
  }

  protected function copyToFile(is : InputStream, file : File) {
    var os = new FileOutputStream(file)
    var bytes = new byte[4096]
    while (true) {
        var i = is.read(bytes)
        if (i < 0) {
            break
        }
        os.write(bytes, 0, i)
    }
    is.close()
    os.close()
  }

  protected function makeValidPortableFileName(strFileName : String) : String {
    if (strFileName == null || strFileName.length() == 0) {
      return strFileName
    }

    var sb = new StringBuilder(strFileName)
    if (sb.charAt(0) == "." as char) {
      sb.deleteCharAt(0)
    }

    for (i in 0..|sb.length()) {
      var c = sb.charAt(i)
      if ("\"/\\[]:;|=,?<>*".indexOf(c as String) >= 0) {
        sb.setCharAt(i, "_" as char)
      }
    }

    return sb.toString()
  }

  protected function isDocumentFile(docInfoWrapper : IDocumentInfoWrapper) : boolean {
    try {
        var strName = docInfoWrapper.getDocumentName()
        if (!strName.HasContent) {
            throw new IllegalArgumentException("Document name is null or empty.")
        }
        var file = getDocumentFile(docInfoWrapper, true)
        return !file.isReservedFileName() and FileUtil.isFile(file)
    } catch (t : Throwable) {
        throw new RuntimeException("Exception encountered trying to test for the existiance of document named: ${docInfoWrapper.getDocumentName()}", t)
    }
  }

  protected function getDocumentsDir() : String {
    return DocumentsPath + File.separator
  }

  protected function getDemoDocumentsDir() : String {
    return DemoDocumentsPath + File.separator
  }
  /** This will get or create the file and create any required directories
  */
  protected function getDocumentFile(relativePath : String) : File {
    return getDocumentFile(relativePath, false)
  }
  
  protected function getDocumentFile(relativePath : String, checkDemoFolder : boolean) : File {
    var file = new File(getDocumentsDir(), relativePath)
    if (!file.exists() && checkDemoFolder) {
        file = new File(getDemoDocumentsDir(), relativePath)
    }
    return file
  }

  protected function makeSubDirPath(diw : IDocumentInfoWrapper) : String {
      var subDirPath = diw.getSubDirForDocument()
      var dirDoc = new File(getDocumentsDir() + subDirPath)
      if (not dirDoc.Directory) {
          dirDoc.mkdirs()
      }
      return subDirPath
  }

 /**
   * A path is absolute if it begins with a "/" or a "\" or a drive letter "<drive-letter>:".
   * This method returns absolute paths as-is. Relative paths are prepended with the root
   * application directory.
   */
  private static function getAbsolutePath(path : String, rootPath : String) : String {
    var retVal = path
    if (path.startsWith("\\") || path.startsWith("/") || (path.length() > 1 && path.charAt(1) == ":" as char)) {
        retVal = path
    } else {
        retVal = rootPath + File.separator + path
    }
    try {
        retVal = (new File(retVal)).getCanonicalPath()
    } catch (e : IOException) {
        throw new RuntimeException("Could not get absolute path from relative path: ${path}", e)
    }
    return retVal.replaceAll("\\\\","/")
  }

  protected function getDocumentFile(docInfoWrapper : IDocumentInfoWrapper, checkDemoFolder : boolean) : File {
    var strSubDir = makeSubDirPath(docInfoWrapper)
    var file = getDocumentFile(strSubDir + makeValidPortableFileName(docInfoWrapper.getDocumentName()), checkDemoFolder)
    return file
  }

  private function convertBackSlashPathToSlashPath(strPath : String) : String {
    if (strPath == null || strPath.length() == 0) {
        return strPath
    }
    return strPath.replace("\\" as char, "/" as char)
  }

  //---------- Sub classes to factor out differences between app-specific document info --------------------------
  /**
   * Class which wraps required information into an identifying token for document contents
   */
  public static interface IDocumentInfoWrapper {

    public function getDocumentName() : String

    public function getSubDirForDocument() : String
  }
}
