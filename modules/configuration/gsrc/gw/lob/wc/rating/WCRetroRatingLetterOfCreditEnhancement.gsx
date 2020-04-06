package gw.lob.wc.rating

enhancement WCRetroRatingLetterOfCreditEnhancement : entity.WCRetroRatingLetterOfCredit {
  property get Currency() : Currency {
    return this.Branch.PreferredSettlementCurrency
  }
}
