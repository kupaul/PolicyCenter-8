package gw.job
uses java.util.Set

@Export
class CopyDataVisibilityByProduct {

  private static final var ENABLED_PRODUCTS : Set<String> = {
    "PersonalAuto"
  }
  
  private construct() {
  }

  /**
   * Determines if the "Copy Data" button should be visible for the given product. 
   */
  static function isCopyDataVisibleForProduct(productCode : String) : boolean {
    return ENABLED_PRODUCTS.contains(productCode)
  }
}
