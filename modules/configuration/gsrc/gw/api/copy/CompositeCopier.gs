package gw.api.copy
uses java.util.ArrayList
uses java.util.Collection

/**
 * A Copier that wraps a collection of copiers of a potentially different type, enabling the 
 * creation of a tree of copiers that reflects the structure of the data to be copied. This copies
 * source objects of type S into a target object of type T, where T normally contains an array or 
 * foreign key of type S. The child or delegate copiers of this class then copy into objects of 
 * type S or a supertype of S. For instance a CompositeCopier&lt;PersonalAutoLine, PersonalVehicle&gt; 
 * would copy a PersonalVehicle into a PersonalAutoLine, and could contain child copiers of type
 * Copier&lt;PersonalVehicle&gt; or Copier&lt;Coverable&gt;. Note that if ShouldCopy is false for
 * the CompositeCopier then none of the child copiers will be invoked.
 * <p/>
 * Subclasses should implement the getOrCreateRoot(target : T) : S method to create an object
 * representing the copy, and the copyRoot(root : S) method to actually copy fields of the object.
 * After calling these two methods, this class will automatically invoke any child copiers.
 * <p/>
 * This class includes collection oriented methods addCopier() and addAllCopiers() to support the
 * assembly of copier trees, and it includes a query method getCopiersWhere() that extracts lists 
 * of related Copiers from the tree for use in the UI.
 */
@Export
abstract class CompositeCopier<T extends KeyableBean, S extends KeyableBean> extends Copier<T> {
  var _delegateCopiers = new ArrayList<Copier<? super S>>()

  // --------------- Copying methods
  
  /**
   * Copies data from the "Source" of this copier into the given "target" object. This involves
   * finding or creating a new object in "target" that matches the "Source", copying data from
   * "Source" into the new object, and invoking child copiers with the new object as the target.
   */
  override function copy(target : T) {
    var root = getOrCreateRoot(target)
    copyRoot(root)
    for (copier in _delegateCopiers) {
      copier.copyInto(root)
    }
  }
  
  /**
   * Subclasses must override this method to copy data from "Source" to the object returned by
   * getOrCreateRoot(). Normally this method would only copy the columns and typekeys of "Source",
   * while children of "Source" (i.e., arrays and foreign keys) are copied by child Copiers.
   * However there are cases where it may make sense to copy child elements within this method,
   * such as when a separate Copier class would be too heavyweight.
   */
  abstract protected function copyRoot(root : S)

  /**
   * Subclasses must override this method to return an object representing "Source" within the
   * given "target". Normally this method will either create a new object or return an existing
   * object in "target" that matches "Source". The returned object will also be used as the target
   * for invoking child copiers. Note that this method is only responsible for creating or 
   * returning an object; the actual copying is performed by the copyBaseData() method and the 
   * child copiers. 
   */
  abstract protected function getOrCreateRoot(target : T) : S

  // --------------- Collection methods for constructing trees of Copiers
  
  /**
   * Adds a Copier to the collection of delegate Copiers. The Copier must be for the same type as,
   * or a supertype of, the type of object returned by getDelegateTarget().
   * For instance, getDelegateTarget() might return a PolicyLine, but a Copier for Coverables could still be added to
   * the composite because Coverable is a supertype of PolicyLine.
   */
  final function addCopier(copier : Copier<? super S>) {
    _delegateCopiers.add(copier)
  }

  /**
   * Adds all the Copiers from the argument collection to the list of delegate Copiers.
   */
  final function addAllCopiers(copiers : Collection<Copier<? super S>>) {
    _delegateCopiers.addAll(copiers)
  }

  // --------------- Query methods for extracting lists of similar Copiers from a tree

  /**
   * Returns a list of all delegate Copiers in this CompositeCopier only.
   */
  property get AllCopiers() : List<Copier<?>> {
    return _delegateCopiers
  }

  /**
   * Returns a list of all the Copiers in the tree that satisfy the given condition.
   */
  final function getCopiersWhere(cond(elt : Copier<?>) : boolean) : List<Copier<?>> {
    var copiers = new ArrayList<Copier<?>>()
    collectCopiersWhere(cond, copiers)
    return copiers
  }

  /**
   * Helper method for getCopiersWhere(). Subclasses should override this when they implement a 
   * delegate structure other than the simple list that is built into this class. For instance, 
   * there may be more than one member of the target class that is a potential target for copying
   * in which case the implementation might look something like:
   * <pre>
   * conditionalCollect(firstMemberCopier)
   * conditionalCollect(secondMemberCopier)
   * </pre>
   */
  protected function collectCopiersWhere(cond(elt : Copier<?>) : boolean, list : List<Copier<?>>) {
    for (copier in _delegateCopiers) {
      conditionalCollectCopier(cond, copier, list)
    }
  }

  /**
   * Helper method for collectCopiersWhere(). Should not need to be overridden. Adds the Copier to
   * the list if it meets the condition, otherwise delegates the collectCopiersWhere() call to the
   * Copier if it is a CompositeCopier. If a CompositeCopier exists in the resulting list, then
   * none of its descendant Copiers will.
   */
  protected function conditionalCollectCopier(cond(elt : Copier<?>) : boolean, copier : Copier<?>, list : List<Copier<?>>) {
    if (cond(copier)) {
      list.add(copier)
    } else if (copier typeis CompositeCopier<S, ? extends KeyableBean>) {
      copier.collectCopiersWhere(cond, list)
    }
  }

}
