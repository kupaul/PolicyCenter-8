package gw.contact
uses gw.search.EntityQueryBuilder
uses gw.api.database.ISelectQueryBuilder

@Export
class OfficialIDQueryBuilder extends EntityQueryBuilder<OfficialID> {

  var _value : String
  var _type : OfficialIDType
  var _state : Jurisdiction
  
  function withValue(value : String) : OfficialIDQueryBuilder {
    _value = value
    return this
  }
  
  function withType(value : OfficialIDType) : OfficialIDQueryBuilder {
    _type = value
    return this
  }
  
  function withState(value : Jurisdiction) : OfficialIDQueryBuilder {
    _state = value
    return this
  }
  
  override function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_value.NotBlank)  {
      selectQueryBuilder.compare(OfficialID#OfficialIDValue.PropertyInfo.Name, Equals, _value)
    }
    if (_type != null) {
      selectQueryBuilder.compare(OfficialID#OfficialIDType.PropertyInfo.Name, Equals, _type)
    }
    if (_state != null) {
      selectQueryBuilder.compare(OfficialID#State.PropertyInfo.Name, Equals, _state)
    }
  }

}
