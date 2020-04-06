package gw.api.database

uses gw.entity.IEntityType

enhancement GWQueryEnhancement<QT extends gw.pl.persistence.core.Bean> : Query<QT>
{  
  static function make<T extends gw.pl.persistence.core.Bean>(type : Type<T>) : Query<T> {
    var query = Query.Type.TypeInfo.getConstructor( {IEntityType} ).Constructor.newInstance({type}) as Query<T>
    // This call is necessary but the usage is internal and discouraged
    query.setRootName_Beware("gRoot")
    return query
  }
}
