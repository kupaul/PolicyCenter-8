package gw.lob.pa.mvr
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class PolicyDriverMVRCopier extends AbstractEffDatedCopyable<PolicyDriverMVR> {

  construct(mvr : PolicyDriverMVR) {
    super(mvr)
  }

  override function copyBasicFieldsFromBean(p0 : PolicyDriverMVR) {
    // nothing to do
  }

}
