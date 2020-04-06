package gw.lob.ba
uses gw.api.domain.RateFactorAdapter

@Export
class BARateFactorAdapter implements RateFactorAdapter
{
  var _owner : BARateFactor
  
  construct(rateFactor : BARateFactor) {
    _owner = rateFactor
  }

  override property get Modifier() : Modifier {
    return _owner.BAModifier
  }
}
