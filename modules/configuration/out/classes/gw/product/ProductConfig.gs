package gw.product
uses gw.api.productmodel.Product

/**
 * Defines all the configuration necessary for a product that exists (currently) outside of the
 * productmodel itself.
 */
@Export
class ProductConfig {

  /**
   * Finds the DiffTree.xml for the product. Must create the DiffTree in
   * pc\config\resources\diff and must be called &lt;Product.Abbreviation>DiffTree.xml
   * where &lt;Product.Abbreviation> is the abbreviation for the product.
   * (e.g. CPPDiffTree.xml because CPP is the abbreviation for Commercial Package)
   * @param Product The product that we are trying to find the diff tree for.
   * @return Name of the file to use for the difference tree configuration, or <code>null</code> if none exists.
   */
  static function getDiffTreeConfig(product : Product) : String {    
    var productAbbrev = product.Abbreviation
    if (productAbbrev == null) {
      return null
    }
    return productAbbrev + "DiffTree.xml"
  }

  /**
   * At present only the PersonalAuto product has a truly quick quote with significantly reduced
   * wizard steps and data validation.
   * @param Product The product
   * @return Is this product capable of performing a "quicker" quick quote.
   */
  static function getQuickerQuickQuoteAllowed(product : Product) : boolean {
    return product == "PersonalAuto"
  }
  
}
