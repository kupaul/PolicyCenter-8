package gw.api.database

uses gw.api.path.PersistentPath
uses java.lang.IllegalArgumentException
uses gw.entity.IEntityPropertyInfo
uses com.google.common.base.Preconditions

enhancement GWQuerySelectColumnsEnhancement : QuerySelectColumns {

  /**
   * @param path the persistent path
   * @return the query select column for the given persistent path
   */
  static function path(path : PersistentPath) : IQuerySelectColumn {
    return pathWithAlias(null, path);
  }

  /**
   * @param alias the alias for the query select column in query row map
   * @param path the persistent path
   * @return the query select column for the given persistent path
   */
  static function pathWithAlias(alias : String, path : PersistentPath) : IQuerySelectColumn {
    return QuerySelectColumns.pathWithAlias(alias, PropertyReferenceResolver.getEntityPropertyInfos(path));
  }

}