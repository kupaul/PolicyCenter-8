package gw.question
uses gw.api.domain.AnswerContainerAdapter
uses gw.api.productmodel.QuestionSet
uses java.lang.System
uses java.util.Date
uses java.lang.IllegalArgumentException

@Export
class PolicyPeriodAnswerContainerAdapter implements AnswerContainerAdapter {

  var _owner : PolicyPeriod
  
  construct(owner : PolicyPeriod) {
    _owner = owner
  }
  
  override function createRawAnswer() : PCAnswerDelegate{
    return new PeriodAnswer(_owner)
  }
  
  override function addToAnswers(answer : PCAnswerDelegate) {
    _owner.addToPeriodAnswers(answer as PeriodAnswer)
  }

  override function removeFromAnswers(answer : PCAnswerDelegate) {
    _owner.removeFromPeriodAnswers(answer as PeriodAnswer)
  }

  override property get Answers() : PCAnswerDelegate[] {
    return _owner.getPeriodAnswers()
  }

  override property get Locked() : boolean {
    return false
  }

  override function getQuestionSetLookupReferenceDate(qsType : QuestionSetType) : Date {
    if(qsType == QuestionSetType.TC_OFFERING)
      return Date.Today.trimToMidnight()
    return AssociatedPolicyPeriod.getReferenceDateForCurrentJob(AssociatedPolicyPeriod.BaseState)
  }

  override property get AssociatedPolicyPeriod() : PolicyPeriod {
    return _owner
  }


  override property get QuestionSets() : QuestionSet[] {
    return  AssociatedPolicyPeriod.Policy.Product.getQuestionSets(PolicyPeriod);
  }
}
