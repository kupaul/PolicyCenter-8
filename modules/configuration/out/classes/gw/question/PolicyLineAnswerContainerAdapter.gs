package gw.question
uses gw.api.domain.AnswerContainerAdapter
uses gw.api.productmodel.QuestionSet
uses java.util.Date
uses java.lang.IllegalArgumentException

@Export
class PolicyLineAnswerContainerAdapter implements AnswerContainerAdapter {

  var _owner : PolicyLine
  
  construct(owner : PolicyLine) {
    _owner = owner
  }


  override property get Answers() : PCAnswerDelegate[] {
    return _owner.LineAnswers
  }

  override property get Locked() : boolean {
    return AssociatedPolicyPeriod.Locked
  }

  override function createRawAnswer() : PCAnswerDelegate {
    return new PolicyLineAnswer(_owner.Branch)
  }

  override function addToAnswers(answer : PCAnswerDelegate) {
    _owner.addToLineAnswers(answer as PolicyLineAnswer)
  }

  override function removeFromAnswers(answer : PCAnswerDelegate) {
    _owner.removeFromLineAnswers(answer as PolicyLineAnswer)
  }

  override function getQuestionSetLookupReferenceDate(qsType : QuestionSetType) : Date {
    return AssociatedPolicyPeriod.getReferenceDateForCurrentJob(AssociatedPolicyPeriod.BaseState)
  }

  override property get AssociatedPolicyPeriod() : PolicyPeriod {
    return _owner.Branch
  }


  override property get QuestionSets() : QuestionSet[] {   
    return  AssociatedPolicyPeriod.Policy.Product.getQuestionSets(PolicyLine); 
  }
}
