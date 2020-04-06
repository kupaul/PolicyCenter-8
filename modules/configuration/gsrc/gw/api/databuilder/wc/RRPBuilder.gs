package gw.api.databuilder.wc

uses gw.api.databuilder.DataBuilder
uses gw.api.util.DateUtil
uses java.math.BigDecimal
uses java.util.Date
uses gw.pl.currency.MonetaryAmount

/**
 * @author dpetrusca
 */
@Export
class RRPBuilder extends DataBuilder<WCRetrospectiveRatingPlan, RRPBuilder> {

  construct() {
    super(WCRetrospectiveRatingPlan)        
    withIncludeALAE(true)
    withLossConversionFactor( 1 )
    withLossLimitAmount( 3437bd.ofDefaultCurrency() )
    withEstimatedStandardPremium( 343bd.ofDefaultCurrency() )
    withFirstComputationDate( DateUtil.createDateInstance( 8, 1, 2009 ) )
    withLastComputationDate( DateUtil.createDateInstance( 8, 1, 2010 ) )
    withComputationInterval( 12 )
    withMinRetroPremiumRatio( 1.5 )
    withMaxRetroPremiumRatio( 1.75 )
  }
  
  final function withIncludeALAE(include: boolean): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("IncludeALAE"), include)
    return this
  }

  final function withLossConversionFactor(value: BigDecimal): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("LossConversionFactor"), value)
    return this
  }

  final function withLossLimitAmount(value: MonetaryAmount): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("LossLimitAmount"), value)
    return this
  }

  final function withEstimatedStandardPremium(value: MonetaryAmount): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("EstimatedStandardPremium"), value)
    return this
  }

  final function withFirstComputationDate(date: Date): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("FirstComputationDate"), date)
    return this
  }

  final function withLastComputationDate(date: Date): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("LastComputationDate"), date)
    return this
  }

  final function withComputationInterval(value: int): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("ComputationInterval"), value)
    return this
  }

  final function withMinRetroPremiumRatio(value: BigDecimal): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("MinRetroPremiumRatio"), value)
    return this
  }

  final function withMaxRetroPremiumRatio(value: BigDecimal): RRPBuilder {
    set(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("MaxRetroPremiumRatio"), value)
    return this
  }

  final function withLetterOfCredit(letter : WCRetroRatingLetterOfCreditBuilder) : RRPBuilder {
    addAdditiveArrayElement(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("LettersOfCredit"), letter)
    return this
  }

  final function withStateMultiplier(multiplier : WCStateMultiplierBuilder) : RRPBuilder {
    addAdditiveArrayElement(WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("StateMultipliers"), multiplier)
    return this
  }
}

