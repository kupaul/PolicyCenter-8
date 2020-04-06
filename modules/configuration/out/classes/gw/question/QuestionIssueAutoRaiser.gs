package gw.question

uses gw.policy.PolicyEvalContext
uses gw.api.productmodel.QuestionSet

@Export
class QuestionIssueAutoRaiser {

  construct() {

  }
  
  /**
   * Raises UW Issues for all available questions.
   * 
   * If a new Answer Container was implemented, this method should be modified to call raiseIssuesForQuestionSets for all
   * available question sets that are stored on that Answer Container. To do that, first acquire all instances of newly 
   * implemented Answer Container, and for each instance, make a call to  
   * raiseIssuesForQuestionSets(product.getAvailableQuestionSets(<instance>), <instance>, context)
   */
  static function autoRaiseIssuesForQuestions(context : PolicyEvalContext) {
    var period = context.Period
    var product = period.Policy.Product
    
    raiseIssuesForQuestionSets(product.getAvailableQuestionSets(period), period, context)
    for (line in period.Lines) {
      raiseIssuesForQuestionSets(product.getAvailableQuestionSets(line), line, context)  
    }
    for (location in period.PolicyLocations) {
      raiseIssuesForQuestionSets(product.getAvailableQuestionSets(location), location, context)   
    }       
  }
  
  private static function raiseIssuesForQuestionSets(questionSets : QuestionSet[], container : AnswerContainer, context : PolicyEvalContext) {
    questionSets.flatMap(\ qs -> qs.Questions ).each(\q -> q.addUWIssueIfAnswerIsIncorrect(context, container))  
  }

}
