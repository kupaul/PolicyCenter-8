package gw.document

uses gw.entity.IEntityType
uses gw.pl.persistence.core.Bundle

enhancement GWDocumentUtilBaseEnhancement : gw.document.DocumentsUtilBase {

  static function createNewDocumentObjects<T>(bundle : Bundle) : T {
    return gw.document.DocumentsUtilBase.createNewDocument(bundle, T as IEntityType) as T
  }
}
