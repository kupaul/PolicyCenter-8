package gw.lob.wc
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class WCJurisdictionCopier extends AbstractEffDatedCopyable<WCJurisdiction> {

  construct(jurisdiction : WCJurisdiction) {
    super(jurisdiction)
  }

  override function copyBasicFieldsFromBean(p0 : WCJurisdiction) {
    // nothing to do
  }

}
