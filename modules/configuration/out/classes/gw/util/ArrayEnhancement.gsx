package gw.util

uses java.util.Map

enhancement ArrayEnhancement<T> : T[] {
  /**
   * Returns a map containing key value pairs from each element to the result of calling <code>mapper</code> on each
   * element.  This method is the inverse of partitionUniquely().
   */
  public function mapToValue<V>(mapper(elt : T) : V) : Map<T, V> {
    return this.toList().mapToValue(mapper)
  }

  /**
   * Returns a map containing key value pairs from the result of calling <code>getKey</code> on each element to the
   * result of calling <code>getValue</code> on each element.
   */
  public function mapToKeyAndValue<K, V>(getKey(elt : T) : K, getValue(elt : T) : V) : Map<K, V> {
    return this.toList().mapToKeyAndValue(getKey, getValue)
  }
}