package gw.rating.impact

uses gw.api.database.EmptyQuery
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.productmodel.Product
uses gw.lang.Export
uses java.io.Serializable
uses java.lang.String
uses java.util.Date
uses typekey.Jurisdiction
uses gw.api.database.InOperation
uses gw.api.database.Relop
uses java.util.Arrays

/**
 * The ImpactTestingSearchCriteria is used to select a set of policy periods for running rating impact testing on.
 */
@Export
class ImpactTestingSearchCriteria implements Serializable {

  // IMPORTANT: each publicly settable property of this class must have a setter that updates _changedSinceLastQuery.
  var _products : Product[] as Products = {}
  var _jurisdictions : Jurisdiction[] as Jurisdictions = {}
  var _searchOnPostalCodeList : boolean as SearchOnPostalCodeList  // If true, use the list, if false, search on range
  var _postalCodesList : String as PostalCodesList
  var _postalCodeRangeMin : String as PostalCodeRangeMin
  var _postalCodeRangeMax : String as PostalCodeRangeMax
  var _useStartsWithForPostalCodes : boolean as UseStartsWithForPostalCodes = true
  var _producerCodes : ProducerCode[] as ProducerCodes = {}
  var _effectiveDateMin : Date as EffectiveDateMin
  var _effectiveDateMax : Date as EffectiveDateMax
  var _expirationDateMin : Date as ExpirationDateMin
  var _expirationDateMax : Date as ExpirationDateMax
  var _inForceOnDate : Date as InForceOnDate
  
  var _postalCodes : String[]
  var _resultContainer : List<IQueryBeanResult<PolicyPeriod>> // List of size one, allows passing the results back to the screen via this argument

  var _changedSinceLastQuery : boolean as readonly ChangedSinceLastQuery

  construct() {
    this({new EmptyQuery<PolicyPeriod>(PolicyPeriod).select()})
  }

  construct(container : List<IQueryBeanResult<PolicyPeriod>>) {
    UseStartsWithForPostalCodes = true
    _resultContainer = container
    _resultContainer[0] = new EmptyQuery<PolicyPeriod>(PolicyPeriod).select()
  }

  property set Products(p : Product[]) {
    if (p.toSet().disjunction(_products.toSet()).HasElements) _changedSinceLastQuery = true
    _products = p
  }

  property set Jurisdictions(j : Jurisdiction[]) {
    if (j.toSet().disjunction(_jurisdictions.toSet()).HasElements) _changedSinceLastQuery = true
    _jurisdictions = j
  }

  property set SearchOnPostalCodeList(b : boolean) {
    if (b != _searchOnPostalCodeList) _changedSinceLastQuery = true
    _searchOnPostalCodeList = b
  }

  property set PostalCodesList(l : String) {
    if (l != _postalCodesList) _changedSinceLastQuery = true
    _postalCodesList = l
  }

  property set PostalCodeRangeMin(m : String) {
    if (m != _postalCodeRangeMin) _changedSinceLastQuery = true
    _postalCodeRangeMin = m
  }

  property set PostalCodeRangeMax(m : String) {
    if (m != _postalCodeRangeMax) _changedSinceLastQuery = true
    _postalCodeRangeMax = m
  }

  property set UseStartsWithForPostalCodes(b : boolean) {
    if (b != _useStartsWithForPostalCodes) _changedSinceLastQuery = true
    _useStartsWithForPostalCodes = b
  }

  property set ProducerCodes(c : ProducerCode[]) {
    if (c.toSet().disjunction(_producerCodes.toSet()).HasElements) _changedSinceLastQuery = true
    _producerCodes = c
  }

  property set EffectiveDateMin(d : Date) {
    if (d != _effectiveDateMin) _changedSinceLastQuery = true
    _effectiveDateMin = d
  }

  property set EffectiveDateMax(d : Date) {
    if (d != _effectiveDateMax) _changedSinceLastQuery = true
    _effectiveDateMax = d
  }

  property set ExpirationDateMin(d : Date) {
    if (d != _expirationDateMin) _changedSinceLastQuery = true
    _expirationDateMin = d
  }

  property set ExpirationDateMax(d : Date) {
    if (d != _expirationDateMax) _changedSinceLastQuery = true
    _expirationDateMax = d
  }

  property set InForceOnDate(d : Date){
    if (d != _inForceOnDate) _changedSinceLastQuery = true
    _inForceOnDate = d
  }


