/*
 * DataObjectAPIImpl.java
 *
 * 2003 ClaimCenter by Guidewire Software
 */

package gw.webservice
uses gw.api.webservice.ObjectFilter
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.DataObjectAPIImpl
uses gw.api.webservice.exception.BadIdentifierException


/**
 * Deprecated interface. There is no replacement. Instead, you should write your own Gosu class and publish
 * it as a web service by marking it with the <code>@RpcWebService</code> annotation.
 * <p/>
 * Methods in this class use XPath.  The notation draws heavily from
 * the new "Service Data Object" spec from BEA and IBM. See their
 * <a href="http://xml.coverpages.org/IBM-BEA-SDOv10.pdf">Service Data Ojbects</a>
 * specification.
 * Please note that certain characters need to be escaped in XPath notation.  Specifically:
 * ' goes to &apos; <br/>
 * " goes to &qout; <br/>
 * < goes to &lt; <br/>
 * > goes to &gt; <br/>
 * & goes to &amp;  <br/>
 *
 * @author mshaw
 * @version Jan 16, 2004 4:15:21 PM
 */
@RpcWebService
@Deprecated("Write your own Gosu class and publish it as a web service.")
@Export
class IDataObjectAPI {
 /**
   *<p>
   * Returns properties accessed from a root entity. Specify the paths as
   * strings. A single path may return multiple values if the path traverses an
   * array. Multiple paths return a two-dimensional array of values,
   * an array for each path specified.
   * </p><p>
   * A path can traverse any entity property but only a writeable property's
   * value can be set. This is the same set of properties that is accessible
   * from Gosu. See the Gosu API Reference in Studio for a list of
   * accessible properties. The set of available properties is a super-set of
   * the "exportable" properties that exist on SOAP entities.
   * </p><p>
   * The path leaf must reference a "simple" property (not an entity or
   * array) but the path can traverse through entities and arrays.
   * </p><p>
   * Specify the path in XPath notation. The notation draws heavily from
   * the new "Service Data Object" spec from BEA and IBM. See their
   * <a href="http://xml.coverpages.org/IBM-BEA-SDOv10.pdf">Service Data Ojbects</a>
   * specification.
   * </p><p>
   * <b>NOTE:</b> Array elements are indexed starting at 1 not 0.
   * </p>
   * <h4>Example</h4>
   * <p>
   * Get the names of all the users in a group.
   * </p>
   * <pre><code>
   * String[] path = new String[1]
   * path[0] = "users/user/credential/username"
   * api.getPathValues("group", "315", path)
   * </code></pre>
   * <p>
   * Get the public Ids of all the users in a group with a LoadFactor > 50
   * </p>
   * <pre><code>
   * String[] path = new String[1]
   * path[0] = "users[LoadFactor >= 50]/user/publicId"
   * api.getPathValues("group", "315", path)
   * </code></pre>
   *
   *
   * @param entityType The type of root entity. The type is case-insensitive,
   *                   e.g. <code>"Claim"</code> and <code>"claim"</code>, are both valid types.
   * @param publicId   The ID of the root object from which all paths
   *                   originate.
   * @param paths      Paths of the properties to return.
   * @return A two-dimensional array of string values. Each path specified
   *         has a corresponding string array in the results. The results return
   *         in the same order as the paths were specified. If a path returns no values,
   *         then its array is empty.
   */
  @Throws(SOAPException, "")
  @Throws(BadIdentifierException, "If the entity type or public id is invalid")
  function getPathValues(entityType : String , publicId : String, paths : String[]) : String[][] {
    return DataObjectAPIImpl.getPathValues( entityType, publicId, paths)
  }

