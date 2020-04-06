package gw.api.copy

/**
 * Groups a distinct set of {@link Copier}s and exposes an attribute {@link #ShouldCopyAll} to enable
 * the copying of all children. Each individual child is exposed using the {@link #Copiers} attribute
 * cast to the child {@link Copier}s of type T.
 * The {@link #prepareRoot} method can be used to prepopulate the root (see {@link AllCoverageCopier}).
 * 
 * You can use this class then to group certain types of {@link Copier}s (all of the same type) and also
 * to expose them individually.
 * 
 * @see AllCoverageCopier
 */
@Export
abstract class GroupingCompositeCopier<T extends Copier<?>, S extends KeyableBean> extends CompositeCopier<S, S> {

  var _shouldCopyAll : boolean as ShouldCopyAll
  
  construct() {
    shouldCopy()
  }
  
  /**
   * Returns the list of {@link Copier}s being grouped.
   */
  property get Copiers() : List<T> {
    return AllCopiers as List<T>
  }
  
  /**
   * Makes sure that all child {@link Copier}s are enabled.
   */
  final override function copyRoot(root : S) {
    prepareRoot(root)
    if (_shouldCopyAll) {
      this.AllCopiers.each(\ c -> c.shouldCopy())
    }    
  }
  
  /**
   * This {@link Copier} is used for grouping and usually does not need to handle the root.
   */
  override function getOrCreateRoot(target : S) : S {
    return target
  }
  
  /**
   * Optional extension point to prepopulate the root.
   */
  function prepareRoot(root : S) {
  }
}
