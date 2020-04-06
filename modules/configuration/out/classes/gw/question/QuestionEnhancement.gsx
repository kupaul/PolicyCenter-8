package gw.question

uses gw.api.productmodel.Question
uses gw.job.uw.UWIssueValueType
uses gw.policy.PolicyEvalContext

enhancement QuestionEnhancement : Question {

  /**
   * Returns mode for QuestionInputSet.pcf that determines UI for this question.
   * 
   * @param container the AnswerContainer that holds answers to this question
   * @param onChangeBlock an executable block to run when the answer to this question is changed
   * @return mode for QuestionInputSet.pcf
   */
  function getInputSetMode(container : AnswerContainer, onChangeBlock : block()) : String {
    if (this.QuestionPostOnChange == "always" or
          onChangeBlock != null or
          not container.getQuestionDependencies(this).Empty) {
      return this.Format as String
    } else {
      return this.Format + "_NoPost"
    }
  }
  
  /**
   * Computes associated risk points based on visibility of the question and its current answer.
   * If the question is visible and the answer is incorrect, it returns the number of risk points that was configured 
   * to be added for this Question when it is answered incorrectly. Otherwise, it returns zero.
   * 
   * @param container the AnswerContainer that holds answers to this question
   * @return effective risk points
   */
  function computeEffectiveRiskPoints(container : AnswerContainer) : int {
    if (!this.isQuestionAvailable(container) || !this.isQuestionVisible(container)) {
      return 0
    }  
    
    var answer = container.getAnswer(this)
    
    return ( this.isIncorrect(answer) and (  this.RiskPoints != null ) )
      ? this.RiskPoints : 0
  }

  function addUWIssueIfAnswerIsIncorrect(context : PolicyEvalContext, container : AnswerContainer) {
    if (!this.isQuestionAvailable(container) || !this.isQuestionVisible(container)) {
      return
    }
    
    var answer = container.getAnswer(this)
    
    if (this.isIncorrect(answer) and this.UWIssueType != null) {
      var issue = context.addIssue(this.UWIssueType.Code, issueKey(container),
          \ -> this.FailureMessage, \ -> issueLongDescription(container, answer)) 
      if (answer.AnswerValue != null and 
          this.UWIssueType.ComparatorWrapper.ValueType == UWIssueValueType.BIG_DECIMAL and 
          this.QuestionType == "Integer") {
        issue.Value = answer.AnswerValue.toString() 
      }
    }
  }
  
  private function issueKey(container : AnswerContainer) : String {
    var containerReference : String
    if (container typeis PolicyLocation) 
      containerReference = "PolicyLocation"   
    else if (container typeis PolicyLine) 
      containerReference = "PolicyLine"
    else if(container typeis PolicyPeriod)
      containerReference = "PolicyPeriod"
    else 
      containerReference = (typeof container).DisplayName   
      
    if(container typeis EffDated)
      containerReference = containerReference+":"+container.FixedId.Value
                              
    return this.QuestionSet.PublicID + "::" + this.PublicID + "::" + containerReference    
  }
  
  private function issueLongDescription(container : AnswerContainer, answer : PCAnswerDelegate) : String {
    var containerName = ""
    if (container typeis PolicyLine) 
      containerName = container.Pattern.Name
    else if(container typeis PolicyPeriod)
      containerName = displaykey.UWIssue.Question.PolicyPeriodName(container.Job.JobNumber, container.BranchName)
    else
      containerName = container.DisplayName 
    
    return this.QuestionSet.Name + "\n" +
           containerName + "\n" +
           this.Text + (this.RiskPoints == null ? "" : " (${this.RiskPoints})") + "\n" +
           (answer.AnswerValue == null ? displaykey.UWIssue.Question.NoAnswerSupplied : answer.AnswerValue)
            
  }
}
