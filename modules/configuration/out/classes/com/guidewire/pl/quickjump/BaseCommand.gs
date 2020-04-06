package com.guidewire.pl.quickjump

uses com.guidewire.pl.web.navigation.Location
uses java.util.Date
uses java.util.ArrayList
uses java.math.BigDecimal
uses gw.api.util.LocationUtil
uses gw.pl.persistence.core.Bundle

/**
* This is the base for all commands. To add new command, a sub-class of XXBaseCommand must be
* implemented and the name of the sub-class must be registered in XXRunCommand.AllCommandNames
*/
@Export 
class BaseCommand
{
  var _location : Location as TopLocation
  // User's parameters will be stored here, eg. Run Account withNumber 12345 will have the
  // Arguments = {1234}
  var _arguments : List<Argument> as Arguments

  construct()
  {
    _arguments = new ArrayList<Argument>()
  }

  /**
  * Get the user entered parameter. argName is declared by the @Param on the command method.
  * This value can also be accessed using Arguments[index], where index is the order of
  * the parameter declared on the command method.
  */
  function getArgument(argName : String) : String{
    return _arguments.firstWhere( \ a -> a.Name == argName ).asString()
  }
  
  /**
  * return the int param or if it is null, return a ramdom generated one
  */
  function getArgumentAsInt(argName : String) : int {
    return _arguments.firstWhere( \ a -> a.Name == argName ).asInt()
  }
  
  /**
  * return the string param or if it is null, return a ramdom generated one
  */
  function getArgumentAsString(argName : String) : String {
    return  _arguments.firstWhere( \ a -> a.Name.equalsIgnoreCase(argName) ).asString()
  }
  
  /**
  * return the bigDecimal param or if it is null, return a ramdom generated one
  */
  function getArgumentAsBigDecimal(argName : String) : BigDecimal {
    return _arguments.firstWhere( \ a -> a.Name == argName ).asBigDecimal()
  }
  
  /**
  * return the int param or if it is null, return a ramdom generated one
  */
  function getArgumentAsDate(argName : String) : Date {
    var d = _arguments.firstWhere( \ a -> a.Name == argName ).asDate()
    return d == null ? Date.CurrentDate : d
  }

  protected function displayMessage(message : String)
  {
    LocationUtil.addRequestScopedInfoMessage(message)
  }  

  protected function getVariableOfType<R>(variableType : Type<R>) : R {
    var name = TopLocation.Variables.toList().firstWhere( \ v -> v.Type == variableType ).Name
    return TopLocation.getPropertyValue(name) as R
  }
  
  protected function runWithNewBundle<T>(runner : block(bundle : Bundle) : T) : T{
    var result : T
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      result = runner(bundle)
    } )
    return result
  }
}
