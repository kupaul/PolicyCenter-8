package gw.systables
uses gw.api.database.Query

enhancement MVRConfigEnhancement : entity.MVRConfig {
  
  static function executeSearch(jurisdiction: Jurisdiction, uwCompany: UWCompanyCode): MVRConfig{
    var mvrConfigQuery =  Query.make(MVRConfig)
    var config: MVRConfig
    
    mvrConfigQuery.and(\ r -> {
      r.or(\ restriction -> {
        restriction.compare("Jurisdiction", Equals, jurisdiction)
        restriction.compare("Jurisdiction", Equals, null)
      })
      r.or(\ restriction -> {
        restriction.compare("UWCompanyCode", Equals, uwCompany)
        restriction.compare("UWCompanyCode", Equals, null)
      })
    })
    
    var mvrConfigs = mvrConfigQuery.select()
    switch(mvrConfigs.Count){
      case 1: 
        // only the default - get it
        config = mvrConfigs.FirstResult 
        break
      case 2:
        // only the default and another one - get the other one
        config = mvrConfigs.toCollection().firstWhere(\ m -> m.Jurisdiction == jurisdiction or m.UWCompanyCode == uwCompany)
        break
      default:
        // try to get the most specific config (for both jurisdiction and uw)
        config = mvrConfigs.toCollection().firstWhere(\ m -> m.Jurisdiction == jurisdiction and m.UWCompanyCode == uwCompany)
        if(config == null){
          // try to get the specific config for the jurisdiction
          config = mvrConfigs.toCollection().firstWhere(\ m -> m.Jurisdiction == jurisdiction)
        }
    }
    
    return config
  }
}
