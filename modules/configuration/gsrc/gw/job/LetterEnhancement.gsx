package gw.job
uses java.lang.IllegalStateException
uses gw.document.DocumentProduction

enhancement LetterEnhancement : Letter {

  function createAndAttachDocument() {
    var docType = this.RelatedDocumentType
    for (jobLetter in this.JobLetters) {
      var policyPeriod = jobLetter.Job.LatestPeriod
      var document = new Document(policyPeriod)
      document.Name = docType.Code + ".doc"
      document.Type = docType
      document.Account = policyPeriod.Policy.Account
      document.Policy = policyPeriod.Policy
      document.Job = jobLetter.Job
      document.PolicyPeriod = policyPeriod
      DocumentProduction.createAndStoreBestDocumentSynchronously(docType, document, policyPeriod)
    }
  }
  
  property get RelatedDocumentType() : DocumentType {
    switch (this.Type) {
      case TC_CONFIRMATION:
        return "CONFIRM_LETTER"
      case TC_DECLINATION:
        return "DECLINE_LETTER"
      case TC_NOTTAKENACK:
        return "NOT_TAKEN_LETTER"
      default:
        throw new IllegalStateException("Unknown letter type \"${this.Type}\"")
    }
  }
  
}
