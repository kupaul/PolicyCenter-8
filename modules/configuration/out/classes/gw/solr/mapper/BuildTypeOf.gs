package gw.solr.mapper
uses gw.xsd.config.solr_search_config.DataProperty
uses gw.solr.utils.PLSolrUtils

@Export
class BuildTypeOf implements ISolrIndexMapper {
  
  static function mapType(j : Job) : String {
    return (j == null ? "" : j.Subtype.Code)
  }

  override function mapIndex(inputDataProperties : List<DataProperty>, dataHolder : IDataHolder) : String {
    PLSolrUtils.validate(inputDataProperties.Count == 1, "TypeOf mapper only supports a single target field.")
    var iJob = dataHolder.lookup<Job>(inputDataProperties.get(0)) 
    return mapType(iJob)
  }

}
