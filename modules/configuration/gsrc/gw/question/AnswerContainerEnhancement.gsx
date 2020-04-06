package gw.question

uses gw.api.productmodel.QuestionSet
uses gw.web.productmodel.ProductModelSyncIssueWrapper

enhancement AnswerContainerEnhancement : entity.AnswerContainer {

  /**
   * Syncs questions against the product model, fixes all issues marked as ShouldFixDuringNormalSync,
   * and returns all the issues found regardless of whether or not they were fixed.
   */
  function syncQuestions() : List<ProductModelSyncIssueWrapper> {
    this.clearQuestionDependencies()
    var originalIssues = this.checkAnswersAgainstProductModel()
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )
    issueWrappers.fixDuringNormalSync(this)
    return issueWrappers
  }

  /**
   * Syncs questions in questionSetsToSync against the product model, fixes all issues marked as ShouldFixDuringNormalSync,
   * and returns all the issues found regardless of whether or not they were fixed.
   */
  function syncQuestions(questionSetsToSync : QuestionSet[]) : List<ProductModelSyncIssueWrapper> {
    this.clearQuestionDependencies()
    var originalIssues = this.checkAnswersAgainstProductModel(questionSetsToSync)
    var issueWrappers = ProductModelSyncIssueWrapper.wrapIssues( originalIssues )
    issueWrappers.fixDuringNormalSync(this)
    return issueWrappers
  }

  /**
   * Returns true if this answer container has an answer for any question in "questionSet"
   */
  function hasAnswerForQuestionSet( questionSet : QuestionSet ) : boolean {
    return questionSet.OrderedQuestions.hasMatch( \ question -> this.getAnswer(question) != null)
  }
}
