package gw.api.database

uses gw.lang.parser.IUsageSiteValidatorReference

enhancement GWISelectQueryBuilderEnhancement<QT extends gw.pl.persistence.core.Bean> : gw.api.database.ISelectQueryBuilder<QT> {

  @IUsageSiteValidatorReference( gw.api.database.QueryColumnParser )
  function select<RT>(columns : block(row : QT) : RT) : IQueryResult<QT, RT> {
    var res = QueryColumnParser.select<QT,RT>( this, columns)
    return res
  }

}
