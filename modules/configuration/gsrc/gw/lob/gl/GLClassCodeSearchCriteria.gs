package gw.lob.gl

uses gw.api.database.Query
uses gw.lob.AbstractClassCodeSearchCriteria

@Export
class GLClassCodeSearchCriteria extends AbstractClassCodeSearchCriteria<GLClassCode> {

  var _classification : String as Classification
 
  override function constructBaseQuery() :  Query<GLClassCode> {
    var query = new Query<GLClassCode>(GLClassCode)
    if (Classification != null) {
      query.contains("Classification", Classification, true)
    }
    return query  
  }
  
}
