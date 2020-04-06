package gw.contact
uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo

/**
 * Matches AddlInterestDetails based on the ContractNumber, AdditionalInterestType and PolicyAddlInterest contact.
 * Subtypes of this class must implement CoveredInterestColumns, which specifies the item related to a particular
 * AdditionalInterestDetail - for example, the link to a PersonalVehicle for a PAVhcleAdditionalInterest
 */
@Export
abstract class AbstractAddlInterestDetailMatcher<D extends AddlInterestDetail> extends AbstractEffDatedPropertiesMatcher<D> {
  construct(detail : D) {
    super(detail)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {D.Type.TypeInfo.getProperty("ContractNumber") as IEntityPropertyInfo,
            D.Type.TypeInfo.getProperty("AdditionalInterestType") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    var parentCols = CoveredInterestColumns
    parentCols.add(D.Type.TypeInfo.getProperty("PolicyAddlInterest") as ILinkPropertyInfo)
    return parentCols
  }
  
  abstract property get CoveredInterestColumns() : List<ILinkPropertyInfo>
}