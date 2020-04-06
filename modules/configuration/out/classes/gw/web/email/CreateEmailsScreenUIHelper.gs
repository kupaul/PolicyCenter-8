package gw.web.email

uses javax.swing.text.html.HTMLWriter

@Export
class CreateEmailsScreenUIHelper {

  static function initLanguage(docContainer: gw.api.domain.document.DocumentContainer) : LanguageType {
    var lang : LanguageType = null
    if (docContainer typeis Account) {
      lang = docContainer.PrimaryLanguage
    } else if (docContainer typeis Policy) {
      lang = docContainer.PrimaryLanguage
    } else if (docContainer typeis Job) {
      lang = docContainer.Policy.PrimaryLanguage
    } else if (docContainer typeis PolicyPeriod) {
      lang = docContainer.Policy.PrimaryLanguage
    }
    if (lang == null) {
      lang = gw.api.util.LocaleUtil.getDefaultLanguageType()
    }
    return lang
  }


  static function initNewEmail( emailTemplate: String, noDefaultTemplate : Boolean, language: LanguageType,  symbolTable: java.util.Map<String, Object>, documentsToSend:Document[]) : gw.api.email.Email {
    var rtn = new gw.api.email.Email()
    if (emailTemplate != null) {
      executeTemplate(rtn, emailTemplate, noDefaultTemplate,language, symbolTable )
    }
    if (documentsToSend != null) {
      for (document in documentsToSend) {
        rtn.addDocument( document )
      }
    }
    return rtn
  }

  static function executeTemplate(rtn : gw.api.email.Email, emailTemplate: String, noDefaultTemplate : Boolean, language: LanguageType,  symbolTable: java.util.Map<String, Object>) {
    var templatePlugin = gw.plugin.Plugins.get(gw.plugin.email.IEmailTemplateSource)
    var template = templatePlugin.getEmailTemplate(gw.api.util.LocaleUtil.toLanguage(language), emailTemplate)
    if (template == null) {
      noDefaultTemplate = true
      throw new gw.api.util.DisplayableException (displaykey.Web.Activity.EmailTemplate.Language(emailTemplate, language))
    }
    else {
      rtn.useEmailTemplate(template, symbolTable)
    }
  }

  static function sendEmailToRecipients(emailToSend : gw.api.email.Email, language: LanguageType, saveAsDocument : Boolean, documentToSave: Document, docContainer: gw.api.domain.document.DocumentContainer,
                                        symbolTable: java.util.Map,  emailTemplate: String , CurrentLocation: pcf.api.Location) {
    var warnings = gw.api.email.EmailUtil.emailContentsValid(emailToSend)
    if (warnings.length > 0) {
      throw new gw.api.util.DisplayableException (warnings)
    }
    if (saveAsDocument) {
      var templatePlugin = gw.plugin.Plugins.get(gw.plugin.document.IDocumentTemplateSource)
      var template = templatePlugin.getDocumentTemplate("CreateEmailSent.gosu.htm", gw.api.util.LocaleUtil.toLanguage(language))
      if (template == null) {
        throw new gw.api.util.DisplayableException ("Could not save email as a document because the ManualEmailSent template does not exist!")
      } else {
        documentToSave = documentToSave != null ? documentToSave : new Document()
        documentToSave.Name  = emailToSend.Subject
        documentToSave.MimeType = template.MimeType
        documentToSave.Type = template.TemplateType
        documentToSave.Section = template.getMetadataPropertyValue( "section" ) as String // assigment will force it to SectionType
        documentToSave.SecurityType = template.DefaultSecurityType
        documentToSave.Status = "final"
        documentToSave.Recipient = emailToSend.ToRecipients.first().Name
        documentToSave.Author = User.util.CurrentUser.DisplayName
        documentToSave.Inbound = false
        documentToSave.Level = docContainer
        documentToSave.DateCreated = gw.api.util.DateUtil.currentDate()

        var paramMap = new java.util.HashMap (symbolTable)
        paramMap.put("User", User.util.CurrentUser)
        paramMap.put("Email", emailToSend)
        paramMap.put("DateSent", gw.api.util.DateUtil.currentDate())
        gw.document.DocumentProduction.createAndStoreDocumentSynchronously(template, paramMap, documentToSave)

      }
    } else if (documentToSave != null) {
      documentToSave.remove()
    }
    gw.api.email.EmailUtil.sendEmailWithBody(docContainer as KeyableBean, emailToSend)
    // it didn't throw so reset email template so that other templates can be used
    var actv = symbolTable.get("Activity")
    if (emailTemplate != null and actv typeis Activity) {
      if (actv.EmailTemplate == emailTemplate) {
        actv.EmailTemplate = null
      }
    }
    CurrentLocation.commit()
  }
}