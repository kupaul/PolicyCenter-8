package gw.solr.mapper
uses gw.xsd.config.solr_search_config.DataProperty
uses org.json.simple.JSONArray
uses gw.solr.utils.PCSolrUtils
uses gw.api.util.PhoneUtil

/**
 * Builds the phones index field for a person or company
 * TODO remove this custom mapper and use the default phone mapper
 * when solr platform supports multiple index roots
 */
@Export
class BuildPNIPhones implements ISolrIndexMapper {

  override function mapIndex(inputDataProperties : List<DataProperty>, dataHolder : IDataHolder) : JSONArray{
    PCSolrUtils.validate(inputDataProperties.Count == 1, "PNIPhone mapper expects a single target field.")
    
    var contact = dataHolder.lookup<Contact>(inputDataProperties[0])

    var phoneList = new JSONArray()
    for (phone in extractPhones(contact)) {
      if (phone != null && phone.length() > 0) {
        phoneList.add(phone)
      }
    }
    return phoneList.size() > 0 ? phoneList : null

  }
  
  static function extractPhones(contact : Contact) : List<String>{
    
    var phones : List<String> = {}    
    if (contact != null) {
      if (contact.FaxPhone.HasContent) {
        phones.add(contact.FaxPhone)
      }
      if (contact.WorkPhone.HasContent) {
        phones.add(contact.WorkPhone)
      }
      if (contact.HomePhone.HasContent) {
        phones.add(contact.HomePhone)
      }
      if (contact typeis Person and contact.CellPhone.HasContent) {
        phones.add(contact.CellPhone)
      }
    }
    return phones    
    
  }
  

}
