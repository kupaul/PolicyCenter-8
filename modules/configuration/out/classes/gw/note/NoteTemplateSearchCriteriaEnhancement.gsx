package gw.note
uses gw.plugin.note.INoteTemplateSource
uses gw.api.util.DisplayableException
uses java.util.HashMap
uses gw.entity.TypeKey
uses gw.api.util.LocaleUtil
uses java.util.ArrayList
uses gw.api.productmodel.Product
uses java.lang.Exception
uses gw.api.system.PLLoggerCategory
uses gw.api.productmodel.ProductLookup

enhancement NoteTemplateSearchCriteriaEnhancement : entity.NoteTemplateSearchCriteria {
  /** This move the criteria from this object to the the map used to actually perform
   * the search.  It will also move the resulting templates from the the search, into
   * a results objects.
   */
  function performSearch() : NoteTemplateSearchResults[] {
    var nts : INoteTemplateSource = null
    try {
      nts = gw.plugin.Plugins.get(INoteTemplateSource)
    } catch (e : DisplayableException) {
      throw new DisplayableException(displaykey.Java.Note.Template.Plugin.Exception, e)
    }
    
    // populate values to match
    var valuesToMatch = new HashMap<String, Object>()
    for (prop in NoteTemplateSearchCriteria.Type.EntityProperties) {
      if (prop.Name == "ID" or prop.Name == "PublicID" or prop.Name == "BeanVersion") {
        // skip
      }
      else {
        var value = this[prop.Name]
        if (value == null) {
          // skip
        }
        else if (value typeis TypeKey) { 
          valuesToMatch.put(prop.Name, value.Code)
        }
        else if (value typeis Product) {
          valuesToMatch.put(prop.Name, value.Code)
        }
        else {
          valuesToMatch.put(prop.Name, value)
        }
      }
    }
    
    // perform the search
    var templates = nts.getNoteTemplates(LocaleUtil.toLanguage(this.getLanguage()), valuesToMatch)
    var resultsList = new ArrayList<NoteTemplateSearchResults>(templates.Count)
    
    //Convert results from INoteTemplateDescriptor to NoteTemplateSearchResults (non-persistent bean)
    for (template in templates) {
      var searchResults = new NoteTemplateSearchResults()
      try {
        searchResults.Name = template.Name
        searchResults.Topic = template.Topic as NoteTopicType
        searchResults.Type = template.Type as NoteType
        searchResults.LOBs = template.LobTypes.map( \ s -> ProductLookup.getByCode( s ).DisplayName).join( ", " )
        searchResults.Body = template.Body
        searchResults.Subject = template.Subject
        searchResults.Language = LocaleUtil.toLanguageType( template.Locale )
        resultsList.add(searchResults)
      } catch (e : Exception) {
        PLLoggerCategory.PLUGIN.error("Failed to load a template (" + template.getName() + ") due to exception: ", e)
        continue
      }
    }
    return resultsList as NoteTemplateSearchResults[]
  }
}
