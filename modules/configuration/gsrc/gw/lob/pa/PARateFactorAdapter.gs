package gw.lob.pa
uses gw.api.domain.RateFactorAdapter

@Export
class PARateFactorAdapter implements RateFactorAdapter
{
  var _owner : PARateFactor
  
  construct(rateFactor : PARateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.PAModifier
  }
}
