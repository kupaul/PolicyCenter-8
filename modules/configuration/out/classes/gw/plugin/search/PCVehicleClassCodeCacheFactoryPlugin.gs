package gw.plugin.search;

uses gw.api.domain.VehicleClassCodeCacheState;
uses gw.api.domain.VehicleClassCodeSearchResult;
uses gw.pc.policy.typekey.VehicleType;
uses gw.pc.product.entity.VehicleClassCode;
uses gw.pc.product.entity.VehicleIndustryCode;
uses gw.plugin.InitializablePlugin;

uses java.util.List;
uses java.util.Map;

@Export
public class PCVehicleClassCodeCacheFactoryPlugin implements VehicleClassCodeCacheFactoryPlugin, InitializablePlugin {

  /**
   * Called during initialization of the VehicleClassCode cache and whenever the cache is stale and
   * a caller needs fresh data.
   * @param allCodes List of all vehicle class codes
   * @param industryCodeList List of all vehicle industry codes
   * @return returns cache state seeded with the contents of allCodes and industryCodeList
   */
  override public function createCacheState(allCodes : List<VehicleClassCode>, industryCodeList : List<VehicleIndustryCode>)
      : VehicleClassCodeCacheState  {
    var result = new VehicleClassCodeCacheState()

    // For now, we explicitly load all the VehicleIndustryCodes into an in-memory list.
    // The list is expected to be relatively small (~40 elements), and it is more
    // efficient to load the codes into memory once than to re-run the query on each
    // execution of the inner loop below.
    for (code in allCodes) {
      if (code.Type == TC_COMMERCIAL) {
        for (industryCode in industryCodeList) {
          result.add(createSearchResult(code, industryCode));
        }
      } else {
        result.add(createSearchResult(code, null));
      }
    }
    return result;
  }

  private function createSearchResult(classCode: VehicleClassCode, industryCode: VehicleIndustryCode)
      : VehicleClassCodeSearchResult {
    var cacheEntry = new VehicleClassCodeSearchResult()
    cacheEntry.setCode(classCode.getCode());
    cacheEntry.setExperience(classCode.getExperience());
    cacheEntry.setFleet(classCode.getFleet());
    cacheEntry.setPrimaryUse(classCode.getPrimaryUse());
    cacheEntry.setRadius(classCode.getRadius());
    cacheEntry.setSizeClass(classCode.getSizeClass());
    cacheEntry.setType(classCode.getType());
    if (industryCode != null) {
      cacheEntry.setCode(classCode.getCode() + industryCode.getCode());
      cacheEntry.setIndustry(industryCode.getIndustry());
      cacheEntry.setIndustryUse(industryCode.getIndustryUse());
    }
    return cacheEntry;
  }

  override function setParameters(params : Map) {
  }

}
