package gw.productmodel
uses gw.api.database.Query
uses gw.product.ProductConfig

enhancement ProductEnhancement : gw.api.productmodel.Product {
  
  function isContactTypeSuitableForProductAccountType(contactType : Type<Contact>) : boolean {
    switch(this.ProductAccountType) {
      case("Any")     : return true
      case("Company") : return Company.Type.isAssignableFrom(contactType)
      case("Person")  : return Person.Type.isAssignableFrom(contactType)
      default : throw displaykey.Web.Contact.Error.UnknownProductAccountType(this.ProductAccountType)
    }
  }

  /** 
   *  Returns all the FormPatterns associated with this product
   */
  property get FormPatterns() : List<FormPattern> {
    var q = Query.make(FormPattern)
    q.compare("PolicyLinePatternCode", Equals, null)
    q.subselect("ID", CompareIn, FormPatternProduct, "FormPattern").compare("ProductCode", Equals, this.Code)
    return q.select().toList()
  }
  
  /**
   * Returns the FormPattern with the specified code associated with this product, or
   * null if no such match is found
   */
  function getFormPattern(code : String) : FormPattern {
    var q = Query.make(FormPattern)
    q.compare("PolicyLinePatternCode", Equals, null)
    q.compare("Code", Equals, code)
    q.subselect("ID", CompareIn, FormPatternProduct, "FormPattern").compare("ProductCode", Equals, this.Code)
    return q.select().FirstResult
  }
  
  /**
   * Finds the DiffTree.xml for the product. Must create the DiffTree in 
   * pc\config\resources\diff and must be called &lt;Product.Abbreviation>DiffTree.xml 
   * where &lt;Product.Abbreviation> is the abbreviation for the product. 
   * @return Name of the file to use for the difference tree configuration, or <code>null</code> if none exists.
   */
  property get DiffTreeConfig() : String {
    return ProductConfig.getDiffTreeConfig(this)
  }

  /**
   * All products are capable of supporting a quick quote that minimally reduces the quote steps,
   * but not all products are configured to allow a truly "quick" quick quote that dramatically
   * reduces the number of wizard steps and level of data validation for obtaining a quote.
   */
  property get QuickerQuickQuoteAllowed() : boolean {
    return ProductConfig.getQuickerQuickQuoteAllowed(this)
  }

  /**
   * Determines if the product is a personal product (e.g. PersonalAuto).
   */
  property get Personal() : boolean {
    return this.ProductType == ProductType.TC_PERSONAL
  }

  /**
   * Determines if the product is a commercial product (e.g. CommercialAuto).
   */
  property get Commercial() : boolean {
    return this.ProductType == ProductType.TC_COMMERCIAL
  }
}
