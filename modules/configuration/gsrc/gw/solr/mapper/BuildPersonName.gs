package gw.solr.mapper
uses gw.xsd.config.solr_search_config.DataProperty
uses gw.solr.utils.PCSolrUtils

@Export
class BuildPersonName implements ISolrIndexMapper{

  // IMPT: if we have a synonym analyzer that wants a delimiter, must insert it here.
  static function mapRoleToFullName(role : PolicyContactRole) : String {
    return role.FirstName + " " + role.LastName
  }

  override function mapIndex(inputDataProperties : List<DataProperty>, dataHolder : IDataHolder) : String {
    PCSolrUtils.validate(inputDataProperties.Count == 1, "FullName mapper expects a single target field.")

    var role = dataHolder.lookup<PolicyContactRole>(inputDataProperties.get(0))

    if(role.ContactDenorm typeis Person){
      return mapRoleToFullName(role)
    }
    return null

  }

}
