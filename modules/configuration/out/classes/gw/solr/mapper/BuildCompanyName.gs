package gw.solr.mapper
uses gw.xsd.config.solr_search_config.DataProperty
uses gw.solr.utils.PCSolrUtils

@Export
class BuildCompanyName implements ISolrIndexMapper{

  static function mapRoleToCompanyName(role : PolicyContactRole) : String {
    return role.CompanyName  
  }

  override function mapIndex(inputDataProperties : List<DataProperty>, dataHolder : IDataHolder) : String {
    PCSolrUtils.validate(inputDataProperties.Count == 1, "FullName mapper expects a single target field.")

    var role = dataHolder.lookup<PolicyContactRole>(inputDataProperties.get(0))
    
    if(role.ContactDenorm typeis Company){    
      return mapRoleToCompanyName(role)
    }
    return null
    
  }

}
