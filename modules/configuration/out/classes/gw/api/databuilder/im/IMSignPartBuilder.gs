package gw.api.databuilder.im
uses gw.api.databuilder.BuilderContext

@Export
class IMSignPartBuilder  extends IMPartBuilder<IMSignPart, IMSignPartBuilder> {
  construct()  {
    super(IMSignPart)
    withCoinsurance(typekey.Coinsurance.TC_100)
  }
  
    /** helper for withXxx/isXxx() methods */
  private function setByPropName(propertyName : String, value : Object) : IMSignPartBuilder {
    set(IMSignPart.Type.TypeInfo.getProperty( propertyName ), value)
    return this
  }
  
  function withSign(sign : IMSignBuilder) : IMSignPartBuilder {
    addAdditiveArrayElement( IMSignPart.Type.TypeInfo.getProperty( "IMSigns" ), sign)
    return this
  }
  
  // coinsurance  
  final function withCoinsurance(coinsurance : Coinsurance) : IMSignPartBuilder {
    return setByPropName("Coinsurance", coinsurance) 
  }
  
  protected override function createBean(context : BuilderContext) : IMSignPart {
    var returnBean = super.createBean(context)
    returnBean.initializeSignAutoNumberSequence(returnBean.Bundle)
    return returnBean
  }
}
