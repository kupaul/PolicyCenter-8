package gw.api.databuilder.wc

uses gw.api.databuilder.DataBuilder
uses java.math.BigDecimal

@Export
class WCStateMultiplierBuilder extends DataBuilder<WCStateMultiplier, WCStateMultiplierBuilder> {
  construct() {
    super(WCStateMultiplier)
    withFederalTaxMultiplier( 1 )
    withStateTaxMultiplier( 1 )
  }
  
  final function withStateTaxMultiplier(multiplier : BigDecimal): WCStateMultiplierBuilder {
    set(WCStateMultiplier.Type.TypeInfo.getProperty("StateTaxMultiplier"), multiplier)
    return this
  }
  
  final function withStateExcessLossFactor(factor : BigDecimal): WCStateMultiplierBuilder {
    set(WCStateMultiplier.Type.TypeInfo.getProperty("StateExcessLossFactor"), factor)
    return this
  }

  final function withFederalTaxMultiplier(multiplier : BigDecimal): WCStateMultiplierBuilder {
    set(WCStateMultiplier.Type.TypeInfo.getProperty("FederalTaxMultiplier"), multiplier)
    return this
  }

  final function withFederalExcessLossFactor(factor : BigDecimal): WCStateMultiplierBuilder {
    set(WCStateMultiplier.Type.TypeInfo.getProperty("FederalExcessLossFactor"), factor)
    return this
  }
  
  final function withState(state : Jurisdiction) : WCStateMultiplierBuilder {
    set (WCStateMultiplier.Type.TypeInfo.getProperty("State"), state)
    return this
  }
}