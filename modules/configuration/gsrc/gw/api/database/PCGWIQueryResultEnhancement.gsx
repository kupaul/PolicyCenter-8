package gw.api.database

uses gw.api.util.NullAwareOrderByUtil
uses gw.lang.reflect.IType

enhancement PCGWIQueryResultEnhancement<QT extends KeyableBean, RT> : gw.api.database.IQueryResult<QT, RT> {
  /**
   * Adds an ascending order by column with <code>null</code>s ordered first.
   *
   * @param type           The parent type for the property specified by <code>relativeColumn</code>.
   * @param relativeColumn Relative path to the column on which to add an order by.
   */
  function orderByNullAware(type : IType, relativeColumn : String) {
    NullAwareOrderByUtil.orderByNullAware(this, PropertyResolver.getProperty(type, relativeColumn))
  }

  /**
   * Adds an ascending order by column with <code>null</code>s ordered first.  Call this after calling
   * {@link #orderByNullAware(IType, String)}.
   *
   * @param type           The parent type for the property specified by <code>relativeColumn</code>.
   * @param relativeColumn Relative path to the column on which to add an order by.
   */
  function thenByNullAware(type : IType, relativeColumn : String) {
    NullAwareOrderByUtil.thenByNullAware(this, PropertyResolver.getProperty(type, relativeColumn))
  }

  /**
   * Adds a descending order by column with <code>null</code>s ordered last.
   *
   * @param type           The parent type for the property specified by <code>relativeColumn</code>.
   * @param relativeColumn Relative path to the column on which to add an order by.
   */
  function orderByDescendingNullAware(type : IType, relativeColumn : String) {
    NullAwareOrderByUtil.orderByDescendingNullAware(this, PropertyResolver.getProperty(type, relativeColumn))
  }

  /**
   * Adds a descending order by column with <code>null</code>s ordered last.  Call this after calling
   * {@link #orderByDescendingNullAware(IType, String)}.
   *
   * @param type           The parent type for the property specified by <code>relativeColumn</code>.
   * @param relativeColumn Relative path to the column on which to add an order by.
   */
  function thenByDescendingNullAware(type : IType, relativeColumn : String) {
    NullAwareOrderByUtil.thenByDescendingNullAware(this, PropertyResolver.getProperty(type, relativeColumn))
  }
}