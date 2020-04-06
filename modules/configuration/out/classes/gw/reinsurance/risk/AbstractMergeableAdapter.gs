package gw.reinsurance.risk
uses gw.api.reinsurance.MergeableAdapter
uses java.lang.IllegalStateException

@Export
abstract class AbstractMergeableAdapter<T extends MergeableAdapter> implements MergeableAdapter{
  protected var _owner : T

  construct(owner : T) {
    _owner = owner
  }
  
  override function isTheSame(other : Object) : boolean {
    return compareFields(other, \ t -> getIds(t), \ v1, v2 -> v1.isTheSame(v2))
  }
  
  override function isIdentical(other : Object) : boolean {
    return compareFields(other, \ t -> getValuesToCompare(t), \ v1, v2 -> v1.isIdentical(v2))
  }
  
  override function copyFromPreviousTerm(previousTerm : MergeableAdapter) {
  }

  
  function compareFields(other : Object, 
          getValues : block(o : T) : Object[],
          compareFunction : block(o1 : MergeableAdapter, o2 : MergeableAdapter) : boolean) : boolean{
    if(other typeis T){
      var otherValues = getValues(_owner)
      var thisValues = getValues(other)
      if(thisValues.Count <> otherValues.Count){
        throw new IllegalStateException("The number of fields to compare should be equals.")
      }
      for(i in 0..|thisValues.Count){
        var value = thisValues[i]
        var otherValue = otherValues[i]
        if(value.Class.Array){
          if(not compareArray(value, otherValue, compareFunction)){
            return false
          }
        }else{
          if(value <> otherValue){
            return false
          }
        }
      }
      return true
    }
    throw new IllegalStateException("Should not compare beans of different types: ${_owner}, ${other}")
  }
  
  abstract protected function getValuesToCompare(object : T) : Object[]
  abstract protected function getIds(object : T) : Object[]
  
  private function compareArray(array1 : Object, array2 : Object, 
      compareFunction : block(o1 : MergeableAdapter, o2 : MergeableAdapter) : boolean) : boolean {
    if(array1 typeis MergeableAdapter[] and array2 typeis MergeableAdapter[]){
      if(array1.Count <> array2.Count){
        return false
      }
      var values = array2.toList()
      for(v1 in array1){
        var v2 = values.firstWhere(\ v2 -> compareFunction(v1, v2) )
        if(v2 == null){
          return false
        }
        values.remove(v2)
      }
    }
    else{
      throw new IllegalStateException("Can only compare 2 arrays of MergeableAdapter.")
    }
    return true
  }
}
