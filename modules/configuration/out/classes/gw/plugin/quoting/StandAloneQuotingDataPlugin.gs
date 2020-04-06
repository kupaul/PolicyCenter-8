package gw.plugin.quoting

uses gw.api.database.Query

uses java.lang.Integer

@Export
class StandAloneQuotingDataPlugin implements QuotingDataPlugin {

  static var _idCounter = -1
  
  // Just get any Account with Person in CA as the AccountContact and with producer codes.
  override function getAccount(requestData : Object) : Account {
    var accountsWithAccountProducerCode = Query.make(Account).join(AccountProducerCode, "Account")
    var accounts = accountsWithAccountProducerCode.select().toList()
    var account = accounts.where(\ a -> a.AccountHolder.AccountContact.Person 
        and a.AccountHolder.AccountContact.Contact.PrimaryAddress.State == TC_CA).first()
    return account
  }

  override function sendQuotingData(data : String) : Integer {
    _idCounter++
    return _idCounter
  }

}
