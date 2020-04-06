package gw.api.databuilder.reinsurance

uses entity.RIAgreement
uses gw.api.builder.PersonBuilder
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.api.databuilder.populator.BeanPopulator
uses gw.api.util.CurrencyUtil
uses gw.lang.reflect.IType
uses gw.pl.currency.MonetaryAmount

uses java.lang.IllegalArgumentException
uses java.math.BigDecimal
uses java.util.Date

/**
 * Implements the abstract <code>RIAgreement</code> builder.
 */
@Export
abstract class RIAgreementBuilder<T extends RIAgreement, B extends RIAgreementBuilder> extends RIContractBuilder<T, B> {

  var participantBuilder : AgreementParticipantBuilder

  construct(t : IType) {
    super(t)
    withCurrency(CurrencyUtil.getDefaultCurrency())
    var desc = t.DisplayName + "-" + UniqueKeyGenerator.get().nextKey()
    withAgreementNumber(desc)
    withName(desc)
    withEffectiveDate(Date.Today)
    withExpirationDate(Date.Today.addYears(1))
    //withCededShare is overwritten and cannot be made final
    //withCededShare(100bd)
    set(RIAgreement.Type.TypeInfo.getProperty("CededShare"), 100bd)
    withCommission(10)
    withStatus(TC_ACTIVE)
    withEffectiveDate(Date.Today)
    withExpirationDate(Date.Today.addYears(1))
    withAttachmentPoint(7000000bd)
    withCoverageLimit(10000000bd)
    withPayableBasis(PayableBasisType.TC_ASEARNED)
    withComments("Agreement built by RIAgreementBuilder")
    participantBuilder = new AgreementParticipantBuilder()
      .withRiskShare(100)
      .withParticipant(new PersonBuilder())
      .withCommissionRate(10.12)
    withParticipant(participantBuilder)

    addPopulator(MONETARY_AMOUNT_ORDER + 1, new BeanPopulator<RIAgreement>() {
      override function execute(agreement : RIAgreement) {
        agreement.updateAmountOfCoverageCeded()
      }
    })
  }

  property get Type() : IType{
    return T
  }

  final function asDraft() : B{
    return withStatus(TC_DRAFT)
  }

  final function withoutParticipant() : B{
    removePopulator(RIAgreement.Type.TypeInfo.getProperty("Participants"))
    return this as B
  }

  final function withCoverageGroup(groupType : RICoverageGroupType) : B {
    if (Facultative.Type.isAssignableFrom(Type)) {
      throw new IllegalArgumentException("Could not associate Facultative to a Program.")
    }
    var value = new AgreementCoverageGroupBuilder(groupType)
    addArrayElement(RIAgreement.Type.TypeInfo.getProperty("RICoverageGroups"), value)
    return this as B
  }

  final function withOnlyCoverageGroups(groupTypes : RICoverageGroupType[]) : B {
    removePopulator(RIAgreement.Type.TypeInfo.getProperty("RICoverageGroups"))
    groupTypes.each(\ r -> {
      withCoverageGroup(r)
    })
    return this as B
  }

  final function withParticipant(value : AgreementParticipantBuilder) : B {
    addArrayElement(RIAgreement.Type.TypeInfo.getProperty("Participants"), value)
    return this as B
  }

  final function withCommission(value : BigDecimal) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("Commission"), value)
    return this as B
  }

  final function withAgreementNumber(number : String) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("AgreementNumber"), number)
    return this as B
  }

  function withCededShare(value : BigDecimal) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("CededShare"), value)
    return this as B
  }

  final function withAttachmentPoint(value : MonetaryAmount) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("AttachmentPoint"), value)
    return this as B
  }

  final function withAttachmentPoint(value : BigDecimal) : B {
    setMonetaryAmountPropertyAmount(RIAgreement.Type.TypeInfo.getProperty("AttachmentPoint"), value)
    return this as B
  }

  final function withCoverageLimit(value : MonetaryAmount) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("CoverageLimit"), value)
    return this as B
  }

  final function withCoverageLimit(value : BigDecimal) : B {
    setMonetaryAmountPropertyAmount(RIAgreement.Type.TypeInfo.getProperty("CoverageLimit"), value)
    return this as B
  }

  final function withComments(value : String) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("Comments"), value)
    return this as B
  }

  final function withPayableBasis(value : PayableBasisType) : B {
    set(RIAgreement.Type.TypeInfo.getProperty("PayableBasis"), value)
    return this as B
  }
}