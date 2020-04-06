package gw.question
uses gw.api.domain.AnswerContainerAdapter
uses gw.api.productmodel.QuestionSet
uses java.lang.IllegalArgumentException
uses java.util.Date

@Export
class PolicyLocationAnswerContainerAdapter implements AnswerContainerAdapter {

  var _owner : PolicyLocation
  
  construct(owner : PolicyLocation) {
    _owner = owner
  }

  override property get Answers() : PCAnswerDelegate[] {
    return _owner.LocationAnswers
  }

  override property get Locked() : boolean {
    return AssociatedPolicyPeriod.Locked
  }

  override function createRawAnswer() : PCAnswerDelegate {
    return new LocationAnswer(_owner.Branch)
  }

  override function addToAnswers(answer : PCAnswerDelegate) {
    _owner.addToLocationAnswers(answer as LocationAnswer)
  }

  override function removeFromAnswers(answer : PCAnswerDelegate) {
    _owner.removeFromLocationAnswers(answer as LocationAnswer)
  }

  override function getQuestionSetLookupReferenceDate(qsType : QuestionSetType) : Date {
    return AssociatedPolicyPeriod.getReferenceDateForCurrentJob(AssociatedPolicyPeriod.BaseState)
  }


  override property get AssociatedPolicyPeriod() : PolicyPeriod {
    return  _owner.Branch
  }


  override property get QuestionSets() : QuestionSet[] {
    return  AssociatedPolicyPeriod.Policy.Product.getQuestionSets(PolicyLocation);
  }
}