  /** Creates a query based on the search parameters.  Only the most recent model of a
   * particular policy term is included in the result set
   *
   * For each of the search parameters, this method also creates a descriptive string.
   *
   * @return The query
   */
  public function createQuery() : Query<PolicyPeriod>{
    var policyPeriodQuery = Query.make(PolicyPeriod)

    // can only do Impact Testing on periods that are not archived
    policyPeriodQuery.compare("ArchiveState", Equals, null)

    policyPeriodQuery.compare("CancellationDate", Equals, null)

    policyPeriodQuery.compare("MostRecentModel", Equals, true)
    policyPeriodQuery.withDistinct(true)

    if (Products.HasElements){
      policyPeriodQuery.join("Policy").compareIn("ProductCode", Products*.Code )
    }

    if (Jurisdictions.HasElements){
      policyPeriodQuery.compareIn("BaseState", Jurisdictions )
    }

    if (ProducerCodes.HasElements){
      policyPeriodQuery.join("ProducerCodeOfRecord").compareIn("Code", ProducerCodes*.Code )
    }

    parsePostalCodes()
    if (_postalCodes.HasElements && SearchOnPostalCodeList){
      // Don't use Joins between EffDated Tables, but use sub-select instead
      var EffectiveDatedFieldsTable = policyPeriodQuery.subselect("ID", InOperation.CompareIn, EffectiveDatedFields, "BranchValue");
      // Use only EffectiveDatedFields from PeriodStart (EffectiveDate = NULL) - this can be updated to join properly if necessary
      EffectiveDatedFieldsTable.compare("EffectiveDate", Relop.Equals, null)
      var primaryLocationTable = EffectiveDatedFieldsTable.subselect("PrimaryLocation", InOperation.CompareIn, PolicyLocation, "Fixed");
      // Use only PrimaryLocation from PeriodStart (EffectiveDate = NULL) - this can be updated to join properly if necessary
      primaryLocationTable.compare("EffectiveDate", Relop.Equals, null)
      primaryLocationTable.compare("BranchValue", Relop.Equals, policyPeriodQuery.getColumnRef("ID"))
      if( UseStartsWithForPostalCodes ){
        primaryLocationTable.or(\ restriction -> {
          _postalCodes.each(\ p -> {
            restriction.startsWith("PostalCodeInternal", p, true )
          })
        })
      } else {
        primaryLocationTable.compareIn("PostalCodeInternal", _postalCodes )
      }
    } else if (!SearchOnPostalCodeList && (PostalCodeRangeMin != null || PostalCodeRangeMax != null)){
      // Don't use Joins between EffDated Tables, but use sub-select instead
      var EffectiveDatedFieldsTable = policyPeriodQuery.subselect("ID", InOperation.CompareIn, EffectiveDatedFields, "BranchValue");
      // Use only EffectiveDatedFields from PeriodStart (EffectiveDate = NULL) - this can be updated to join properly if necessary
      EffectiveDatedFieldsTable.compare("EffectiveDate", Relop.Equals, null)
      var primaryLocationTable = EffectiveDatedFieldsTable.subselect("PrimaryLocation", InOperation.CompareIn, PolicyLocation, "Fixed");
      // Use only PrimaryLocation from PeriodStart (EffectiveDate = NULL) - this can be updated to join properly if necessary
      primaryLocationTable.compare("EffectiveDate", Relop.Equals, null)
      primaryLocationTable.compare("BranchValue", Relop.Equals, policyPeriodQuery.getColumnRef("ID"))
      if (PostalCodeRangeMin != null){
        primaryLocationTable.compare("PostalCodeInternal", GreaterThanOrEquals, PostalCodeRangeMin)
      }
      if (PostalCodeRangeMax != null){
        primaryLocationTable.compare("PostalCodeInternal", LessThanOrEquals, PostalCodeRangeMax)
      }
    }

    if (EffectiveDateMin != null){
      policyPeriodQuery.compare("PeriodStart", GreaterThanOrEquals, EffectiveDateMin)
    }

    if (EffectiveDateMax != null){
      policyPeriodQuery.compare("PeriodStart", LessThanOrEquals, EffectiveDateMax)
    }

    if (ExpirationDateMin != null){
      policyPeriodQuery.compare("PeriodEnd", GreaterThanOrEquals, ExpirationDateMin)
    }

    if (ExpirationDateMax != null){
      policyPeriodQuery.compare("PeriodEnd", LessThanOrEquals, ExpirationDateMax)
    }

    if (InForceOnDate != null){
      policyPeriodQuery.compare("PeriodStart", LessThanOrEquals, InForceOnDate)
      policyPeriodQuery.compare("PeriodEnd", GreaterThanOrEquals, InForceOnDate)
    }

    return policyPeriodQuery
  }


  /** Creates and executes a query
   *
   * @return The result set
   */
  function search() : PolicyPeriodQuery {
    var resultSet = createQuery().withLogSQL(true).select()
    _resultContainer[0] = resultSet // Populate the ResultContainer with the resultSet so that it can be passed back via the constructor argument to the screen.
    _changedSinceLastQuery = false
    return resultSet
  }

  private function parsePostalCodes() {
    if( PostalCodesList != null && PostalCodesList.HasContent ){
      _postalCodes = PostalCodesList.split(",")
      _postalCodes.eachWithIndex(\ s, i -> { _postalCodes[i] = s.trim() })
      _postalCodes = _postalCodes.subtract(_postalCodes.where(\ s -> s.length == 0)).toTypedArray()
    }
    else {
      _postalCodes = {}
    }
  }

  /**
  * used in ImpactTestingTestCaseEnhancement to set DB paging in ImpactTestingTestCase##populatePeriods
  * set to -1 to disable paging or another value to optimize populatePeriods performance
  **/
  public static function getImpactTestingPageSize() : int {
    return -1
  }
}