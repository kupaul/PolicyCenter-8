package gw.lob.im.ar
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext

@Export
class IMARPartValidation extends PCValidationBase
{
  var _arPart : IMAccountsRecPart
   
  construct( valContext : PCValidationContext, arPart : IMAccountsRecPart)
  {
    super( valContext )
    _arPart = arPart
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )
    atLeastOneCoverageExists()
    checkLimitVsDeductible()
    checkAnswers()
  }

  private function atLeastOneCoverageExists() {
    Context.addToVisited( this, "atleastOneCoverage" )
 
    var msg = displaykey.Web.Policy.IM.Validation.AtLeastOneAccountsReceivableCoverageExists 
    if (_arPart.IMAccountsReceivables*.Coverages.Count == 0) {
      if(Context.isAtLeast(ValidationLevel.TC_QUOTABLE)) {
        Result.addError( _arPart, ValidationLevel.TC_QUOTABLE, msg)
      } else {
        Result.addWarning(_arPart, ValidationLevel.TC_DEFAULT, msg)
      }
    }
  }
  
  private function checkLimitVsDeductible() {
     Context.addToVisited( this, "checkDeductible" )
  }

  function checkAnswers() {
    Context.addToVisited( this, "checkAnswers" )
  }

}
