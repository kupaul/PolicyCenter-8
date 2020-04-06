package gw.plugin.document.impl

/** This implements an asynchronous document content plugin as a wrapper around the existing plugin.  I.e., it just 
* addes the functionality for splitting the document storage into steps.
*
* some notes, the temporary storage is the same storage as the OOTB storage, i.e., it is a directory that is
* mapped accross the cluster.
*/
uses gw.document.DocumentContentsInfo
uses gw.api.util.DateUtil
uses gw.api.util.RetryableException
uses gw.api.util.SuspendableException
uses gw.plugin.document.IDocumentContentSource
uses java.lang.RuntimeException
uses java.lang.StringBuilder
uses java.lang.Throwable
uses java.io.File
uses java.io.FileInputStream
uses java.io.InputStream
uses java.util.Date
uses java.util.Map
uses gw.lang.reflect.TypeSystem
uses gw.plugin.InitializablePlugin
uses gw.api.system.PCLoggerCategory

@Export
class AsyncDocumentContentSource extends BaseLocalDocumentContentSource implements IDocumentContentSource
{
  var AVAILABLE_PARAM = "TrySynchedAddFirst"
  var SYNCHED_CONTENT_SOURCE = "SynchedContentSource"
  var _attemptIfAvailable : boolean
  var _syncdIDCS : IDocumentContentSource
  
  construct() {
     PCLoggerCategory.DOCUMENT.debug("DocMgmt created AsyncDocumentContentSource")
  }
  
  override property get InboundAvailable() : boolean {
    return _syncdIDCS != null && _syncdIDCS.InboundAvailable
  }

  override property get OutboundAvailable() : boolean {
    return _syncdIDCS != null && _syncdIDCS.OutboundAvailable
  }
  
  override function setParameters(parameters : Map) {
    super.setParameters( parameters )
   _attemptIfAvailable = parameters.get(AVAILABLE_PARAM) as String == "true"
   _syncdIDCS = wrapSyncdIDCS( parameters ) // throws on miss configuration
   PCLoggerCategory.DOCUMENT.info("DocMgmt Async IDCS started async=${not _attemptIfAvailable} wrapping=${typeof _syncdIDCS}")
  }
  
  override function addDocument(documentContents : InputStream, document : Document) : boolean {
    if (documentContents == null) { // doing store?
      if (not isDocument(document)) { // document not already uploaded
        if (document.PendingDocUID != null) { // have a pending document, so do the store
          if (document.New) {
            return false // nth commit after a rollback
          }
          qaPerformStoreTestingActionsBasedOnFilename(document.Name)
          return storeDocument(document)
        }
      }
      return _syncdIDCS.addDocument(documentContents, document)
    }
    else {
      var throwException = qaPerformInitialTestingActionsBasedOnFilename(document.Name)
      if (_syncdIDCS.InboundAvailable and _attemptIfAvailable) {
        try {
          if (throwException) {
             throw new RetryableException("Requested exception", new RuntimeException("User requested exception"))
          }
          return _syncdIDCS.addDocument(documentContents, document)
        } catch(e : RetryableException) {
          PCLoggerCategory.DOCUMENT.info("DocMgmt attempt failed, will created temporary file", e)
        }
      }
      return createTemporaryStore(documentContents, document)
    }
  }


  override function isDocument(document : Document) : boolean {
    return _syncdIDCS.isDocument( document )
  }
  
  override function updateDocument(document : Document, isDocument : InputStream) : boolean {
    return _syncdIDCS.updateDocument(document, isDocument)
  }
  
  override function removeDocument(document : Document) : boolean {
    return _syncdIDCS.removeDocument(document)
  }
  
  override function getDocumentContentsInfo( document : Document, includeContents: boolean ) : DocumentContentsInfo  {
    return _syncdIDCS.getDocumentContentsInfo( document, includeContents )
  }

  override function getDocumentContentsInfoForExternalUse(document : Document) : DocumentContentsInfo {
    return _syncdIDCS.getDocumentContentsInfoForExternalUse( document )
  }

  /** This should call the contructor and initialize the old synchronous version of the
  * IDocumentContentSource.
  * This should be overridden 
  */
  function wrapSyncdIDCS(parameters : Map) : IDocumentContentSource {
    var synchedTypeName = parameters.get(SYNCHED_CONTENT_SOURCE) as String
    if (synchedTypeName == null) {
       throw "AsyncDocumentContentSource -- missing required parameter ${SYNCHED_CONTENT_SOURCE}"
    }
    var synchedType = TypeSystem.getByFullNameIfValid(synchedTypeName)
    if (synchedType == null) {
       throw "AsyncDocumentContentSource -- could not find ${SYNCHED_CONTENT_SOURCE} ${synchedTypeName}"
    }
    var synchedIDCS = synchedType.TypeInfo.getConstructor({}).Constructor.newInstance({})
    if (synchedIDCS typeis InitializablePlugin) {
      synchedIDCS.setParameters( parameters )
    }
    if (synchedIDCS typeis IDocumentContentSource) {
      return synchedIDCS
    }
    else {
       throw "AsyncDocumentContentSource -- ${SYNCHED_CONTENT_SOURCE} ${synchedTypeName} is not an IDocumentContentSource"
    }
  }

