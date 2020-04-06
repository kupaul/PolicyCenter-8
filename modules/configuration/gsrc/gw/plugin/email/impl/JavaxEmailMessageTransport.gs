package gw.plugin.email.impl

uses gw.api.email.AbstractEmailMessageTransport
uses gw.api.email.Email
uses java.lang.Throwable
uses java.lang.Exception
uses javax.mail.MessagingException
uses javax.mail.Session
uses javax.mail.SendFailedException
uses java.net.ConnectException
uses java.net.UnknownHostException
uses java.util.Properties
uses java.util.Map
uses gw.api.system.PLLoggerCategory
uses gw.plugin.email.HtmlEmail


/** This is a fully exposed javax mail implementation so that packages like JavaMail-Crypto can
 * be used to sign documents.
 *
 * The maintaining of the key ring is left as an exercise for the user.
 */
@Export
class JavaxEmailMessageTransport extends AbstractEmailMessageTransport {

  public static final var DEBUG_PARAM : String = "Debug"
  var debug = false
  construct() {
  }

  override function setParameters(params : Map) {
    super.setParameters(params)
    var work = params.get(DEBUG_PARAM) as String
    if (work != null) {
      debug = work as boolean
    }
    PLLoggerCategory.CONFIG.info("Starting JavaXEmailMessageTransport with emailHost=${smtpHost} port=${smtpPort} debug=${debug} ")
  }

  override function handleGeneralException(message : Message, email : Email, exception : Throwable) {
    message.ErrorDescription = exception.Message
    message.reportError()
  }

  override function handleMessageException(message : Message, email : Email, exception : MessagingException) : boolean {
    var retry = false
    // If the problem is with an email address, extract them from the exception, log the error, remove them from the message, and send again
    if (exception typeis SendFailedException) {
      var rootCause = getRootCause(exception)
      if (rootCause != null &&
              (rootCause typeis UnknownHostException
              || rootCause typeis ConnectException)) {
        handleErrorConnectingToMailServer(message, exception)
      } else {
        var invalidAddresses = exception.InvalidAddresses
        if (invalidAddresses != null && !invalidAddresses.IsEmpty) {
          retry = handleInvalidAddresses(email, invalidAddresses)
        }
        if (!retry) {
          message.ErrorDescription = exception.Message
          message.skip() // skip in this case, to avoid having all of the messages held up by one bad address
        }
      }
    } else {
      message.ErrorDescription = exception.Message
      message.reportError()
    }
    return retry
  }

  /**
   * Handles the case where the message could not be send due to problem connecting to email server
   * @param message Message to send
   * @param exception Exception occurred.  Its cause would be either UnknownHostException or ConnectionException
   */
  function handleErrorConnectingToMailServer(message : MessageBase, exception : MessagingException) {
    message.ErrorDescription = exception.Message
    message.reportError()
  }

  function getRootCause(me : Exception) : Exception {
    var e = me
    while (e typeis MessagingException) {
      e = e.NextException
    }
    return e
  }

  /**
   * Template method to handle sending the email.  This method does not need to do exception handling
   * @param wkSmtpHost SMTP host name
   * @param wkSmtpPort SMTP host port number
   * @param email email object
   * @throws MessagingException Any exception occurred during the operation
   */
  protected override function createHtmlEmailAndSend(wkSmtpHost : String, wkSmtpPort : String, email : Email) {

    var out = createHtmlEmail(wkSmtpHost, wkSmtpPort, email)
    // encrypt or sign via your own plugin    
    // out = EncryptionManager.getEncryptionUtils(EncryptionManager.SMIME).signMessage(session, out, cryptoKey)
    // Transport.send(out)
    if (wkSmtpHost != "") {
      out.send()
    }
  }

  public function createHtmlEmail(wkSmtpHost : String, wkSmtpPort : String, email : Email) : HtmlEmail {
    //Set the host smtp address
    var props = new Properties()
    props.put("mail.smtp.host", wkSmtpHost)
    props.put("mail.smtp.port", wkSmtpPort)
//    props.put("mail.smtp.ssl.enable", "true")
    var address : String
    var name : String
    if (email.Sender != null && email.Sender.EmailAddress != null) {
      address = email.Sender.EmailAddress
      name = email.Sender.Name
    } else {
      address = _defaultSenderEmail
      name = _defaultSenderName
    }
    props.put("sender.email", address)
    props.put("sender.name", name)

    // create some properties and get the default Session
    var sn = Session.getInstance(props)
    sn.setDebug(debug)

    var out = new HtmlEmail(sn)
    out.setFrom(address, name)
    out.setCharset("UTF-8")
    if (email.ReplyTo != null && email.ReplyTo.EmailAddress != null) {
      address = email.ReplyTo.EmailAddress
      name = email.ReplyTo.Name
    }
    out.addReplyTo(address, name)
    populateEmail(out, email)
    return out
  }

  /** This will create the actual email documents for this email.  There are many reasons why there maybe different
   * versions of an email from the same information.  However, locale is not one of them, since the email information was
   * localized prior to being written to the message queue.  A good example is if the documents exceed some maximum email
   * size, it might be split into multiple emails.  Or your could generate one email for internal users and another for external
   * users.
   *
   * @param email the email payload to send
   * @return the email object that can be sent
   * @throws MessagingException if there are problems create the out email
   */
  protected function populateEmail(out : HtmlEmail, email : Email) {
    addHeaders(out, email)
    addRecipients(out, email)
    out.setSubject(email.Subject)
    addDocuments(out, email)
    addBody(out, email)
  }

  protected function addHeaders(out : HtmlEmail, email : Email) {
    for (header in email.Headers) {
      out.addHeader(header.First, header.Second)
    }
  }

  /** This will add recipients to the mime multipart document, and return true if all addresses were internal.
   *
   * @param out the create multipart mime document
   * @param email the email payload extracting information from
   * @return true if all recipients where internal
   * @throws MessagingException if there are problems adding recipients
   */
  protected function addRecipients(out : HtmlEmail, email : Email) {
    for (contact in email.ToRecipients) {
      out.addTo(contact.EmailAddress, contact.Name)
    }
    for (contact in email.CcRecipients) {
      out.addTo(contact.EmailAddress, contact.Name)
    }
    for (contact in email.BccRecipients) {
      out.addTo(contact.EmailAddress, contact.Name)
    }
  }

  /** The only thing here is if the body starts with <html> treat it like html
   * 
   */
  protected function addBody(out : HtmlEmail, email : Email) {
    if (email.Html) {
      out.setHtmlMsg(email.Body)
    }
    else {
      out.setMsg(gw.util.GosuEscapeUtil.escapeForHTML(email.Body))
    }
  }


  /** This will add the attached documents to the email multipart packet, it uses IDocumentContentSource to retrieve
   * a documents internal or external image based on the internalOnly flag.
   *
   * @param out the resulting mime multipart document
   * @param email the email to sent the xml email payload
   * @param internalOnly whether all email addresses where internal
   * @throws MessagingException if there were errors adding parts to the mime document
   */
  protected function addDocuments(out : HtmlEmail, email : Email) {
    if (!email.Documents.Empty) {
      for (var doc in email.Documents) {
        var ds = new gw.api.email.AbstractEmailMessageTransport.DocumentContentsDataSource(doc, false)
        out.attach(ds, doc.Name + getFileExtensionForDocument(doc), doc.Description)
      }
    }
  }

}