  /**
   * <p>
   * Add, update, and remove values on entities relative to a root entity. All
   * changes are made in the same transaction. If one change fails none of
   * the changes are applied.
   * </p><p>
   * A path can traverse any entity property but only a writeable property's
   * value can be set. An entity's writeable properties are the same set of
   * properties accessible from Gosu. See the API Help in Studio for a list of
   * accessible properties. The set of accessible properties is a super-set of
   * the "exportable" properties available to SOAP entities.
   * </p><p>
   * A path's leaf must reference a "simple" property (not an entity or
   * array) but the path can traverse through entities and arrays.
   * </p><p>
   * Specify the path in XPath notation. The notation draws heavily from
   * the <a href="http://xml.coverpages.org/IBM-BEA-SDOv10.pdf">"Service Data Object"</a>
   * specification put out by BEA and IBM.
   *
   * </p><p>
   * <b>NOTE:</b> Array elements are indexed starting at 1 not 0.
   * </p>
   * <H4>Add Example</H4>
   * <p>
   * This example associates an existing user to a group by adding a new <code>GroupUser</code> entity
   * linking the two. The value of <code>newGroupUser/user</code> on the <code>newGroupUser</code> is
   * in the form <i>entityType:publicId</i>, where <code>user</code> is the <i>entityType</i> and
   * <code>74</code> is the user's <i>publicId</i>.
   * </p>
   * <pre><code>
   * InsertPathValue[] add = new InsertPathValue[1]
   * add[0] = new InsertPathValue()
   * add[0].setPath("users")
   * add[0].setRefId("newGroupUser")
   * PathValue[] update = new PathValue[2]
   * update[0] = new PathValue()
   * update[0].setPath("newGroupUser/user")
   * update[0].setValue("user:74")
   * update[1] = new PathValue()
   * update[1].setPath("newGroupUser/loadfactor")
   * update[1].setValue("80")
   * String remove = new String[0]
   * api.setPathValues("group", "315", add, update, remove)
   * </code></pre>
   * </p>
   * <H4>Remove Example</H4>
   * <p>
   * Disassociate a user from a group by removing the <code>GroupUser</code> entity that
   * links them. <code>74</code> is <i>publicId</i> of the user being removed from the group.
   * </p>
   *<pre><code>
   * InsertPathValue[] add = new InsertPathValue[0]
   * PathValue[] update = new PathValue[0]
   * String[] remove = new String[1]
   * remove[0] = "users[user/publicId='74']"
   * api.setPathValues("group", "315", add, update, remove)
   * </code></pre>
   *
   * @param entityType The type of root entity. The type is case-insensitive,
   *                   for example, <code>Claim</code> and <code>claim</code> are both valid types. If only
   *                   "rootless" entities are being added then <i>entityType<i> can
   *                   be <code>null</code>.
   * @param publicId   The ID of the root object from which all the paths start.
   *                   If only "rootless" entities are being added
   *                   then <i>entityType</i> can be <code>null</code>.
   * @param add        Path values of entities to add. The path leaf can
   *                   be <code>null</code> or refer to an array or a foreign key link. If
   *                   the path is <code>null</code> then a new "rootless" entity is
   *                   inserted. The refId is used to reference the new entity
   *                   when setting properties using update paths.
   * @param update     Path values of properties to set. If setting properties
   *                   on a newly inserted entity then start the path with the
   *                   refId of the new entity.
   * @param remove     Paths that point to entities to remove. The leaf of the
   *                   path must refer to a specific array element or a foreign
   *                   key link. An empty path ("") will remove the root entity.
   * @return <code>SetPathValuesResult</code> with the public Ids of any newly inserted entities.
   */
   @Throws(SOAPException, "")
   @Throws(BadIdentifierException, "If the entity type or public id is invalid")
  function setPathValues(entityType : String, publicId : String, add : InsertPathValue[], update : PathValue[], remove : String[]) : SetPathValuesResult {
    var pathValues = DataObjectAPIImpl.setPathValues( entityType, publicId, add, update, remove)
    var pathIdRefs = new List<SetPathValuesIDRef>(pathValues.size())
    pathValues.eachKeyAndValue( \ s, k ->pathIdRefs.add(new SetPathValuesIDRef(s, k.PublicID)))

    return new SetPathValuesResult(pathIdRefs as SetPathValuesIDRef[])
  }

