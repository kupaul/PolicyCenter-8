package gw.plugin.document.impl
uses gw.plugin.document.impl.BaseDocumentProductionDispatcher
uses gw.plugin.document.IDocumentProduction
uses gw.plugin.document.IDocumentProductionBase
uses gw.document.TemplatePluginUtils
uses java.util.Map
uses gw.document.DocumentContentsInfo
uses gw.api.util.LocaleUtil
uses gw.plugin.document.IDocumentTemplateDescriptor

@Export
class LocalDocumentProductionDispatcher extends BaseDocumentProductionDispatcher implements IDocumentProduction {
  construct() {
  }

  override function createDocumentSynchronously(templateDescriptor : IDocumentTemplateDescriptor , parameters : Map<Object, Object>, document : Document) : DocumentContentsInfo {
    var result : DocumentContentsInfo
    var locale = templateDescriptor.Locale
    if (locale == null) {
      locale = LocaleUtil.getDefaultLanguage()
    }
    document.Locale = locale // does the translation to language 
    LocaleUtil.runAsCurrentLanguage( locale , \ ->  {
      result = (getDispatchImplementation(templateDescriptor) as IDocumentProduction).createDocumentSynchronously(templateDescriptor, parameters, document)
    })
    return result
  }
  
  
  override protected function cast(obj : Object) : IDocumentProductionBase {
    return TemplatePluginUtils.castDocumentProduction(obj, IDocumentProduction)
  }

}
