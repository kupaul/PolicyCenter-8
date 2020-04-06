package gw.api.database
uses gw.lang.parser.IUsageSiteValidatorReference

enhancement GWIQueryResultEnhancement<QT extends gw.pl.persistence.core.Bean, RT> : gw.api.database.IQueryResult<QT, RT>
{
  @IUsageSiteValidatorReference(gw.api.database.QueryOrderByParser)
  function orderBy(column : block(row:QT):Object) : IQueryResult<QT,RT> {
    QueryOrderByParser.orderBy( this, column, true, true )
    return this
  }
    
  @IUsageSiteValidatorReference( gw.api.database.QueryOrderByParser )
  function orderByDescending(column : block(row:QT):Object) : IQueryResult<QT,RT> {
    QueryOrderByParser.orderBy( this, column, true, false )
    return this
  }
  
  @IUsageSiteValidatorReference( gw.api.database.QueryOrderByParser )
  function thenBy(column : block(row:QT):Object) : IQueryResult<QT,RT> {
    QueryOrderByParser.orderBy( this, column, false, true )
    return this
  }
  
  @IUsageSiteValidatorReference( gw.api.database.QueryOrderByParser )
  function thenByDescending(column : block(row:QT):Object) : IQueryResult<QT,RT> {
    QueryOrderByParser.orderBy( this, column, false, false )
    return this
  }
}