  /**
   * <p>
   * Update values on entities relative to a root entity. All changes will be
   * made in the same transaction. If one change fails none of the changes will
   * be applied.
   * </p><p>
   * A path can traverse any entity property but only a writeable property's
   * value can be set. This is the same set of properties that is accessible
   * from Gosu. This <i>Gosu API Reference</i> contains a list of
   * accessible properties. The set of available properties is a super-set of
   * the "exportable" properties that exist on SOAP entities.
   * </p><p>
   * The leaf of a path must reference a "simple" property (not an entity or
   * array) but the path can traverse through entities and arrays.
   * </p><p>
   * Specify the path in XPath notation. The notation draws heavily from
   * the <a href="http://xml.coverpages.org/IBM-BEA-SDOv10.pdf">"Service Data Object"</a>
   * specification put out by BEA and IBM.
   * </p><p>
   * <b>NOTE:</b> Array elements are indexed starting at 1 not 0.
   * </p>
   * <H4>Example</H4>
   * <p>
   * Change the load factor of a group's parent.
   * </p>
   * <pre><code>
   * PathValue[] update = new PathValue[1]
   * update[0].setPath("parent/group/loadfactor")
   * update[0].setValue("50")
   * api.setPathValues("group", "315", update)
   * </code></pre>
   *
   * @param entityType The type of root entity. The type is case-insensitive,
   *                   e.g. <code>"Claim"</code> and <code>"claim"</code>, are both valid types.
   * @param publicId   The ID of the root object from which all paths will
   *                   start
   * @param pathValues Array of path values to set.  Each path value has a path,
   *                   starting from the root, and a value, which is the new
   *                   value to set on the field which is at the "leaf" of the
   *                   path.
   */
   @Throws(SOAPException, "")
   @Throws(BadIdentifierException, "If the entity type or public id is invalid")
  function setPathValues(entityType : String, publicId : String, pathValues : PathValue[]) {
    DataObjectAPIImpl.setPathValues( entityType, publicId, pathValues)
  }

  /**
   * <p>
   * Find a set of public Ids of the same type using the Gosu finder
   * notation. See the <i>Gosu Reference Guide</i> for details on how to build a
   * where clause. The size of the result set is capped by default at 100
   * objects. To override this default set the <code>GW_MAX_OBJECT_RETRIEVAL_PROPERTY</code>
   * property in the soap header using <code>SOAPOutboundHandler</code>.
   * </p>
   * <h4>Example</H4>
   * In the following example,  a Gosu finder expression is translated into a call to <code>findIds()</code>:
   * The following Gosu expression:
   * </P>
   * <pre>
   * <code>findIds(Claim with c in Claim where c.LossType == "AUTO" and c.AccidentType != "46")</code>
   * </pre>
   * <p>Becomes the following with IDataObjectAPI call:</p>
   * <pre>
   * <code>findIds("Claim", "c", "c.LossType == \"AUTO\" and c.AccidentType != \"46\"")</code>
   * </pre>
   *<p>
   * Use <code>getObjectById</code> to load the associated object data.
   *</p>
   * @param entityType  The type of entity to find.  Type is case-insensitive,
   *                    as a result <code>"Claim"</code> and <code>"claim"</code> are both valid entity types.
   * @param alias       Used in the where clause to refer to the root type
   *                    being returned, for example <code>"c"</code>.
   * @param whereClause Criteria to apply when finding objects. See the <i>Gosu
   *                    Reference Guide</i> for details on how to build a where
   *                    clause.
   * @return A set of public Ids
   */
   @Throws(SOAPException, "")
   @Throws(BadIdentifierException, "If the entity type is invalid")
  function findIds(entityType : String , alias : String, whereClause : String) : FindIdsResult {
    var ids = DataObjectAPIImpl.findIdsAndReturnArray( entityType, alias, whereClause)
    return new FindIdsResult(ids)
  }

