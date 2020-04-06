package gw.account

uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses gw.api.productmodel.Product
uses gw.api.util.CoreFilters
uses java.util.ArrayList
uses gw.api.productmodel.ProductLookup

/**
 * A set of filters for restricting query results by product code.
 */
@Export
class ProductCodeFilterSet {
  
  private var _productCodeFilters : BeanBasedQueryFilter[] 
  private var _accounts : Account[]
  
  public construct() {
   _accounts = null
  }
 
  public construct(accounts : Account[]) {
   _accounts = accounts
  }
 

  public construct(account : Account) {
   _accounts = new Account[1]
   _accounts[0] = account
  }
 
  /**
   * @return the filter that is used for getting all elements of the appropriate type.
   */ 
  static function getAllFilter() : BeanBasedQueryFilter {
    return CoreFilters.ALL  
  }

  /**
   * @return an array of filters, each of which restricts according to one product code.
   */  
  function getClaimPolicyPeriodFilters() : BeanBasedQueryFilter[]  {
    if (_productCodeFilters == null) {
      _productCodeFilters = constructProductCodeFilters()
    }
    return _productCodeFilters
  }
  
  //
  // PRIVATE SUPPORT METHODS
  //
  private function constructProductCodeFilters() :  BeanBasedQueryFilter[] {
    var filters = new ArrayList<ProductCodeFilter>()
    var uniqueProducts = new ArrayList<Product>()
    
    if (_accounts!=null) {
      for (policy in _accounts*.Policies) {
        var product = policy.Product
        if (product != null && 
            uniqueProducts.firstWhere(\ p -> p.Code == product.Code) == null) {
          uniqueProducts.add(product)
        }
      }
    } else {
      uniqueProducts.addAll(ProductLookup.getAll())
    }
    
    var products = uniqueProducts.sortBy(\ p -> p.DisplayName)
    for (product in products) {
      filters.add(new ProductCodeFilter(product))
    }
    return filters.toArray(new BeanBasedQueryFilter[filters.Count])  
  }
}
