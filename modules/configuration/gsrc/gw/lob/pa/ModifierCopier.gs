package gw.lob.pa
uses gw.api.copy.Copier

/**
 * Copies all Modifiers and RateFactors from a source Modifiable into a target Modifiable. Any
 * Modifiers or RateFactors on the source that are unavailable in the target will not be copied.
 * 
 * Since this class operates on Modifier and RateFactor, which are delegate types, it will not 
 * be aware of any additional data in the delegate implementations. This should not be a factor
 * for the OOTB configuration of PolicyCenter, but customers who need to implement additional
 * Modifiers or RateFactors may need to update or extend this class.
 */
@Export
class ModifierCopier extends Copier<Modifiable> {

  var _sourceModifiable : Modifiable as readonly Source
  
  construct(sourceModifiable : Modifiable) {
    _sourceModifiable = sourceModifiable
  }
  
  override function copy(targetModifiable : Modifiable) {
    targetModifiable.syncModifiers()     // Create all available modifiers and rate factors on the target
    for (sourceModifier in _sourceModifiable.Modifiers) {
      copyModifier(targetModifiable, sourceModifier)
    }
  }
  
  private function copyModifier(targetModifiable : Modifiable, sourceModifier : Modifier) {
    var targetModifier = targetModifiable.getModifier(sourceModifier.PatternCode)
    if (targetModifier != null) {
      targetModifier.BooleanModifier = sourceModifier.BooleanModifier
      targetModifier.DateModifier = sourceModifier.DateModifier
      targetModifier.Eligible = sourceModifier.Eligible
      targetModifier.Justification = sourceModifier.Justification
      targetModifier.RateModifier = sourceModifier.RateModifier
      targetModifier.TypeKeyModifier = sourceModifier.TypeKeyModifier
      targetModifier.State = sourceModifier.State
      targetModifier.ValueFinal = sourceModifier.ValueFinal

      for (sourceRateFactor in sourceModifier.RateFactors) {
        var targetRateFactor = targetModifier.getRateFactor(sourceRateFactor.RateFactorType)
        if (targetRateFactor != null) {
          targetRateFactor.Assessment = sourceRateFactor.Assessment
          targetRateFactor.Justification = sourceRateFactor.Justification
        }
      }

      // Modifier fields and arrays we don't copy:
      // ReferenceDateInternal, PatternCode, FK to Modifiable
    }
  }
}
