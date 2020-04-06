package gw.api.web.producer

uses gw.api.database.IQueryBeanResult
uses gw.api.system.PLDependenciesGateway
uses gw.api.database.ISelectQueryBuilder

enhancement ProducerUtilEnhancement : gw.api.web.producer.ProducerUtil {

 /**
  * Gets the list of available ProducerCodes based on the agency selection.
  * @param agency Organization from which to get producer code range from
  * @param use If non-null, use ProducerStatusUse when querying
  */
  public static function getProducerCodeRange(agency : Organization,
                                              use : ProducerStatusUse) : IQueryBeanResult<ProducerCode> {
    return getProducerCodeRange(agency, use, false)
  }

/**
 * Gets the list of available ProducerCodes based on the agency selection
 * @param agency Organization from which to get producer code range from
 * @param use If non-null, use ProducerStatusUse when querying
 * @param createAccountSecurity (optional) if true, check for create account permission when filtering producer codes
 */
  public static function getProducerCodeRange(agency : Organization,
                                              use : ProducerStatusUse,
                                              createAccountSecurity : boolean) : IQueryBeanResult<ProducerCode> {
    var user = PLDependenciesGateway.getCommonDependencies().getCurrentUser()
    var producerCodeQueryBuilder =  new gw.product.ProducerCodeQueryBuilder()

    producerCodeQueryBuilder
      .withSecure(user.UseProducerCodeSecurity)
      .withCreateAccountSecurity(createAccountSecurity)
      .withStatusUse(use)
      .withProducer(agency)

    var producerCodesQuery = producerCodeQueryBuilder.build() as ISelectQueryBuilder<ProducerCode>
    return producerCodesQuery.select().orderBy(\pc -> pc.Code) as IQueryBeanResult<ProducerCode>
  }
}
