package gw.rating.rtm

uses gw.rating.rtm.matchop.MatchOperationFactory
uses gw.rating.rtm.matchop.StatelessMatchOperator
uses gw.rating.rtm.validation.MatchOpValidator
uses gw.systables.verifier.RateTableMatchOpDefinitionVerifier

uses java.util.HashSet
uses java.util.Set

enhancement RateTableMatchOpDefinitionEnhancement : entity.RateTableMatchOpDefinition {

  function statelessMatchOperator(matchOp : RateTableMatchOp) : StatelessMatchOperator {
    var factory = MatchOperationFactory.getFactoryByName(this.ImplClass)
    return factory.createStatelessMatchOperator(matchOp)
  }

  property get AllowedParameterTypeSet(): Set<RateTableDataType>{
    var dataTypeString = this.AllowedParameterTypes
    var tempTypeList = dataTypeString.split(RateTableMatchOpDefinitionVerifier.DELIMITER).toList()
    var typeList = new HashSet<RateTableDataType>()
    tempTypeList.each(\ code -> {
      var dataType = RateTableDataType.get(code.trim())
      typeList.add(dataType)
    })
    return typeList
  }
  
  function validator() : MatchOpValidator {
    var factory = MatchOperationFactory.getFactoryByName(this.ImplClass)
    return factory.createValidator()
  }

  function isEqual(other : RateTableMatchOpDefinition) : boolean {
    return (this.OpCode == other.OpCode) and
           (this.OpName == other.OpName) and
           (this.ImplClass == other.ImplClass) 
  }
}
