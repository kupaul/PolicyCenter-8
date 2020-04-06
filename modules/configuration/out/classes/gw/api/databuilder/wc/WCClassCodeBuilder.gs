package gw.api.databuilder.wc

uses gw.api.databuilder.DataBuilder
uses java.util.Date

@Export
class WCClassCodeBuilder extends DataBuilder<WCClassCode, WCClassCodeBuilder> {
  
  construct() {
    super( WCClassCode )   
    withCode( org.apache.commons.lang.RandomStringUtils.randomAlphanumeric(5) )
    withEffectiveDate( Date.createDateInstance( 1, 1, 2000 ) )
    withDomain( "NCCI" )
  }

  final function withCode( code : String ) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "Code" ), code )
    return this
  }

  final function withEffectiveDate( effDate : Date) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "EffectiveDate" ), effDate )
    return this
  }

  final function withDomain( domain : String) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "WCDomain" ), domain )
    return this
  }

  function withExpirationDate( expDate : Date ) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "ExpirationDate" ), expDate )
    return this
  }

  function withClassification( classification : String ) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "Classification" ), classification )
    return this
  }

  function withClassIndicator( indicator : String ) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "ClassIndicator" ), indicator )
    return this
  }

  function withBasis( basis : ClassCodeBasis ) : WCClassCodeBuilder {
    set( WCClassCode.Type.TypeInfo.getProperty( "Basis" ), basis )
    return this
  }
}