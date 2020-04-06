package gw.job.uw.types

uses java.util.Set
uses java.lang.Iterable

@Export
class ExclusiveSet<W>  {
  private var _exclusive : boolean as readonly Exclusive
  private var _values : Set<W> as readonly Values

  construct(exclusiveArg : boolean, valuesArg : Set<W>) {
    _exclusive = exclusiveArg
    _values = valuesArg
  }

  function contains(value: W) : boolean {
    return Exclusive != (Values.contains(value))
  }

  function containsAll(value : Iterable<W>) : boolean {
    for (v in value) {
      if (!contains(v)) {
        return false
      }
    }
    return true
  }
}
