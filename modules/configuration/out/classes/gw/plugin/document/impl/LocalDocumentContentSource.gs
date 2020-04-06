package gw.plugin.document.impl

uses gw.document.DocumentContentsInfo
uses gw.pl.persistence.core.Key
uses gw.pl.util.FileUtil
uses gw.plugin.document.IDocumentContentSource

uses java.io.File
uses java.io.InputStream
uses java.lang.StringBuilder
uses java.util.Date
uses gw.pl.util.FileUtil

@Export
class LocalDocumentContentSource extends BaseLocalDocumentContentSource implements IDocumentContentSource  {
  
  construct()
  {
  }
  
  override function addDocument(documentContents : InputStream, document : Document) : boolean {
    var docInfoWrapper = new DocumentInfoWrapper(document)
    var docUID : String
    if ((documentContents == null) and isDocument(document)) {
        docUID = getDocUID(docInfoWrapper)
    } else {
        docUID = addDocument(documentContents, docInfoWrapper)
        document.DateModified = Date.CurrentDate
    }
    document.DocUID = docUID
    return false
  }
  
  override function isDocument(document : Document) : boolean {
    if (document.DocUID != null) {
        var docFile = getDocumentFile(document.DocUID)
        return FileUtil.isFile(docFile) and docFile.exists()
    } else {
        return isDocumentFile(new DocumentInfoWrapper(document))
    }
  }
  
  override function getDocumentContentsInfo(document : Document, includeContents : boolean) : DocumentContentsInfo {
    var dci = getDocumentContents(document.DocUID, includeContents)
    dci.setResponseMimeType(document.MimeType)
    return dci
  }
  
  override function getDocumentContentsInfoForExternalUse(document : Document) : DocumentContentsInfo {
    var dci = getExternalDocumentContents(document.getDocUID())
    dci.setResponseMimeType(document.getMimeType())
    return dci
  }

  override function updateDocument(document : Document, isDocument : InputStream) : boolean {
    updateDocument(document.DocUID, isDocument)
    document.DateModified = Date.CurrentDate
    return false
  }
  
  override function removeDocument(document : Document) : boolean {
    removeDocumentById(document.DocUID)
    return false
  }
  
  static class DocumentInfoWrapper implements BaseLocalDocumentContentSource.IDocumentInfoWrapper {
    var _docName : String
    var _accountID : Key
    var _policyID : Key
    var _policyPeriodID : Key

    public construct(document : Document) {
      var account = document.getAccount()
      var policy = document.getPolicy()
      var policyPeriod = document.getPolicyPeriod()
      _docName = document.getName()
      _accountID = account == null ? null : account.ID
       _policyID = policy == null ? null : policy.ID
       _policyPeriodID = policyPeriod == null ? null : policyPeriod.ID
    }

    override function getDocumentName() : String {
        return _docName
    }

    override function getSubDirForDocument() : String {
        var strSubDir = new StringBuilder()
        if (_accountID != null and !_accountID.Temporary) {
            strSubDir.append("Account").append(_accountID).append(File.separator)
        }
        if (_policyID != null and !_policyID.Temporary) {
            strSubDir.append("Policy").append(_policyID).append(File.separator)
        }
        if (_policyPeriodID != null and !_policyPeriodID.Temporary) {
            strSubDir.append("PolicyPeriod").append(_policyPeriodID).append(File.separator)
        }
        return strSubDir.toString()
    }
  }
}
