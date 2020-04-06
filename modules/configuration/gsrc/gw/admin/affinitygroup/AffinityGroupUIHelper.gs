package gw.admin.affinitygroup

uses gw.api.util.DisplayableException

@Export
class AffinityGroupUIHelper {
  /**
   * Adds the given {@link AffinityGroupProducerCode} to the {@link AffinityGroup}
   *
   * @param group - the affinity group to use.
   * @param affinityGroupProducerCode - the affinity group producer code to add.
   */
  static function addAffinityGroupProducerCode(group : AffinityGroup, affinityGroupProducerCode : AffinityGroupProducerCode) {
    if (affinityGroupProducerCode == null) {
      return
    }
    affinityGroupProducerCode.AffinityGroup = group
    group.addToAffinityGroupProducerCodes(affinityGroupProducerCode) 
  }  

  /**
   * Creates a new {@link AffinityProducerCode} if the {@link ProducerCode} does not already have an affinity group
   * that's equal to the passed in {@link AffinityGroup}
   *
   * @param group - the affinity group to use.
   * @param affinityGroupProducerCode - the producer code to add.
   * @return {@link AffinityGroupProducerCode} - the newly created affinity group producer code
   */
  @Throws(DisplayableException, "If the producer code already exists")
  static function createAffinityGroupProducerCode(group : AffinityGroup, producerCode : ProducerCode) : AffinityGroupProducerCode {
    // Check that the producer code's affinity groups are not already assigned to the passed in group
    if (producerCode == null or group == null) {
      return null
    }
    
    if (producerCode.AffinityGroupProducerCodes.hasMatch(\ code -> code.AffinityGroup == group)) {
      throw new DisplayableException(displaykey.Web.Admin.ProducerCodeExists(producerCode.Code))
    }

    // Create a new affinity group producer code, and assign it to the passed in group as well as adding it to the
    // list of producer codes
    var affinityGroupProducerCode = new AffinityGroupProducerCode()
    affinityGroupProducerCode.AffinityGroup = group
    producerCode.addToAffinityGroupProducerCodes(affinityGroupProducerCode)
    
    return affinityGroupProducerCode
  }

  /**
   * Removes the given {@link AffinityGroupProducerCode} from the {@link ProducerCode}
   *
   * @param group - the group to use.
   * @param affinityGroupProducerCode - the {@link AffinityGroupProducerCode} to remove.
   */
  static function remove(group : AffinityGroup, affinityGroupProducerCode : AffinityGroupProducerCode) {
    if (group == null or affinityGroupProducerCode == null) {
      return
    }
    var producerCode = affinityGroupProducerCode.getProducerCode()
    producerCode.removeFromAffinityGroupProducerCodes(affinityGroupProducerCode)
    group.removeFromAffinityGroupProducerCodes(affinityGroupProducerCode)
  }

  /**
   * Adds the given product to the {@link AffinityGroup}
   *
   * @param group - the affinity group to use.
   * @param productCode - the product code to add.
   */
  static function addNewProductToAffinityGroup(group : AffinityGroup, productCode : String) : AffinityGroupProduct {
    if (group.Products.hasMatch(\ w -> w.ProductCode == productCode)) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Admin.AffinityGroupDetail.Products.Error.AlreadyExists(productCode))
    }
    var agp = new AffinityGroupProduct()
    agp.ProductCode = productCode
    group.addToProducts(agp)
    return agp
  }
  /**
  * Checks that the given jurisdiction doesn't not already exists on affinity group
  *
  * @param group - the affinity group to check.
  */
  static function checkDuplicateJurisdictions(group : AffinityGroup) {
    var errorMessages : List<String> = {}
    // Check that the given jurisdiction doesn't not already exists on affinity group
    group.Jurisdictions
        .partition(\ jur -> "${jur.Jurisdiction}")
        .filterByValues(\ l -> l.Count > 1)
        .eachValue(\ dup -> {
      errorMessages.add(displaykey.Web.Admin.JurisdictionExists(dup.first().Jurisdiction.Description))
    })
    if (not errorMessages.Empty) {
      throw new gw.api.util.DisplayableException(errorMessages.toTypedArray())
    }
  }

  /**
   * Creates an affinity group search criteria and populates default criteria using the given period
   *
   * @param period - the policy period for which an affinity group is being searched for.
   * @return affinity group search criteria with Organization, ProducerCode, Product, Start date, End date and Jurisdiction criteria set
   * using the given period.
   */
  static function createAffinityGroupSearchCriteria(period : PolicyPeriod) : AffinityGroupSearchCriteria {
    var criteria = new gw.admin.affinitygroup.AffinityGroupSearchCriteria()
    criteria.Organization = period.ProducerOfRecord.Name
    criteria.ProducerCode = period.ProducerCodeOfRecord.Code
    criteria.Product = period.Policy.Product
    criteria.AffinityGroupStartDate = period.PeriodStart
    criteria.AffinityGroupEndDate = period.PeriodEnd
    criteria.Jurisdiction = period.BaseState
    return criteria
  }
  /**
  * Gives the organization to restrict producer code search by
  *
  * @return - organization of affinity group if the group is closed, otherwise <code>null</code>
  */
  static function getOrganizationToRestrictProducerCodeSearch(group : AffinityGroup) : Organization {
    if (group.AffinityGroupType == AffinityGroupType.TC_CLOSED) {
      return group.Organization
    }
    return null
  }
}
