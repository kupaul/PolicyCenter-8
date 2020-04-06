package gw.web.document

uses gw.api.domain.document.DocumentContainer
uses gw.i18n.ILocale
uses gw.document.DocumentCreationInfo

@Export
class DocumentUIHelper {

  public static function createDocumentCreationInfo(activity : Activity, policyPeriod: PolicyPeriod, jobContainer : Job, docContainer : DocumentContainer, docTemplate : String, locale : ILocale) : DocumentCreationInfo {
    // adjust the other attributes from activity

    if (activity != null) {
      var account = activity.Account
      var job = activity.Job
      var policyPeriodFromActivity = activity.PolicyPeriod
      var doc = new Document()
      doc.Author = User.util.CurrentUser.DisplayName
      doc.Level = docContainer

      var dci = new gw.document.DocumentCreationInfo(doc, \ map -> {
        map["Activity"] = activity
        map["Account"] = account
        map["Job"] = job
        map["PolicyPeriod"] = policyPeriodFromActivity})
      if (docTemplate != null) {
        var template = gw.plugin.Plugins.get(gw.plugin.document.IDocumentTemplateSource).getDocumentTemplate(docTemplate, locale)
        dci.DocumentTemplateDescriptor = template
        doc.Name = template.getName(template.Locale)
        doc.Type = template.TemplateType
        doc.SecurityType = template.DefaultSecurityType as DocumentSecurityType
        doc.Section = (template.getMetadataPropertyValue("section") as String) as DocumentSection
        doc.MimeType = template.MimeType
        doc.Status = "draft"
      }
      return dci
    }
    else if (jobContainer != null) {
      return gw.api.web.document.DocumentsHelper.createDocumentCreationInfo(jobContainer)
    }
    else {
      return gw.api.web.document.DocumentsHelper.createDocumentCreationInfo(policyPeriod.Policy)
    }
  }

}