package gw.lob.wc

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.lob.AbstractClassCodeSearchCriteria

@Export
class WCClassCodeSearchCriteria extends AbstractClassCodeSearchCriteria<WCClassCode> {

  var _classification: String as Classification
  var _domain: String as Domain
  var _classIndicator : String as ClassIndicatior
  
  override protected function constructBaseQuery() : Query<WCClassCode> {
    var query = new Query<WCClassCode>( WCClassCode )

    if( this.Classification != null ) {
      query.contains( WCClassCode.Type.TypeInfo.getProperty( "Classification" ) as String, this.Classification, true )
    }
    if( _domain != null ) {
      query.compare( WCClassCode.Type.TypeInfo.getProperty( "WCDomain" ) as String, Relop.Equals, _domain )
    }  
    if (_classIndicator != null) {
      query.compare( WCClassCode.Type.TypeInfo.getProperty( "ClassIndicator" ) as String, Relop.Equals, _classIndicator )  
    }
    return query
  }
  
}
