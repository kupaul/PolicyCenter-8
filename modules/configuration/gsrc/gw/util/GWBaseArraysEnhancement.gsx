package gw.util
uses java.util.Arrays

enhancement GWBaseArraysEnhancement : Arrays
{  
  /**
   * Creates a new array of the given size, where every value in the
   * array is initialized to the given initVal.
   */
  static function makeArray<T>( initVal : T, size : int ) : T[]{
    var arr = T.Type.makeArrayInstance( size ) as T[]
    for( elt in arr index j ) {
      arr[j] = initVal
    }
    return arr
  }
  
}
