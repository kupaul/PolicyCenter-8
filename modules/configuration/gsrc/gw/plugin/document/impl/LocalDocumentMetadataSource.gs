package gw.plugin.document.impl
uses gw.plugin.document.IDocumentMetadataSource

@Export
class LocalDocumentMetadataSource extends BaseLocalDocumentMetadataSource  implements IDocumentMetadataSource {
  construct() {
  }
  protected override function documentMatchesCriteria( doc : Document, criteria : DocumentSearchCriteria) : boolean  {
    if (not super.documentMatchesCriteria( doc, criteria )) {
      return false
    }
    if (criteria.getDateFrom() != null) {
      if (doc.getDateModified().getTime() <  criteria.getDateFrom().getTime()) {
        return false
      }
    }
    if (criteria.getDateTo() != null) {
      if (doc.getDateModified().getTime() > criteria.getDateTo().getTime()) {
        return false
      }
    }
    if (criteria.getAccount() != null) {
      if (!criteria.getAccount().equals(doc.getAccount())) {
        return false
      }
    }
    if (criteria.getPolicy() != null) {
      if (!criteria.getPolicy().equals(doc.getPolicy())) {
        return false
      }
    }
    return true
  }
}
