package gw.pcf
uses java.util.ArrayList

@Export
class ModifiersListViewHelper {
  
  private static var _modifiers : Modifier[]
  
  construct(modifiers : Modifier[]) {
    _modifiers = modifiers
  }
  
  property get AllDisplayJustificationsFalse() : boolean {
    var allFalse = false
    if (_modifiers.Count > 0) {
      _modifiers.each(\ m -> {allFalse = m.Pattern.DisplayJustification or allFalse})
    }
    return allFalse
  }
  
  property get SchedRateModifiers() : Modifier[] {
    return _modifiers.Count > 0 ? _modifiers.where( \ mod -> mod.ScheduleRate) : new ArrayList<Modifier>().toTypedArray()
  }    
  
  property get NonSchedRateModifiers() : Modifier[] {
    return _modifiers.Count > 0 ? _modifiers.where( \ mod -> !mod.ScheduleRate) : new ArrayList<Modifier>().toTypedArray()
  }  
}
