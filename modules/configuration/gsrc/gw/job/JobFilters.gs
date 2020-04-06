package gw.job
uses gw.api.productmodel.Product
uses gw.api.ui.DisplayedObject
uses java.util.Set

@Export
class JobFilters
{
  private construct() { }

  public static var AllStatusFilter : DisplayedObject<Boolean> = new DisplayedObject<Boolean>(
      \ -> displaykey.Web.Job.Filter.All,
      null
  )

  public static var OpenStatusFilter : DisplayedObject<Boolean> = new DisplayedObject<Boolean>(
      \ -> displaykey.Web.Job.Filter.Status.Open,
      false
  )

  public static var CompleteStatusFilter : DisplayedObject<Boolean> = new DisplayedObject<Boolean>(
      \ -> displaykey.Web.Job.Filter.Status.Complete,
      true
  )

  public static var StatusFilterSet : List<DisplayedObject<Boolean>> = {
      AllStatusFilter,
      OpenStatusFilter,
      CompleteStatusFilter
  }

  public static var AllJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( null )
  public static var SubmissionsJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_SUBMISSION )
  public static var CancellationsJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_CANCELLATION )
  public static var RenewalsJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_RENEWAL )
  public static var PolicyChangesJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_POLICYCHANGE )
  public static var ReinstatementsJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_REINSTATEMENT )
  public static var RewritesJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_REWRITE )
  public static var RewriteNewAccountJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_REWRITENEWACCOUNT )
  public static var AuditsJobsFilter : DisplayedObject<typekey.Job> = createJobTypeFilter( typekey.Job.TC_AUDIT )

  public static var JobTypeFilterSet : List<DisplayedObject<typekey.Job>> = {
      AllJobsFilter,
      SubmissionsJobsFilter,
      CancellationsJobsFilter,
      RenewalsJobsFilter,
      PolicyChangesJobsFilter,
      ReinstatementsJobsFilter,
      RewritesJobsFilter,
      RewriteNewAccountJobsFilter,
      AuditsJobsFilter
  }
  
  private static function createJobTypeFilter( jobType : typekey.Job ) : DisplayedObject<typekey.Job> {
    var display = \ -> displaykey.Web.Job.Filter.All
    if (jobType != null) {
      display = \ -> jobType.DisplayName
    }
    return new DisplayedObject<typekey.Job>( display, jobType )
  }

  public static var AllProductsFilter : DisplayedObject<gw.api.productmodel.Product> = new DisplayedObject<gw.api.productmodel.Product>(\ -> displaykey.Java.AccountFile.WorkOrders.Filter.AllProducts, null)
  
  public static function createProductFilterOptions(account : Account) : List<DisplayedObject<gw.api.productmodel.Product>> {
    var filterSet = new java.util.ArrayList<DisplayedObject<gw.api.productmodel.Product>>()
    filterSet.add(AllProductsFilter )
    for ( product in account.Policies*.Product.toSet().toList().sort() ) {
      var filterLabel = \ -> product.Name
      filterSet.add( new DisplayedObject<gw.api.productmodel.Product>( filterLabel, product) )
    }
    return filterSet
  }
    
  public static function createProductFilterOptions(contact : Contact) : List<DisplayedObject<gw.api.productmodel.Product>> {
    var filterSet = new java.util.ArrayList<DisplayedObject<gw.api.productmodel.Product>>()
    filterSet.add(AllProductsFilter )
    var productSet : Set<Product> = {}
    contact.AccountContacts.each(\ac -> {
      productSet.addAll(ac.Account.Policies*.Product.toSet())
    })
    var productList : List<Product> = productSet.toList().sort()
    for ( product in productList ) {
      var filterLabel = \ -> product.Name
      filterSet.add( new DisplayedObject<gw.api.productmodel.Product>( filterLabel, product) )
    }
    return filterSet
  }  
  
}
