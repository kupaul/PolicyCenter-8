package gw.lob.common
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext

/**
 * Validates an array of PCAnswerDelegates.
 */
@Export
class AnswerValidation extends PCValidationBase {
  private var _container : AnswerContainer
  private var _answers : PCAnswerDelegate[]
  private var _stepId : String
  
  construct( valContext : PCValidationContext, container : AnswerContainer, answers : PCAnswerDelegate[], stepId : String ) {
    super( valContext )
    _container = container
    _answers = answers
    _stepId = stepId
  }
  
  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )
    checkRequiredAnswers()
    validateCorrectnessOfAnswers()
  }

  /**
   * Validate answers on _container.
   * Checks whether all the questions in the container are visible and required.
   * If any of these questions are not answered, an error displays on the page. The user must select an answer before moving onto another page.
   */
  function checkRequiredAnswers() : void {
    Context.addToVisited( this, "checkRequiredAnswers" )
    for ( answer in _answers ) {
      if ( answer.Question.isQuestionVisible( _container ) and answer.Question.Required and not answer.hasAnswer() ) {
        Result.addError( answer as KeyableBean, "quotable", displaykey.Validation.Answer.MissingRequired( answer.Question.Text ), _stepId )
      }
    }
  }
  
  /**
   * Validates answers on _container. If answer is not correct, one of the following actions is taken based on question's BlockingAction:
   * <none> -> no action
   * Warn user -> warning is displayed with link to wizardStep
   */
  function validateCorrectnessOfAnswers() {
    for(answer in _answers) {
      if(answer.Question.isQuestionVisible( _container ) and answer.Question.isIncorrect(answer)) {
        if(BlockingAction.TC_WARNUSER.equals(answer.Question.BlockingAction))
          Result.addWarning(answer as KeyableBean, "default", answer.Question.FailureMessage, _stepId); //show warning on the page without blocking user from advancing further
        if(BlockingAction.TC_BLOCKUSER.equals(answer.Question.BlockingAction))
          Result.addError(answer as KeyableBean, "default", answer.Question.FailureMessage, _stepId); //block user on a page
      }
    }     
  }
}
