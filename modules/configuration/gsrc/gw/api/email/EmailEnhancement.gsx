package gw.api.email
uses java.util.Map
uses gw.plugin.email.IEmailTemplateDescriptor
uses java.io.StringReader
uses gw.document.TemplatePluginUtils
uses gw.api.util.LocaleUtil
uses gw.api.util.DisplayableException
uses java.lang.Throwable

enhancement EmailEnhancement : gw.api.email.Email {

  function useEmailTemplate(template : IEmailTemplateDescriptor, beans : Map<String,Object>) {
    try {
      var locale = template.Locale
      if (locale == null) {
        locale = LocaleUtil.getDefaultLocale()
      }
      TemplatePluginUtils.resolveTemplates( locale , 
          {new StringReader(template.Subject), new StringReader(template.Body)}, 
          // setup the symbol table for the template processing
          \ iScriptHost -> {
            for (entry in beans.entrySet()) {
              var bean = entry.getValue()
              if (bean != null) {
                iScriptHost.putSymbol(entry.Key, typeof(bean) as String, bean)
              }
            }

          }, 
          // process the result of the template expansion
          \ results -> {
            this.Subject = results[0]
            this.Body = results[1]
          } )
    } catch (e : Throwable) {
      var errorType = template.getName()
      throw new DisplayableException(displaykey.EMailAPI.ExceptionCaught(errorType), e)
    }
  }
  
  
}
