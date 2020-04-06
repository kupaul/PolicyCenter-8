package gw.api.database
uses gw.entity.IEntityPropertyInfo
uses gw.lang.reflect.IType
uses gw.entity.ILinkPropertyInfo
uses java.lang.IllegalArgumentException
uses gw.lang.reflect.features.PropertyReference

enhancement GWIQueryBuilderEnhancement<QT extends gw.pl.persistence.core.Bean> : IQueryBuilder<QT>
{
  /**
   * Used to join this table to another table via a foreign key in this table
   *
   * The FK will be joined with the ID of the corresponding table
   *
   * @param propertyOnThisEntity the FK to join through
   * @return this.  Used for builder pattern
   */
  function join(propertyOnThisEntity : String) : Table<QT> {
    if (propertyOnThisEntity == null) {
      throw new IllegalArgumentException("propertyOnThisEntity cannot be null")
    }
    return this.join(PropertyResolver.getProperty(this.EntityType, propertyOnThisEntity) as ILinkPropertyInfo)
  }

  /**
   * Used to join this table to another table via a foreign key in this table, or from an FK
   * on another table to this one.
   * The FK will be joined with the ID of the corresponding table.
   * @param propRef The FK to join through
   * @return The 'this' for building the query
   */
  function join(propRef:PropertyReference<gw.pl.persistence.core.Bean,gw.pl.persistence.core.Bean>) : Table<QT> {
    return join(propRef.PropertyInfo.Name)
  }

  /**
   * Used to join this table to another table via a foreign key in another table.
   *
   * The FK will be joined with the ID of the corresponding table
   *
   * Note that the type argument is only used to determine the other table. In order to restrict
   * the other table to a particular subtype, use the cast() method on the result of this join.
   *
   * @param type the type for the table to be joined via a foreign key
   * @param propertyOnOtherEntity the FK to join through
   * @return this.  Used for builder pattern
   */
  function join(type : IType, propertyOnOtherEntity : String) : Table<QT> {
    if (type == null) {
      throw new IllegalArgumentException("type cannot be null")
    }
    if (propertyOnOtherEntity == null) {
      throw new IllegalArgumentException("propertyOnOtherEntity be null")
    }
    return this.join(PropertyResolver.getProperty(type, propertyOnOtherEntity) as ILinkPropertyInfo)
  }

  /**
   * Used to join this table to another table via a foreign key in this table using an outer join
   *
   * The FK will be joined with the ID of the corresponding table
   *
   * @param propertyOnThisEntity the FK to join through
   * @return this.  Used for builder pattern
   */
  function outerJoin(propertyOnThisEntity : String) : Table<QT> {
    if (propertyOnThisEntity == null) {
      throw new IllegalArgumentException("propertyOnThisEntity cannot be null")
    }
    return this.outerJoin(PropertyResolver.getProperty(this.EntityType, propertyOnThisEntity) as ILinkPropertyInfo)
  }

  /**
   * Used to join this table to another table via a foreign key in another table using an outer join
   *
   * The FK will be joined with the ID of the corresponding table
   *
   * Note that the type argument is only used to determine the other table. In order to restrict
   * the other table to a particular subtype, use the cast() method on the result of this join.
   *
   * @param type the type for the table to be joined via a foreign key using an outer join
   * @param propertyOnOtherEntity the FK to join through
   * @return this.  Used for builder pattern
   */
  function outerJoin(type : IType, propertyOnOtherEntity : String) : Table<QT> {
    if (type == null) {
      throw new IllegalArgumentException("type cannot be null")
    }
    if (propertyOnOtherEntity == null) {
      throw new IllegalArgumentException("propertyOnOtherEntity cannot be null")
    }
    return this.outerJoin(PropertyResolver.getProperty(type, propertyOnOtherEntity) as ILinkPropertyInfo)
  }
  
  /**
   * Used to join this table via an outer join to another table via a foreign key in this table, or from an FK
   * on another table to this one.
   * @param The FK property to join on
   * @return The 'this' for building the query
   */
  function outerJoin(propRef:PropertyReference<gw.pl.persistence.core.Bean,gw.pl.persistence.core.Bean>) : Table<QT> {
    return outerJoin(propRef.PropertyInfo.Name)
  }

  /**
   * Used to join another query as an inline view.  This will produce a query with the inlineViewQuery as a inline view and will automatically select
   * all referenced properties from that query in the select statement.  For example:
   * <code>
   * var viewQuery = Query.make(TestA)
   *
   * var outerQuery = Query.make(TestE)
   * var inlineView = outerQuery.inlineView("ID", viewQuery, "E")
   * outerQuery.compare("E", GreaterThan, inlineView.getColumnRef(DBFunction.Max("A")))
   *
   * print(outerQuery.select().AtMostOneRow.ID)
   * </code>
   *
   * This would print the id of a TestE where TestE.E > MAX(all TestA's related to this TestE) and would generate the SQL
   * <code>
   *   select * from TestE INNER JOIN (select E, Max(A) MAX_A from TestA) testA_view GROUP BY E ON TestE.ID = testA_view.E AND TestE.E > testA_view.MAX_A
   * </code>
   */
  function inlineView(joinPropertyOnThisEntity : String, inlineViewQuery : Query, joinPropertyOnViewEntity : String) : Table<QT> {
    if (joinPropertyOnThisEntity == null) {
      throw new IllegalArgumentException("joinPropertyOnThisEntity cannot be null")
    }
    if (inlineViewQuery == null) {
      throw new IllegalArgumentException("inlineViewQuery cannot be null")
    }
    if (joinPropertyOnViewEntity == null) {
      throw new IllegalArgumentException("joinPropertyOnViewEntity cannot be null")
    }
    return this.inlineView(
            PropertyResolver.getProperty(this.EntityType, joinPropertyOnThisEntity),
            inlineViewQuery,
            PropertyResolver.getProperty(inlineViewQuery.EntityType, joinPropertyOnViewEntity)
    )
  }

}
