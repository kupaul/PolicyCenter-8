package gw.plugin.document.impl

uses gw.document.DocumentContentsInfo
uses gw.document.TemplatePluginUtils
uses gw.plugin.document.IDocumentTemplateDescriptor
uses gw.plugin.InitializablePlugin
uses gw.plugin.document.IDocumentProductionBase
uses java.lang.Throwable
uses java.lang.IllegalArgumentException
uses java.util.HashMap
uses java.util.Map
uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses java.util.Set
uses gw.api.util.LocaleUtil
uses gw.api.util.Logger

@Export
class BaseDocumentProductionDispatcher implements IDocumentProductionBase, InitializablePlugin {
    /**
     * Map of String->IDocumentProduction implementations. The keys will typically include
     * mime types and/or DocumentProductionType values.
     */
    var _productionTypeToImplementationMap = new HashMap<String, IType>()
    static var SKIP_PARAMS = { "root.dir", "temp.dir" }
    construct() {
   }

    /**
     * Initialize the map with the parameters specified in the config. This assumes that the config
     * implicitly contains information mapping strings to classes, for example:
       <plugin-java name="IDocumentProduction"
              javaclass="gw.plugin.document.impl.DocumentProductionDispatcher">
        <param name="application/msword"
               value="gw.plugin.document.impl.WordDocumentProductionImpl"/>
        <param name="application/vnd.ms-excel"
               value="gw.plugin.document.impl.ExcelDocumentProductionImpl"/>
        <param name="application/x-msexcel"
               value="gw.plugin.document.impl.ExcelDocumentProductionImpl"/>
        <param name="application/pdf"
               value="gw.plugin.document.impl.ServerSidePDFDocumentProductionImpl"/>
        <param name="text/plain"
               value="gw.plugin.document.impl.GosuDocumentProductionImpl"/>
        <param name="text/html"
               value="gw.plugin.document.impl.GosuDocumentProductionImpl"/>
        <param name="text/xml"
               value="gw.plugin.document.impl.GosuDocumentProductionImpl"/>
        <param name="application/rtf"
               value="gw.plugin.document.impl.GosuDocumentProductionImpl"/>
        <param name="application/csv"
               value="gw.plugin.document.impl.GosuDocumentProductionImpl"/>
      </plugin-java>

     * @param params Contains the set of confgured parameters
     */
    override function setParameters(params : Map<Object,Object>) {
      var errors = false
      _productionTypeToImplementationMap.clear()
      for (mimeType in params.Keys as Set<String>) {
        if (not (SKIP_PARAMS.contains(mimeType))) {
          try {
            var handlerType = TypeSystem.getByFullName(params.get(mimeType) as String)
            _productionTypeToImplementationMap.put(mimeType, handlerType)
          } catch (t : Throwable) {
            errors = true
            Logger.DOCUMENT.error("Could not load handler for '" + mimeType + "':", t)
          }
        }
      }
      if (errors) {
        throw "Failed to load document production handlers"
      }
    }

  /**
   * Dispatch through to the asynchronousCreationSupported method on the configured IDocumentProduction implementation
   */
  override function asynchronousCreationSupported( templateDescriptor : IDocumentTemplateDescriptor ) : boolean {
    var result : boolean
    var locale = templateDescriptor.Language
    if (locale == null) {
      locale = LocaleUtil.getDefaultLocale()
    }
    LocaleUtil.runAsCurrentLocaleAndLanguage( locale, locale , \ ->  {
      result = getDispatchImplementation(templateDescriptor).asynchronousCreationSupported(templateDescriptor)
    })
    return result
  }

  /**
   * Dispatch through to the createDocumentAsynchronously method on the configured IDocumentProduction implementation
   */
  override function createDocumentAsynchronously( templateDescriptor : IDocumentTemplateDescriptor, parameters : Map<Object,Object>, fieldValues : Map<Object,Object> ) : String  {
    var result : String
    var locale = templateDescriptor.Language
    if (locale == null) {
      locale = LocaleUtil.getDefaultLocale()
    }
    LocaleUtil.runAsCurrentLocaleAndLanguage( locale, locale , \ ->  {
     result = getDispatchImplementation(templateDescriptor).createDocumentAsynchronously(templateDescriptor, parameters, fieldValues)
    })
    return result
  }

  override function createDocumentAsynchronously( templateDescriptor : IDocumentTemplateDescriptor, parameters : Map<Object,Object> ) : String  {
    var result : String
    var locale = templateDescriptor.Language
    if (locale == null) {
      locale = LocaleUtil.getDefaultLocale()
    }
    LocaleUtil.runAsCurrentLocaleAndLanguage( locale, locale , \ ->  {
      result = getDispatchImplementation(templateDescriptor).createDocumentAsynchronously(templateDescriptor, parameters)
    })
    return result
  }

  /**
   * Dispatch through to the synchronousCreationSupported method on the configured IDocumentProduction implementation
   */
  override function synchronousCreationSupported( templateDescriptor : IDocumentTemplateDescriptor ) : boolean  {
    var result : boolean
    var locale = templateDescriptor.Language
    if (locale == null) {
      locale = LocaleUtil.getDefaultLocale()
    }
    LocaleUtil.runAsCurrentLocaleAndLanguage( locale, locale , \ ->  {
      result = getDispatchImplementation(templateDescriptor).synchronousCreationSupported(templateDescriptor)
    })
    return result
  }

  /**
   * Dispatch through to the createDocumentSynchronously method on the configured IDocumentProduction implementation
   */
  override function createDocumentSynchronously( templateDescriptor : IDocumentTemplateDescriptor, parameters : Map<Object,Object> ) : DocumentContentsInfo {
    var documentContentsInfo : DocumentContentsInfo
    var locale = templateDescriptor.Language
    if (locale == null) {
      locale = LocaleUtil.getDefaultLocale()
    }
    LocaleUtil.runAsCurrentLocaleAndLanguage( locale, locale , \ ->  {
      documentContentsInfo = getDispatchImplementation(templateDescriptor).createDocumentSynchronously(templateDescriptor, parameters)
    })
    return documentContentsInfo
  }

  /**
   * Return the IDocumentProduction implementation which should be used to create a document
   * based on the indicated template.
   * @param templateDescriptor The template on which the document should be based.
   * @return The appropriate IDocumentProduction implementation.
   *
   */
  protected function getDispatchImplementation(templateDescriptor : IDocumentTemplateDescriptor) : IDocumentProductionBase {
    if (templateDescriptor == null) {
      throw new IllegalArgumentException("Cannot pass null templateDescriptor to getDispatchImplementation()")
    }
    var productionTypeStr = templateDescriptor.getDocumentProductionType()
    if (productionTypeStr == null or productionTypeStr.trim().length == 0) {
      productionTypeStr = templateDescriptor.getMimeType()
    }
    var productionType = _productionTypeToImplementationMap.get(productionTypeStr)
    if (productionType == null) {
      throw new IllegalArgumentException("No configured IDocumentProduction implementation found for production type: " + productionType + ". Please check the DocumentProductionDispatcher configuration.")
    }
    var constructor = productionType.TypeInfo.getConstructor( new IType[0] ).Constructor
    return cast(constructor.newInstance(new String[0]))
  }

  protected function cast(obj : Object) : IDocumentProductionBase {
    return TemplatePluginUtils.castDocumentProduction(obj, IDocumentProductionBase)
  }
}
