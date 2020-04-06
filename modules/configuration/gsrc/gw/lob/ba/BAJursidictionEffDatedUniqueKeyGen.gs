package gw.lob.ba
uses gw.api.effdate.AbstractEffDatedUniqueKeyGen
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

@Export
/**
 * This class checks for unique key violations for BAJurisdictions
 * By default, no two jurisdictions should exist for the same state.
 */
class BAJursidictionEffDatedUniqueKeyGen extends AbstractEffDatedUniqueKeyGen<BAJurisdiction> {

  construct(baj : BAJurisdiction) {
    super(baj)
  }

  override property get IdentityProperties() : Iterable<IEntityPropertyInfo> {
    return {BAJurisdiction.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo}
  }

  override function getErrorMessageStronglyTyped(duplicateBeans : BAJurisdiction[]) : String {
    return displaykey.Web.Policy.PolicyLine.Validation.Duplicate(BAJurisdiction.Type.DisplayName, _effDatedBean)
  }

}
