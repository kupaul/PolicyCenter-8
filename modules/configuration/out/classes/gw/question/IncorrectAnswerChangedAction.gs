package gw.question
uses gw.api.productmodel.Question

@Export
class IncorrectAnswerChangedAction {

  construct() {

  }
  
  /**
   *  Action to perform when an incorrect answer has changed.
   *  Creates a job history event to record the change if the answer was blocking the user.
   */
  public static function execute(container : AnswerContainer, question : Question, originalValue : String, newValue : String) {
    if (container.AssociatedPolicyPeriod.Job != null and question.BlockingAction == BlockingAction.TC_BLOCKUSER) {
      container.AssociatedPolicyPeriod.Job.createCustomHistoryEvent(CustomHistoryType.TC_ANSWER_CHANGED, 
          \ -> displaykey.Submission.History.IncorrectAnswerChanged(question.Text), originalValue, newValue)
    }
  }
}
