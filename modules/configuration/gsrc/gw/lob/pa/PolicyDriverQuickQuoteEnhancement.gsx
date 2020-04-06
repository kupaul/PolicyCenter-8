package gw.lob.pa

enhancement PolicyDriverQuickQuoteEnhancement : entity.PolicyDriver {

  function removeDriver() {
    // need to remove account contact if this driver has invalid first or last name
    if (!(this.FirstName.HasContent and this.LastName.HasContent)) {
      this.AccountContactRole.AccountContact.remove()
    }
    this.remove()
  }
}
