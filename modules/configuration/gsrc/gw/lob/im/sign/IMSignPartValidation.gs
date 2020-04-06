package gw.lob.im.sign
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext

@Export
class IMSignPartValidation extends PCValidationBase {
  
  var _signPart : IMSignPart
  construct( valContext : PCValidationContext, signpart : IMSignPart )
  {
    super( valContext )
    _signPart = signpart 
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )
    atleastOneSign()
    signsMustBeUnique()
  }
  
  private function signsMustBeUnique() {
    Context.addToVisited(this, "signsMustBeUnique")
    
    var signPartitions = _signPart.IMSigns.partition(\ i -> i.IMLocation + i.Description + i.SignType + i.Interior)
    signPartitions.eachValue(\ l -> {
      if (l.Count > 1) {
        var signNums = l.map(\ i -> i.SignNumber).sort().join(", ")
        var msg = displaykey.Web.Policy.IM.Validation.SignsMustBeUnique(signNums)
        Result.addError(_signPart, ValidationLevel.TC_DEFAULT, msg, "impartstep")  
      }
    }) 
  }
  
  private function atleastOneSign() {
    Context.addToVisited(this, "atleastOneSign")
    
    if (_signPart.IMSigns.IsEmpty ) {      
      var msg = displaykey.Web.Policy.IM.Validation.AtLeastOneSign
      if (Context.isAtLeast(ValidationLevel.TC_QUOTABLE)) {
        Result.addError(_signPart, ValidationLevel.TC_QUOTABLE, msg)
      } else {
        Result.addWarning(_signPart, ValidationLevel.TC_DEFAULT, msg)
      }
    }
  }
}
