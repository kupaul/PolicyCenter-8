package gw.question

enhancement PCAnswerDelegateEnhancement : PCAnswerDelegate
{
  /**
   * Returns true if this answer is filled in and false otherwise. For string-type questions 
   * this checks that the answer is not blank, and for other questions it checks that the answer
   * is not null. 
   */
  function hasAnswer() : boolean {
    switch ( this.Question.QuestionType ) {
      case QuestionType.TC_BOOLEAN:
        return this.BooleanAnswer != null
      case QuestionType.TC_DATE:
        return this.DateAnswer != null
      case QuestionType.TC_INTEGER:
        return this.IntegerAnswer != null
      case QuestionType.TC_STRING:
        return this.TextAnswer.NotBlank
      case QuestionType.TC_CHOICE:
        return this.ChoiceAnswer != null
    }
    throw "Unknown question type " + this.Question.QuestionType
  }
}
