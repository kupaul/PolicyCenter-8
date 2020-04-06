package gw.contact

uses gw.entity.ILinkPropertyInfo

/**
 * Generic implementation of {@link AbstractAddlInterestDetailMatcher}.  This implementation does not specify
 * a Covered Interest FK, and thus should never be used as implementation for a concrete subclass of
 * AddlInterestDetail.  It is used as a placeholder to require concrete subclasses to support the 
 * {@link EffDatedLogicalMatcher} interface.
 */
@Export
class AddlInterestDetailMatcher extends AbstractAddlInterestDetailMatcher<AddlInterestDetail>{
  
  construct(detail : AddlInterestDetail) {
    super(detail)
  }

  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {}
  }
  
}
