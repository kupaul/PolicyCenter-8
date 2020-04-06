package gw.account

enhancement AccountListEnhancement : com.guidewire.pc.web.controller.AccountList {
  
  /**
   * Update account summary fields when the contact name changes.
   * @param contact the contact that has changed
   * @param account the account that the contact is currently associated with
   */
  function updateAccountNameAfterContactNameChange(contact : Contact, account: Account) {
    for (summary in this.AccountSummaries) {
      if (summary.AccountNumber == account.AccountNumber) {
          summary.AccountHolderName = contact.DisplayName          
          summary.AccountHolderAddress = contact.PrimaryAddress.DisplayName
      }
    }
  }
 
  /**
   * Update account summary fields when the account holder changes.
   * @param accountHolder the account holder that has changed
   */
  function updateAccountNameAfterAccountHolderChange(accountHolder: AccountHolder) {
    updateAccountNameAfterContactNameChange(accountHolder.AccountContact.Contact,
                                            accountHolder.AccountContact.Account)
  }
 
}
