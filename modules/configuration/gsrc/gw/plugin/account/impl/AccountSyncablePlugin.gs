package gw.plugin.account.impl
uses gw.plugin.account.IAccountSyncablePlugin
uses gw.api.domain.account.AccountSyncable

/**
 * An implementation of IAccountSyncablePlugin that delegates immediately to the account syncable.
 * While apparently useless, this construction allows the OOTB PolicyCenter to work while still
 * having a plugin structure that allows other implementations to be substituted.
` */

@Export
class AccountSyncablePlugin implements IAccountSyncablePlugin {

  override function refreshAccountInformation(accountSyncable : AccountSyncable) {
    accountSyncable.refreshAccountInformation()
  }

}