  /* this will create a temporary file and sent an event to move it to permanent
  * storage.  
  */
  function createTemporaryStore(is : InputStream, document : Document) : boolean {
    try {
      var docInfoWrapper = new DocumentInfoWrapper(document)
      var file : File
      do {
        document.PendingDocUID = getDocUID(docInfoWrapper)
        file = getDocumentFile( document.PendingDocUID )
      } while (file.exists())
      copyToFile(is, file)
      if (document.DateCreated == null) {
        document.DateCreated = DateUtil.currentDate()
      }
      document.setPersistenceRequired( true )
      document.addEvent( "DocumentStore" )
      PCLoggerCategory.DOCUMENT.info("DocMgmt created temporary file '${file}'")
      return false
    } catch (e : Throwable) {
      PCLoggerCategory.DOCUMENT.warn("DocMgmt failed to store '${document.PendingDocUID}'", e)
      throw e
    }
  }
  /* This will move the document from temporary storage to the DMS, via the
  * old IDCS implemenation
  */
  function storeDocument(document : Document) : boolean {
    var file = getDocumentFile( document.PendingDocUID )
    document.PendingDocUID = null
    ootbSetUniqueNameSinceBackendDoesnt(document)
    var rtn = _syncdIDCS.addDocument(new FileInputStream(file), document)
    document.DMS = true
    file.delete()
    return rtn
  }
  
  /* This method permits me to change the nature of processing based on a file
  name.  It should only be used for testing
  */
  function qaPerformInitialTestingActionsBasedOnFilename(name : String) : boolean {
    if (name.startsWith( "Async" )) {
      if (name.contains(".On")) {
        _attemptIfAvailable = false
        PCLoggerCategory.DOCUMENT.info("DocMgmt user command Async On")
      }
      else if (name.contains(".Off")) {
        _attemptIfAvailable = true
        PCLoggerCategory.DOCUMENT.info("DocMgmt created user command Async Off")
      }
      else if (name.contains(".Exception")) {
        return true
      }
    }
    return false
  }

  /* This method permits me to change the nature of processing based on a file
  * name.  
  * To get these to work first turn on async, submit the file with the desired
  * action.  Once the transport has failed on the file.  Trun async off and
  * the transport should retry the store suggessfully.
  */
  function qaPerformStoreTestingActionsBasedOnFilename(name : String) {
    if (not _attemptIfAvailable) {
      if (name.startsWith( "Async" )) {
        if (name.contains(".Retry")) {
          throw new RetryableException("Forced Retry", new RuntimeException("User requested retry exception"), DateUtil.currentDate().addSeconds( 1 ))
        }
        else if (name.contains(".Suspend")) {
          throw new SuspendableException("Forced Suspension", new RuntimeException("User requested suspendable exception"))
        }
        else if (name.contains(".StoreException")) {
          throw new RuntimeException("User requested store exception")
        }
      }
    }
  }

  /** The out of the Box implementation throws an exception on the attempting to save a
  * duplicate file.  Thats okay when being interactive, but the transport can not live with that.
  *
  * If this was a real DMS, it should be prepared to have files with the same name.
  */
  function ootbSetUniqueNameSinceBackendDoesnt(document : Document) {
    if (_syncdIDCS typeis BaseLocalDocumentContentSource) {
      var name = document.Name
      var counter = 2
      var dci = new LocalDocumentContentSource.DocumentInfoWrapper(document) // uses LocalDocumentContentSource's to get its path
      var strSubDir = dci.getSubDirForDocument()
      var file = getDocumentFile(strSubDir + makeValidPortableFileName(name), false)
      while (file.exists() or file.isReservedFileName()) {
        document.Name = name + counter
        counter = counter + 1
        file = getDocumentFile(strSubDir + makeValidPortableFileName(document.Name), false)
      }
    }
  }
 

  /**
   * Inner class that represents a document name and the name of a subdirectory where the document will reside
   */
  public static class DocumentInfoWrapper implements BaseLocalDocumentContentSource.IDocumentInfoWrapper {
    private var _docName : String
    private var _date : Date

    public construct(document : Document) {
        _docName = document.getName()
        _date = DateUtil.currentDate()
    }

    override function getDocumentName() : String {
      return _docName + "." + _date.Minute + "." + (DateUtil.currentDate().Time - _date.Time)
    }

    override function getSubDirForDocument() : String {
      var strSubDir = new StringBuilder()
      strSubDir.append("async").append(File.separator)
      strSubDir.append(_date.YearOfDate).append(File.separator)
      strSubDir.append(_date.MonthOfYear).append(File.separator)
      strSubDir.append(_date.DayOfMonth).append(File.separator)
      strSubDir.append(_date.HourOfDay).append(File.separator)
      return strSubDir.toString()
    }
  }

}
