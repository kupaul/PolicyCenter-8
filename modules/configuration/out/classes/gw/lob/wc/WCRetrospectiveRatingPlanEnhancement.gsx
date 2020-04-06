package gw.lob.wc

enhancement WCRetrospectiveRatingPlanEnhancement : WCRetrospectiveRatingPlan {
  
  function createAndAddWCStateMultiplier() : WCStateMultiplier {
    var multiplier = new WCStateMultiplier(this.WorkersCompLine.Branch)
    this.addToStateMultipliers(multiplier)
    return multiplier
  }
  
  function createAndAddLetterOfCredit() : WCRetroRatingLetterOfCredit {
    var letter = new WCRetroRatingLetterOfCredit(this.WorkersCompLine.Branch)
    this.addToLettersOfCredit(letter)
    return letter
  }

}
