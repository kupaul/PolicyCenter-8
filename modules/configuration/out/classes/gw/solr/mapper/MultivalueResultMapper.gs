package gw.solr.mapper

uses gw.xsd.config.solr_search_config.ResultField
uses gw.xsd.config.solr_search_config.DataProperty
uses gw.solr.utils.PLSolrUtils

@Export
class MultivalueResultMapper extends Copy implements ISolrQueryResultMapper{

  override function mapSortColumn(resultFields : List<ResultField>, criteriaProperties : List<DataProperty>, dataHolder : IDataHolder) : String {
    return super.mapSortColumn(resultFields, criteriaProperties, dataHolder)
  }

  override function mapQueryResult(resultFields : List<ResultField>, criteriaProperties : List<DataProperty>, dataHolder : IDataHolder, solrResult : IResultHolder) : Object {
    PLSolrUtils.validate(resultFields.Count == 1, "Multivalue result mapper supports only a single target field.")
    
    var returnedValue : Object = solrResult.lookup<List>(resultFields.get(0))
    if(returnedValue == null) {
      var scalarValue = super.mapQueryResult(resultFields, criteriaProperties, dataHolder, solrResult)
      if(scalarValue != null && !(scalarValue typeis String && scalarValue.Empty)) {
        returnedValue = { scalarValue }
      }
    }
    return returnedValue
  }
}
