package gw.solr.mapper
uses gw.xsd.config.solr_search_config.DataProperty
uses gw.solr.utils.PLSolrUtils

@Export
class BuildOfficialIds implements ISolrIndexMapper {

  static function buildOfficialId(ids : OfficialID[]) : String {
    // Index only SSN and EIN. If both exist, return the EIN.
    var officialID : String = null
    for (id in ids) {
      if (id.OfficialIDType == OfficialIDType.TC_FEIN) {
        return id.OfficialIDValue
      } else if (id.OfficialIDType == OfficialIDType.TC_SSN) {
        officialID = id.OfficialIDValue
      }
    }
    return officialID
  }

  override function mapIndex(dataProperties : List<DataProperty>, dataHolder : IDataHolder) : String {
    PLSolrUtils.validate(dataProperties.Count == 1, "Official ID index mapper only supports a single target field.")
    var officialID = buildOfficialId(dataHolder.lookup<Contact>(dataProperties.get(0)).OfficialIDs)
    return officialID
  }
}
