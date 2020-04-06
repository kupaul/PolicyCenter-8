package gw.product

uses gw.lang.Deprecated
uses gw.product.ProducerCodeQueryBuilder
uses gw.api.database.IQueryBeanResult
uses gw.address.AddressQueryBuilder

@Deprecated("Used in PolicyCenter 8.0 to bridge the old deprecated ProducerCodeFinder implementation to the new ProducerCodeSearchCriteria.")
@Export
class ProducerCodeFinderLegacyBridge {

  static function findProducerCodesByCriteria(criteria : ProducerCodeSearchCriteria) : IQueryBeanResult<ProducerCode> { 
    var producerCodeQueryBuilder =  new gw.product.ProducerCodeQueryBuilder()
      .withSecure(criteria.Secure)
      .withFilterByUserSecurityZones(criteria.FilterByUserSecurityZones)
      .withCode(criteria.Code)
      .withDescription(criteria.Description)
      .withParentCode(criteria.ParentCode)
      .withBranchCode(criteria.BranchCode)
      .withMissingPrefUW(criteria.MissingPrefUW)
      .withStatus(criteria.Status)
      .withStatusUse(criteria.StatusUse)
      .withBranch(criteria.Branch)
      .withProducer(criteria.Producer)
      .withProducerUser(criteria.ProducerUser)
      .withPrefUW(criteria.PrefUW)
      
    if (criteria.City != null || criteria.Country != null || criteria.County != null || criteria.PostalCode != null || criteria.State != null) {
      var addressQueryBuilder = new AddressQueryBuilder()
        .withCity(criteria.City)
        .withCountry(criteria.Country)
        .withCounty(criteria.County)
        .withPostalCode(criteria.PostalCode)
        .withState(criteria.State)
      producerCodeQueryBuilder.withAddress(addressQueryBuilder)
    }
    return producerCodeQueryBuilder.build().select() as IQueryBeanResult<ProducerCode>
  }

}
