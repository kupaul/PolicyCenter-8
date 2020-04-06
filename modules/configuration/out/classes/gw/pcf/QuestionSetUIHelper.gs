package gw.pcf

uses pcf.api.Location

@Export
class QuestionSetUIHelper {

  static function wrapOnChangeBlock(container: AnswerContainer,
                                    question: gw.api.productmodel.Question,
                                    originalOnChangeBlock: block(),
                                    currLoc : Location): block() {
    return \-> {
      if (originalOnChangeBlock != null) {
        originalOnChangeBlock()
      }
      if (question.QuestionPostOnChange == QuestionPostOnChange.TC_ALWAYS) {
        gw.web.productmodel.ProductModelSyncIssuesHandler.syncQuestions({container}, {question.QuestionSet}, null)
      }
      if (originalOnChangeBlock != null or
          question.QuestionPostOnChange == QuestionPostOnChange.TC_ALWAYS or
          not container.getQuestionDependencies(question).Empty) {
        gw.api.web.PebblesUtil.invalidateIterators(currLoc, gw.api.productmodel.Question)
      }
    }
  }
}