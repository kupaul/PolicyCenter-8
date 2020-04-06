package gw.billing
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.pl.messaging.MessageStatus
uses gw.plugin.messaging.BillingMessageTransport
uses gw.pl.logging.LoggerFactory
uses org.slf4j.Logger

enhancement ContactBillingEnhancement : entity.Contact {

  private property get BillingIntegationLogger() : Logger {
    return LoggerFactory.getLogger( "BillingIntegration" )
  }

  /**
   * Event messages to send account, policy period, producer to Billing System may be
   * blocked if the that account, policy period or producer used this contact and this
   * contact was not synced with Contact Manager at the time the event message is processed.
   * As the result, after the contact is synced, those messages (if any exist) should be
   * retried.
   */
  function retryBillingEventMessages(){
    BillingIntegationLogger.info("Finding event messages blocked by '${this}' contact to retry.")
    // Event message for policy period & account is queued by account so we only need
    // to retry all associated account's message queue
    var messageQuery = Query.make(Message)
    // don't need to compare account because the error description should limit the result
    // messageQuery.compareIn("Account", this.AccountContacts*.Account)
    messageQuery.compare("DestinationID", Equals, BillingMessageTransport.DEST_ID)
    messageQuery.compare("Status", Equals, MessageStatus.RETRYABLE_ERROR)
    messageQuery.compare("ErrorCategory", Equals, ErrorCategory.TC_CONTACT_UNSYNCED)
    // add criteria to check that the message is blocked by THIS contact
    messageQuery.compare("ErrorDescription", Equals, this.PublicID)
    var iter = messageQuery.select().iterator()
    while(iter.hasNext()){
      var blockedMessage = iter.next()
      BillingIntegationLogger.info("Retrying event message '${blockedMessage.EventName}' after contact '${this}' is synced.")
      this.Bundle.add(blockedMessage).retry()
    }
  }

  /**
   * Return true if this contact is associated with a producer.
   */
  function isProducerContact() : boolean {
    var query = findProducers()
    return not query.Empty
  }

  private function findProducers() : IQueryBeanResult<Organization>{
    var producerBusinessTypes = BusinessType.getTypeKeys(false)
      .where( \ b -> b.hasCategory(BusinessTypeCategory.TC_PRODUCER)).toTypedArray()
    return Query.make(Organization)
             .compareIn(Organization#Type.PropertyInfo.Name, producerBusinessTypes)
             .compare(Organization#Contact.PropertyInfo.Name, Equals, this)
             .select()
  }

  /**
   * Return true if this contact is an billingcontact or nameinsured contact
   */
  function isPolicyContact() : boolean{
    var roles = new typekey.AccountContactRole[]{
      typekey.AccountContactRole.TC_BILLINGCONTACT,
      typekey.AccountContactRole.TC_NAMEDINSURED,
      typekey.AccountContactRole.TC_ACCOUNTHOLDER}
    var query = Query.make(AccountContactRole)
    query.compareIn(AccountContactRole#Subtype.PropertyInfo.Name, roles)
    query.join(AccountContactRole#AccountContact.PropertyInfo.Name).compare(AccountContact#Contact.PropertyInfo.Name, Equals, this)
    return not query.select().Empty
  }

  /**
   * Returns all accounts which this contact is account holder
   */
  function findHeldAccounts() : IQueryBeanResult<Account>{
    return Query.make(Account)
             .compare(Account#AccountHolderContact.PropertyInfo.Name, Equals, this)
             .select()
  }
}
