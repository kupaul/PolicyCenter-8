package gw.api.databuilder.wc

uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses gw.pl.currency.MonetaryAmount

@Export
class WCRetroRatingLetterOfCreditBuilder extends DataBuilder<WCRetroRatingLetterOfCredit, WCRetroRatingLetterOfCreditBuilder> {
  construct() {
    super(WCRetroRatingLetterOfCredit)
    withIssuerName("John Doe")
    withAmount(100000bd.ofDefaultCurrency())
    withValidFrom(Date.Today)
    withValidTo(Date.Tomorrow)
  }
  
  final function withIssuerName(issuerName : String): WCRetroRatingLetterOfCreditBuilder {
    set(WCRetroRatingLetterOfCredit.Type.TypeInfo.getProperty("IssuerName"), issuerName)
    return this
  }
  
  final function withAmount(amount : MonetaryAmount): WCRetroRatingLetterOfCreditBuilder {
    set(WCRetroRatingLetterOfCredit.Type.TypeInfo.getProperty("Amount"), amount)
    return this
  }
  
  final function withValidFrom(effective : Date): WCRetroRatingLetterOfCreditBuilder {
    set(WCRetroRatingLetterOfCredit.Type.TypeInfo.getProperty("ValidFrom"), effective)
    return this
  }
  
  final function withValidTo(expiration : Date): WCRetroRatingLetterOfCreditBuilder {
    set(WCRetroRatingLetterOfCredit.Type.TypeInfo.getProperty("ValidTo"), expiration)
    return this
  }
}