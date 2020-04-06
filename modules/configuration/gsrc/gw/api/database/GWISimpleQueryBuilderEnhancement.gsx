package gw.api.database

uses gw.entity.IEntityType
uses java.lang.IllegalArgumentException
uses gw.api.database.spatial.SpatialPoint
uses gw.api.database.spatial.SpatialPolygon
uses gw.lang.reflect.features.PropertyReference
uses java.util.Arrays

enhancement GWISimpleQueryBuilderEnhancement<QT extends gw.pl.persistence.core.Bean> : ISimpleQueryBuilder<QT>
{
  /**
   * Compares a property against a value given an operation type.
   * 
   * @param propRef The property to compare
   * @param op The operation
   * @param value The value
   * @return this.  Used for the builder pattern
   */
  function compare<V>(propRef:PropertyReference<gw.pl.persistence.core.Bean,V>, op:Relop, value:V) : Restriction<QT> {
    return compare(propRef.FeatureInfo.Name, op, value)
  }

  /**
   * Compares a property against a value given an operation type.
   *
   * Value types of Key, Bean, and typekeys are accepted
   *
   * A value type of DBFunction is handled as well.
   *
   * @param propertyName The property to compare
   * @param op The operation
   * @param value The value
   * @return this.  Used for the builder pattern
   */
  function compare(propertyName : String, op : Relop, value : Object) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.compare(PropertyResolver.getProperty(this.EntityType, propertyName), op, value)
  }

  /**
   * Compares a property against a value given an operation type.  The comparison is done using the configured lignuistic search
   * function, which varies by database type, but is typically "lower", that is, case insenstively.
   * @param op The operation
   * @param value The value
   * @return this.  Used for the builder pattern
  */
  function compareIgnoreCase(propRef:PropertyReference<gw.pl.persistence.core.Bean,String>, op:Relop, value:String) : Restriction<QT> {
     return compareIgnoreCase(propRef.FeatureInfo.Name, op, value)
  }

  /**
   * Compares a property against a value given an operation type.  The comparison is done using the configured lignuistic search 
   * function, which varies by database type, but is typically "lower", that is, case insenstively.
   *
   * Value must be of type String.
   *
   * If a case-insensitive comparison that helps drive the query plan is done on a large table, then the property should
   * have the supportsLinguisticSearch attribute and the denorm column indexed.
   *
   * @param propertyName The property to compare
   * @param op The operation
   * @param value The value
   * @return this.  Used for the builder pattern
   */
  function compareIgnoreCase(propertyName : String, op : Relop, value : Object) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.compareIgnoreCase(PropertyResolver.getProperty(this.EntityType, propertyName), op, value)
  }

 /**
  *  Compares a property against a range.
  *  @param propRef The property to compare
  *  @param range the range to compare against.  The range may be upper or lower bounder, or a complete range.
  *  @return this.  Used for the builder pattern
  */
  function compare<V>(propRef:PropertyReference<gw.pl.persistence.core.Bean,V>, value:Range<V>) : Restriction<QT> {
       return compare(propRef.FeatureInfo.Name, value)
  }
  
  /**
   * Compares a property against a range.
   *
   * @param propertyName The property to compare
   * @param range the range to compare against.  The range may be upper or lower bounder, or a complete range.
   * @return this.  Used for the builder pattern
   */
  function compare(propertyName : String, value : Range) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    if (value == null) {
      throw new IllegalArgumentException("value cannot be null")
    }
    return this.compare(PropertyResolver.getProperty(this.EntityType, propertyName), value)
  }

  /**
    * Compares a property against two values using a between clause.
    * This will throw an exception if either startValue or endValue, or both are null.
    * @param propRef The property to compare
    * @param startValue The start value of the between
    * @param endValue The end value of the between
    * @return this.  Used for the builder pattern
   */
  function between<V>(propRef:PropertyReference<gw.pl.persistence.core.Bean,V>, startValue:V, endValue:V) : Restriction<QT> {
    return between(propRef.FeatureInfo.Name, startValue, endValue)
  }
  
  /**
   * Compares a property against two values using a between clause.
   * This will throw an exception if either startValue or endValue, or both are null.
   *
   * Value types of Key, Bean, and typekeys are accepted
   *
   * A value type of DBFunction is handled as well.
   *
   * @param propertyName The property to compare
   * @param startValue The start value of the between
   * @param endValue The end value of the between
   * @return this.  Used for the builder pattern
   */
  function between(propertyName : String, startValue : Object, endValue : Object) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.between(PropertyResolver.getProperty(this.EntityType, propertyName), startValue, endValue)
  }

  /**
    * Compares a property against a range of values using an in clause
    *
    * @param propRef The property to compare
    * @param values The values to compare using an in clause
    * @return this.  Used for the builder pattern
   */
  function compareIn<V>(propRef:PropertyReference<gw.pl.persistence.core.Bean,V>, values:V[]) : Restriction<QT> {
    return compareIn(propRef.FeatureInfo.Name, values)
  }
  
  /**
   * Compares a property against a range of values using an in clause
   *
   * @param propertName The property to compare
   * @param values The values to compare using an in clause
   * @return this.  Used for the builder pattern
   */
  function compareIn(propertName : String, values : Object[]) : Restriction<QT> {
    if (propertName == null) {
      throw new IllegalArgumentException("propertName cannot be null")
    }
    if (values == null) {
      throw new IllegalArgumentException("values cannot be null")
    }
    return this.compareIn(PropertyResolver.getProperty(this.EntityType, propertName), Arrays.asList(values))
  }

  /**
   * Compares a property against a range of values using a not in clause
   *
   * @param propRef The property to compare
   * @param values The values to compare using a not in clause
   * @return this.  Used for the builder pattern
   */
  function compareNotIn<V>(propRef:PropertyReference<gw.pl.persistence.core.Bean,V>, values:V[]) : Restriction<QT> {
    return compareNotIn(propRef.FeatureInfo.Name, values)
  }
  
  /**
   * Compares a property against a range of values using a not in clause
   *
   * @param propertyName The property to compare
   * @param values The values to compare using a not in clause
   * @return this.  Used for the builder pattern
   */
  function compareNotIn(propertyName : String, values : Object[]) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    if (values == null) {
      throw new IllegalArgumentException("values cannot be null")
    }
    return this.compareNotIn(PropertyResolver.getProperty(this.EntityType, propertyName), Arrays.asList(values))
  }
    
  /**
   * Compares a varchar property against a string value using a starts-with clause (i.e. property='string%'
   *
   * @param propertyName The property to compare
   * @param values The value to compare using a LIKE clause, passed as a com.guidewire.commons.system.database.ConstantFunction that returns a string.
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function startsWith(propertyName : String, value : DBFunction, ignoreCase : boolean) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.startsWith(PropertyResolver.getProperty(this.EntityType, propertyName), value, ignoreCase)
  }
  
  /**
   * Compares a varchar property against a string value using a starts-with clause (i.e. property='string%'
   *
   * @param propertyName The property to compare
   * @param values The value to compare using a LIKE clause
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function startsWith(propertyName : String, value : String, ignoreCase : boolean) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.startsWith(PropertyResolver.getProperty(this.EntityType, propertyName), value, ignoreCase)
  }

  /**
   * Compares a varchar property against a string value using a starts-with clause (i.e. property='string%'
   *
   * @param propRef The property to compare
   * @param values The value to compare using a LIKE clause
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function startsWith(propRef:PropertyReference<gw.pl.persistence.core.Bean,String>, value:String, ignoreCase:boolean) : Restriction<QT> {
    return startsWith(propRef.FeatureInfo.Name, value, ignoreCase)
  }

  /**
   * Compares a varchar property against a DBFunction.Constant string value using a contains clause (i.e. property='%string%')
   *
   * @param propertyName The property to compare
   * @param value The DBFunction.Constant string value to compare using a LIKE clause
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function contains(propertyName : String, value : DBFunction, ignoreCase : boolean) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.contains(PropertyResolver.getProperty(this.EntityType, propertyName), value, ignoreCase)
  }
  
  /**
   * Compares a varchar property against a string value using a contains clause (i.e. property='%string%')
   *
   * @param propertyName The property to compare
   * @param value The string values to compare using a LIKE clause
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function contains(propertyName : String, value : String, ignoreCase : boolean) : Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.contains(PropertyResolver.getProperty(this.EntityType, propertyName), value, ignoreCase)
  }

  /**
   * Compares a varchar property against a string value using a contains clause (i.e. property='%string%')
   *
   * @param propertyName The property to compare
   * @param value The string values to compare using a LIKE clause
   * @param ignoreCase True to do a case-insensitive search, false if not
   * @return this.  Used for the builder pattern
   */
  function contains(propRef:PropertyReference<gw.pl.persistence.core.Bean,String>, value:String, ignoreCase:boolean) : Restriction<QT> {
    return contains(propRef.FeatureInfo.Name, value, ignoreCase)
  }

  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two propertiess are required, a property in the current table and a property in the join table.
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   * @param thisPropRef the property in the current table to compare against
   * @param op the in clause operation
   * @param joinPropRef he property in the joined-to table
   * @return this.  Used for the builder pattern
   */
  function subselect(thisPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>, op:InOperation, joinPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>) : Table<QT> {
    return subselect(thisPropRef.FeatureInfo.Name, op, joinPropRef.RootType as IEntityType, joinPropRef.FeatureInfo.Name)
  }

  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two properties are required, a property in the current table and a property in the join table.
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param thisPropRef the property in the current table to compare against
   * @param op the in clause operation
   * @param joinFunction a DB function wrapping a property in the joined-to table
   * @return this.  Used for the builder pattern
   */
  function subselect(thisPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>, op:InOperation, joinFunction:DBFunction) : Table<QT> {
    return subselect(thisPropRef.FeatureInfo.Name, op, joinFunction)
  }

  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two properties are required, a property in the current table and a property in the join table.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param thisTableFunction a DB function wrapping a property in the current table
   * @param op the in clause operation
   * @param joinPropRef The property on the join table
   * @return this.  Used for the builder pattern
   */
  function subselect(thisTableFunction:DBFunction, op :InOperation, joinPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>) : Table<QT> {
    return subselect(thisTableFunction, op, joinPropRef.RootType as IEntityType, joinPropRef.FeatureInfo.Name)
  }
  
  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two propertiess are required, a property in the current table and a property in the join table.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param propertyInJoinEntity the property in the joined-to table
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity : String, op : InOperation, typeToJoinTo : IEntityType, propertyInJoinEntity : String) : Table<QT> {
    if (propertyInThisEntity == null) {
      throw new IllegalArgumentException("propertyInThisEntity cannot be null")
    }
    if (propertyInJoinEntity == null) {
      throw new IllegalArgumentException("propertyInJoinEntity cannot be null")
    }
    return this.subselect(
            PropertyResolver.getProperty(this.EntityType, propertyInThisEntity),
            op,
            PropertyResolver.getProperty(typeToJoinTo, propertyInJoinEntity)
    )
  }
  
  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two properties are required, a property in the current table and a property in the join table.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param joinFunction a DB function wrapping a property in the joined-to table
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity : String, op : InOperation, joinFunction : DBFunction) : Table<QT> {
    if (propertyInThisEntity == null) {
      throw new IllegalArgumentException("propertyInThisEntity cannot be null")
    }
    if (joinFunction == null) {
      throw new IllegalArgumentException("joinFunction cannot be null")
    }
    return this.subselect(PropertyResolver.getProperty(this.EntityType, propertyInThisEntity), op, joinFunction)
  }
  
  /**
   * Joins a table with this table using a sub-select clause.
   *
   * Two properties are required, a property in the current table and a property in the join table.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param thisTableFunction a DB function wrapping a property in the current table
   * @param op the in clause operation
   * @param propertyInJoinEntity the property in the joining table
   * @return this.  Used for the builder pattern
   */
  function subselect(thisTableFunction : DBFunction, op : InOperation,  typeToJoinTo : IEntityType, propertyInJoinEntity : String) : Table<QT> {
    if (thisTableFunction == null) {
      throw new IllegalArgumentException("thisTableFunction cannot be null")
    }
    if (propertyInJoinEntity == null) {
      throw new IllegalArgumentException("propertyInJoinEntity be null")
    }
    return this.subselect(thisTableFunction, op, PropertyResolver.getProperty(typeToJoinTo, propertyInJoinEntity))
  }

  /**
   * Joins a property from table with a property from another query.
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param thisPropRef the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param qPropRef the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(thisPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>, op:InOperation,
                    queryToJoinTo:IQuery, qPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>) : Table<QT> {
    return subselect(thisPropRef.FeatureInfo.Name, op, queryToJoinTo, qPropRef.FeatureInfo.Name)
  }
  
  /**
   * Joins a property from table with a property from another query.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param propertyInQuery the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity : String, op : InOperation, queryToJoinTo : IQuery, propertyInQuery : String) : Table<QT> {
    if (propertyInThisEntity == null) {
      throw new IllegalArgumentException("propertyInThisEntity cannot be null")
    }
    if (propertyInQuery == null) {
      throw new IllegalArgumentException("propertyInQuery cannot be null")
    }
    return this.subselect(
            PropertyResolver.getProperty(this.EntityType, propertyInThisEntity),
            op,
            queryToJoinTo,
            PropertyResolver.getProperty(queryToJoinTo.EntityType, propertyInQuery)
    )
  }
  
  /**
   * Joins a property wrapped by a function from table with a property from another query.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param propertyInQuery the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity : String, op : InOperation, queryToJoinTo : IQuery, propertyInQuery : DBFunction) : Table<QT> {
    if (propertyInThisEntity == null) {
      throw new IllegalArgumentException("propertyInThisEntity cannot be null")
    }
    if (propertyInQuery == null) {
      throw new IllegalArgumentException("propertyInQuery cannot be null")
    }
    return this.subselect(PropertyResolver.getProperty(this.EntityType, propertyInThisEntity), op, queryToJoinTo, propertyInQuery)
  }

  /**
   * Joins a property wrapped by a function from table with a property from another query.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param thisPropRef the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param propertyInQuery the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(thisPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>, op:InOperation, queryToJoinTo:IQuery, propertyInQuery:DBFunction) : Table<QT>  {
    return subselect(thisPropRef.FeatureInfo.Name, op, queryToJoinTo, propertyInQuery)
  }
  
  /**
   * Joins a property from table with a property wrapped by a function from another query.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   *
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param propertyInQuery the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity : DBFunction, op : InOperation, queryToJoinTo : IQuery, propertyInQuery : String) : Table<QT> {
    if (propertyInThisEntity == null) {
      throw new IllegalArgumentException("propertyInThisEntity cannot be null")
    }
    if (propertyInQuery == null) {
      throw new IllegalArgumentException("propertyInQuery cannot be null")
    }
    return this.subselect(propertyInThisEntity, op, queryToJoinTo, PropertyResolver.getProperty(queryToJoinTo.EntityType, propertyInQuery))
  }

  /**
   * Joins a property from table with a property wrapped by a function from another query.
   *
   * This will generate an IN clause if the operation is <i>CompareIn</i>.
   * This will generate a NOT EXISTS clause if the operation is <i>CompareNotIn</i>
   *
   * @param propertyInThisEntity the property in the current table to compare against
   * @param op the in clause operation
   * @param queryToJoinTo the joining query
   * @param qPropRef the joining property in the query
   * @return this.  Used for the builder pattern
   */
  function subselect(propertyInThisEntity:DBFunction, op:InOperation, queryToJoinTo:IQuery, qPropRef:PropertyReference<gw.pl.persistence.core.Bean,?>) : Table<QT> {
    return subselect(propertyInThisEntity, op, queryToJoinTo, qPropRef.FeatureInfo.Name)
  }

  /**
   * Returns a reference to the column that backs the given property
   * @param propertyName the property to get a reference from.  The property must be on this table
   * @return a reference to the column that backs the given property
   */
  function getColumnRef(propertyName : String) : ColumnRef {
    return this.getColumnRef(PropertyResolver.getProperty(this.EntityType, propertyName))
  }

  /**
   * Searches for points that are 'distance' units from center. The query result is sorted by distance from center
   * in ascending order. Other order by columns may be specified, however distance is always implicitly the first
   * expression in the sort.
   * @param propertyName the property in the current table
   * @param center the point to search from
   * @param distance the range to search for
   * @param unitOfDistance the unit of distance
   * @return this.  Used for the builder pattern
   */
  function withinDistance(propertyName : String, center: SpatialPoint, distance : Number, unitOfDistance : UnitOfDistance): Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.withinDistance(PropertyResolver.getProperty(this.EntityType, propertyName), center, distance, unitOfDistance)
  }

  /**
   * Searches for points that are 'distance' units from center. The query result is sorted by distance from center
   * in ascending order. Other order by columns may be specified, however distance is always implicitly the first
   * expression in the sort.
   * @param propertyName the property in the current table
   * @param beanPathToSpatialColumn Bean path to spatial column, including root entity.
   * @param center the point to search from
   * @param distance the range to search for
   * @param unitOfDistance the unit of distance
   * @return this.  Used for the builder pattern
   */
  function withinDistance(propertyName : String, beanPathToSpatialColumn : String, center: SpatialPoint, distance : Number, unitOfDistance : UnitOfDistance): Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.withinDistance(PropertyResolver.getProperty(this.EntityType, propertyName), beanPathToSpatialColumn, center, distance, unitOfDistance)
  }

  /**
   * Searches for points that are within or not within the given polygon. Points on the boundary of the polygon are
   * considered within.
   *
   * @param column The column to compare. Must be a column of type spatialpoint.
   * @param findIn true for finding points in the polygon; false for finding points outside the polygons.
   * @param polygon the polygon to search
   * @return this.  Used for the builder pattern
   */
  function withinPolygon(propertyName : String, findIn: boolean, polygon: SpatialPolygon): Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.withinPolygon(PropertyResolver.getProperty(this.EntityType, propertyName), findIn, polygon)
  }

  /**
   * Searches for points that are within or not within the given polygon. Points on the boundary of the polygon are
   * considered within.
   *
   * @param column The column to compare. Must be a column of type spatialpoint.
   * @param beanPathToSpatialColumn Bean path to spatial column, including root entity.
   * @param findIn true for finding points in the polygon; false for finding points outside the polygons.
   * @param polygon the polygon to search
   * @return this.  Used for the builder pattern
   */
  function withinPolygon(propertyName : String, beanPathToSpatialColumn : String, findIn: boolean, polygon: SpatialPolygon): Restriction<QT> {
    if (propertyName == null) {
      throw new IllegalArgumentException("propertyName cannot be null")
    }
    return this.withinPolygon(PropertyResolver.getProperty(this.EntityType, propertyName), beanPathToSpatialColumn, findIn, polygon)
  }
}