 /**
   * <p>
   * Find a set of objects of the same type using the Gosu finder notation.
   * See the <i>Gosu Reference Guide</i> for details on how to build a <b>where</b> clause.
   * The result set's size is capped by default at 100 objects. To override
   * the default, set the <code>GW_MAX_OBJECT_RETRIEVAL_PROPERTY</code> property in the SOAP
   * header using <code>SOAPOutboundHandler</code>.
   * </p>
   *<p>
   * <b>This method is deprecated</b>. Returning all the matching object data without first knowing the
   * size of the matching set can be expensive. Instead, use <code>findIds</code> to find the matching set of ids and
   *<code>getObjectById</code> or <code>getPathValues</code> to load the associated entity data.
   *
   *
   * @param entityType  The type of entity to find.  Type is case-insensitive,
   *                    e.g. "Claim" and "claim" are both valid entity types.
   * @param alias       Used in the the where clause to refer to the root type
   *                    being returned, for example, <code>"c"</code>.
   * @param whereClause Criteria to apply when finding objects. See the <i>Gosu
   *                    Reference Guide</i> for details on how to build a where
   *                    clause.
   * @param filter      Object filter to apply to the root object. See <code>
   *                    ObjectFilter</code> for details on how the filter is applied
   *                    to an object graph. A <code>null</code> filter will return the entire
   *                    object graph, for example, <code>Claim</code> and its related objects such as
   *                    <code>Policy</code> and <code>Contacts</code>. This can have negative performance
   *                    implications and even cause <code>OutOfMemoryError</code>s if
   *                    the object graph returned is too large.  To avoid these
   *                    types of problems, a filter that limits the returned data
   *                    to just the desired fields should be used if possible.
   * @return Array of objects that match the where clause criteria
   *
   */
   @Throws(SOAPException, "")
   @Throws(BadIdentifierException, "If the entity type is invalid")
  function find(entityType : String, alias : String, whereClause : String, filter : ObjectFilter) : KeyableBean[] {
    return DataObjectAPIImpl.find( entityType, alias, whereClause, filter == null ? null : filter.FieldFilters )
  }

  /**
   * <p>
   * Get an object graph by the public Id of the root object.
   * </p>
   *
   * @param entityType The type of root entity.  Type is case-insensitive, e.g.
   *                   "Claim" and "claim" are both valid entity types.
   * @param publicId   The publicId of the root object to return.
   * @param filter     Object filter to apply to the root object. See {@link
   *                   ObjectFilter} for details on how the filter is applied to
   *                   an object graph. A NULL filter will return the entire
   *                   object graph, e.g. Claim and its related objects such as
   *                   Policy and Contacts. This can have negative performance
   *                   implications and even cause {@link OutOfMemoryError}s if
   *                   the object graph returned is too large.  To avoid these
   *                   types of problems, a filter that limits the returned data
   *                   to just the desired fields should be used if possible.
   * @return Root object of the object graph, NULL if an entity with that
   *         publicId does not exist.
   */
   @Throws(SOAPException, "")
   @Throws(BadIdentifierException, "If the entity type is invalid")
  function getObjectById(entityType : String, publicId : String, filter : ObjectFilter) : KeyableBean {
    return DataObjectAPIImpl.getObjectById( entityType, publicId, filter == null ? null : filter.FieldFilters )
  }

  /**
   * <p>
   * Get the next sequence number for a sequence key.
   * </p><p>
   * If this is a new sequence key a new sequence is created with initial value
   * <i>minValue</i>. If the sequence exists then the next number in the sequence is
   * returned. The sequence numbers are unique across a cluster.
   * </p>
   *
   * @param sequenceKey The sequenceKey on which a sequence number will be
   *                    generated for.
   * @param minValue    if the sequenceKey is new, it will be created and
   *                    initialized with <i>minValue</i>.
   * @return A unique sequence number for this sequence key.
   */
  @Throws(SOAPException, "")
  function getNextSequenceNumber(sequenceKey : String, minValue : long) : long {
    return DataObjectAPIImpl.getNextSequenceNumber( sequenceKey, minValue )
  }
}
