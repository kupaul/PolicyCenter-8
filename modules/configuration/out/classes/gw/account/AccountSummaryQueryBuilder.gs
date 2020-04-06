package gw.account

@Export
class AccountSummaryQueryBuilder extends AccountQueryBuilderBase<AccountSummary, AccountSummaryQueryBuilder> {
  
  override protected property get SelectQueryBuilderType() : Type {
    return Account
  }
  
}
