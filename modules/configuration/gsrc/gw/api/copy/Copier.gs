package gw.api.copy

/**
 * Abstract class for conditionally copying data from a "Source" into a target of type T. Concrete
 * subclasses specify the type of the source and target data, as well as details of how the copy
 * is performed.  
 */
@Export
abstract class Copier<T extends Bean> {
  /**
   * This property determines whether data will be copied by the copyInto() method. This can be
   * exposed in the UI so users can decide if this particular Copier should be executed.
   */
  var _shouldCopy : boolean as ShouldCopy

  /** 
   * The data to be copied by copyInto(). This is generally passed into the constructor of the
   * Copier class, and is expected to be non-null.
   */
  abstract property get Source() : Bean

  /**
   * Copies data from the "Source" of this Copier into the "target" argument if "ShouldCopy" is 
   * true, and does nothing otherwise. The argument must not be null.
   */
  final function copyInto(target : T) {
    if (ShouldCopy) {
      copy(target)
    }
  }
  
  /**
   * Finds the matches in the "target" of this copier, it returns null if no match is been found.
   */
  function findMatch(target : T) : KeyableBean[] {
    return null
  }
   
  /**
   * Performs the actual copy of the "Source" data into the given "target" argument. This will be
   * invoked by the public copyInto() method if "ShouldCopy" is true, so concrete subclasses of
   * Copier must implement this. The method may either create a new object in the "target" if one
   * does not already exist, or it may overwrite data in an existing object, or it may report an 
   * error if a matching object already exists in "target". The argument must not be null.
   */
  abstract protected function copy(target : T)
  
  /**
   * Sets the ShouldCopy property of this Copier to true and returns the Copier. This is just a
   * builder-style convenience method for programmatically setting ShouldCopy.
   */
  final function shouldCopy() : Copier<T> {
    ShouldCopy = true
    return this
  }
}
