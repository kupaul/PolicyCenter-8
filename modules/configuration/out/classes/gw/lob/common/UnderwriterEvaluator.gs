package gw.lob.common

@Export
interface UnderwriterEvaluator {

  function evaluate()

  function canEvaluate() : boolean

}