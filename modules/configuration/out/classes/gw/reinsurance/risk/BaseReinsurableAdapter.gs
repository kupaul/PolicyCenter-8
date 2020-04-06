package gw.reinsurance.risk

uses gw.api.reinsurance.ReinsurableAdapter
uses gw.api.reinsurance.ReinsurableCoverable
uses java.lang.UnsupportedOperationException

@Export
class BaseReinsurableAdapter implements ReinsurableAdapter {
  var _owner : EffDated

  construct(owner : EffDated) {
    _owner = owner
  }

  override property get Coverable() : ReinsurableCoverable {
    throw new UnsupportedOperationException("Illegal call to base Reinsurable Adapter - please add an Adapter for subtype: ${typeof _owner}")
  }

}