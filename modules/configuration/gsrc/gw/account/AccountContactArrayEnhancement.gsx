package gw.account

uses gw.api.database.Query

uses java.util.Collections

enhancement AccountContactArrayEnhancement : AccountContact[] {
  function asViews() : AccountContactView[] {
    var views = {NewAccountContactViews, DBAccountContactViews}.flatten().partitionUniquely(\ v -> v.AccountContact.ID.Value)
    return this.map(\ ac -> views[ac.ID.Value])
  }

  private property get NewAccountContactViews() : List<AccountContactView> {
    return NewAccountContacts*.AccountContactView.toList()
  }

  private property get DBAccountContactViews() : List<AccountContactView> {
    var qry = Query.make(AccountContactView)
    var acs = DBAccountContacts

    if ( !acs.IsEmpty ) {
        var acct = acs[0].Account

        if ( acs.allMatch(\ ac -> ac.Account == acct) ) {
          /* optimize to Account to remove necessity to probe using IN ... */
          qry.compare("Account", Equals, acct)
          if ( acs.allMatch(\ ac -> ac.Active) ) {
            qry.compare("Active", Equals, true)
          }
          /* at this point the query may return a (slight) superset of the
           * intended Acc'tContactView's, which will be filtered by the mapping
           * performed by asViews from the contents of this array to the views
           * result...
           */
        } else {
          qry.compareIn("ID", DBAccountContacts)
        }
        return qry.select().toList()
    }

    // no persistent AccountContact instances...
    return Collections.EMPTY_LIST as List<AccountContactView>;
  }

  property get NewAccountContacts() : AccountContact[] {
    return getAccountContacts(true)
  }

  private property get DBAccountContacts() : AccountContact[] {
    return getAccountContacts(false)
  }

  private function getAccountContacts(findNew : boolean) : AccountContact[] {
    return this.where(\ ac -> ac.New == findNew)
  }
}
